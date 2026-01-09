const db = require("../config/database");

const obtenerMovimientos = async (req, res) => {
  try {
    const [movimientos] = await db.query(`
           SELECT  
              RM.id_movimiento, 
              RM.id_lote, 
              RM.fecha_envio, 
              RM.fecha_recepcion,

              V.nombre_comercial AS vacuna,
              V.temp_min_c AS minimo,
              V.temp_max_c AS maximo, 

              UO.direccion AS origen,
              UO.latitud AS origen_latitud,
              UO.longitud AS origen_longitud,

              UD.direccion AS destino,
              UD.latitud AS destino_latitud,
              UD.longitud AS destino_longitud,

              L.fecha_caducidad AS caducidad, 
              L.cantidad_inicial_unidades AS cantidad, 

              MT.temperatura_c AS temperatura, 
              MT.id_medicion AS medicion, 

              ISK.id_inventario AS inventario,

              T.nombre AS transportista

          FROM Registro_Movimiento RM
          JOIN Ubicaciones UO ON RM.ubicacion_origen = UO.id_ubicacion
          JOIN Ubicaciones UD ON RM.ubicacion_destino = UD.id_ubicacion
          JOIN Transportistas T ON RM.id_transportista = T.id_transportista
          JOIN Lotes L ON RM.id_lote = L.id_lote 
          JOIN Vacunas V ON L.id_vacuna = V.id_vacuna 

          -- Última medición por lote
          LEFT JOIN (
              SELECT MT1.id_lote, MT1.temperatura_c, MT1.id_medicion
              FROM mediciones_temp MT1
              JOIN (
                  SELECT id_lote, MAX(id_medicion) AS ultima_medicion
                  FROM mediciones_temp
                  GROUP BY id_lote
              ) MT2 ON MT1.id_lote = MT2.id_lote AND MT1.id_medicion = MT2.ultima_medicion
          ) MT ON RM.id_lote = MT.id_lote

          -- Último inventario por ubicación y vacuna
          LEFT JOIN (
              SELECT ISK1.id_ubicacion, ISK1.id_vacuna, MAX(ISK1.id_inventario) AS id_inventario
              FROM inventario_stock ISK1
              GROUP BY ISK1.id_ubicacion, ISK1.id_vacuna
          ) ISK ON ISK.id_ubicacion = RM.ubicacion_destino AND ISK.id_vacuna = L.id_vacuna

          ORDER BY RM.fecha_envio DESC
        `);
    res.json({
      success: true,
      count: movimientos.length,
      data: movimientos,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      mensaje: "Error al obtener el Historial de Movimientos",
      error: error.message,
    });
  }
};

const crearMovimiento = async (req, res) => {
  try {
    const {
      id_lote,
      ubicacion_origen,
      ubicacion_destino,
      id_transportista,
      fecha_envio,
    } = req.body;

    const [resultado] = await db.query(
      "INSERT INTO Registro_Movimiento (id_lote, ubicacion_origen, ubicacion_destino, id_transportista, fecha_envio) VALUES (?, ?, ?, ?, ?)",
      [
        id_lote,
        ubicacion_origen,
        ubicacion_destino,
        id_transportista,
        fecha_envio,
      ]
    );

    res.status(201).json({
      success: true,
      mensaje:
        "Movimiento iniciado y registrado exitosamente. Lote en tránsito.",
      data: {
        id: resultado.insertId,
        id_lote,
        ubicacion_origen,
        ubicacion_destino,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      mensaje: "Error al crear el registro de Movimiento" + error.message,
      error: error.message,
    });
  }
};

const eliminarMovimiento = async (req, res) => {
  try {
    const { id } = req.params;
    const [resultado] = await db.query(
  `UPDATE Registro_Movimiento 
   SET estado = 'ANULADO' 
   WHERE id_movimiento = ? AND estado = 'ACTIVO'`,
  [id]
);


    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        mensaje: "Movimiento no encontrado",
      });
    }

    res.json({
      success: true,
      mensaje: "Movimiento eliminado exitosamente",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      mensaje: "Error al eliminar el movimiento",
      error: error.message,
    });
  }
};

const obtenerMovimientoPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const [movimientos] = await db.query(
      `
            SELECT 
                RM.id_movimiento, 
                RM.id_lote, 
                RM.ubicacion_origen,
                RM.ubicacion_destino,
                RM.id_transportista,
                RM.fecha_envio, 
                RM.fecha_recepcion
            FROM Registro_Movimiento RM
            WHERE RM.id_movimiento = ?
        `,
      [id]
    );

    if (movimientos.length === 0) {
      return res.status(404).json({
        success: false,
        mensaje: "Movimiento no encontrado",
      });
    }

    res.json({
      success: true,
      data: movimientos[0],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      mensaje: "Error al obtener el movimiento",
      error: error.message,
    });
  }
};

const actualizarMovimiento = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      id_lote,
      ubicacion_origen,
      ubicacion_destino,
      id_transportista,
      fecha_envio,
    } = req.body;

    const [resultado] = await db.query(
      "UPDATE Registro_Movimiento SET id_lote = ?, ubicacion_origen = ?, ubicacion_destino = ?, id_transportista = ?, fecha_envio = ? WHERE id_movimiento = ?",
      [
        id_lote,
        ubicacion_origen,
        ubicacion_destino,
        id_transportista,
        fecha_envio,
        id,
      ]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        mensaje: "Movimiento no encontrado",
      });
    }

    res.json({
      success: true,
      mensaje: "Movimiento actualizado exitosamente",
      data: {
        id,
        id_lote,
        ubicacion_origen,
        ubicacion_destino,
        id_transportista,
        fecha_envio,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      mensaje: "Error al actualizar el movimiento",
      error: error.message,
    });
  }
};

const marcarRecepcionAutomatica = async (req, res) => {
  try {
    const { id } = req.params;

    const [movimientoExistente] = await db.query(
      "SELECT fecha_recepcion FROM Registro_Movimiento WHERE id_movimiento = ?",
      [id]
    );

    if (movimientoExistente.length === 0) {
      return res.status(404).json({
        success: false,
        mensaje: "Registro de Movimiento no encontrado.",
      });
    }

    
    if (movimientoExistente[0].fecha_recepcion !== null) {
      return res.status(400).json({
        success: false,
        mensaje: "Este movimiento ya ha sido marcado como recibido.",
      });
    }

    
    const fechaActual = new Date();
    const [resultado] = await db.query(
      "UPDATE Registro_Movimiento SET fecha_recepcion = ? WHERE id_movimiento = ?",
      [fechaActual, id]
    );

    res.status(200).json({
      success: true,
      mensaje: "Recepción de lote registrada automáticamente.",
      data: {
        id_movimiento: id,
        fecha_recepcion: fechaActual,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      mensaje: "Error al registrar la recepción automática del movimiento",
      error: error.message,
    });
  }
};

module.exports = {
  obtenerMovimientos,
  obtenerMovimientoPorId,
  crearMovimiento,
  actualizarMovimiento,
  eliminarMovimiento,
  marcarRecepcionAutomatica,
};
