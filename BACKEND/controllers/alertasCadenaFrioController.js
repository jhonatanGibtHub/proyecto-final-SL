const db = require("../config/database");

const crearAlertaInterna = async ({ id_medicion, id_lote, tipo_alerta }) => {
  try {
    const tiposValidos = ["Máx. Excedida", "Mín. Violada"];
    if (!tiposValidos.includes(tipo_alerta)) {
      console.error("Tipo de alerta inválido intentando crear alerta interna.");
      return;
    }

    await db.query(
      "INSERT INTO Alertas_Cadena_Frio (id_medicion, id_lote, tipo_alerta, estado) VALUES (?, ?, ?, ?)",
      [id_medicion, id_lote, tipo_alerta, "Activa"]
    );
  } catch (error) {
    console.error("Error al crear la Alerta de forma interna:", error.message);
  }
};

const actualizarOCrearAlerta = async (req, res) => {
  const { id_medicion, id_lote, tipo_alerta, estado } = req.body;
  try {

    // Revisar si ya existe una alerta para este lote y tipo
    const [alertaExistente] = await db.query(
      `SELECT * FROM Alertas_Cadena_Frio 
             WHERE id_lote = ?`,
      [id_lote]
    );

    if (alertaExistente.length === 0) {
      // No existe, crear una nueva alerta
      await db.query(
        `INSERT INTO Alertas_Cadena_Frio (id_medicion, id_lote, tipo_alerta, estado)
                 VALUES (?, ?, ?, ?)`,
        [id_medicion, id_lote, tipo_alerta, estado]
      );
    } else {
      // Existe, actualizar solo el estado
      const id_alerta = alertaExistente[0].id_alerta;
      await db.query(
        `UPDATE Alertas_Cadena_Frio 
                 SET estado = ?, id_medicion = ? , tipo_alerta = ?
                 WHERE id_alerta = ?`,
        [estado, id_medicion, tipo_alerta, id_alerta]
      );
    }
  } catch (error) {
    console.error(error);
  }
};

const obtenerAlertas = async (req, res) => {
  try {
    const [alertas] = await db.query(`
            SELECT 
                A.id_alerta, 
                A.id_medicion, 
                V.nombre_comercial AS vacuna,
                MT.temperatura_c AS temp_violada,
                A.tipo_alerta,
                A.fecha_alerta, 
                A.estado
            FROM Alertas_Cadena_Frio A
            JOIN Mediciones_Temp MT ON A.id_medicion = MT.id_medicion
            JOIN Lotes L ON A.id_lote = L.id_lote
            JOIN Vacunas V ON L.id_vacuna = V.id_vacuna
            ORDER BY A.fecha_alerta DESC
        `);

    res.json({
      success: true,
      count: alertas.length,
      data: alertas,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      mensaje: "Error al obtener el Historial de Alertas",
      error: error.message,
    });
  }
};

const crearAlerta = async (req, res) => {
  const { id_medicion, id_lote, tipo_alerta } = req.body;
  try {
    await crearAlertaInterna({ id_medicion, id_lote, tipo_alerta });
    res.status(201).json({ success: true, mensaje: "Alerta registrada." });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, mensaje: "Error al registrar la Alerta" });
  }
};

const cambiarEstadoAlerta = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    const [alertaExistente] = await db.query(
      "SELECT * FROM Alertas_Cadena_Frio WHERE id_alerta = ?",
      [id]
    );
    if (alertaExistente.length === 0) {
      return res
        .status(404)
        .json({ success: false, mensaje: "Alerta no encontrada." });
    }

    const estadosValidos = ["Activa", "Resuelta", "Desechado"];
    if (!estadosValidos.includes(estado)) {
      return res
        .status(400)
        .json({
          success: false,
          mensaje: `Estado inválido. Debe ser uno de: ${estadosValidos.join(
            ", "
          )}.`,
        });
    }

    await db.query(
      "UPDATE Alertas_Cadena_Frio SET estado=? WHERE id_alerta=?",
      [estado, id]
    );

    res.status(200).json({
      success: true,
      mensaje: `Estado de la alerta ${id} actualizado a ${estado} exitosamente.`,
      data: { id, nuevo_estado: estado },
    });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        mensaje: "Error al cambiar el estado de la Alerta",
        error: error.message,
      });
  }
};

const obtenerAlertaPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const [alertas] = await db.query(
      `
            SELECT 
                A.id_alerta, 
                A.id_medicion, 
                V.nombre_comercial AS vacuna,
                MT.temperatura_c AS temp_violada,
                A.tipo_alerta,
                A.fecha_alerta, 
                A.estado
            FROM Alertas_Cadena_Frio A
            JOIN Mediciones_Temp MT ON A.id_medicion = MT.id_medicion
            JOIN Lotes L ON A.id_lote = L.id_lote
            JOIN Vacunas V ON L.id_vacuna = V.id_vacuna
            WHERE A.id_alerta = ?
        `,
      [id]
    );

    if (alertas.length === 0) {
      return res.status(404).json({
        success: false,
        mensaje: "Alerta no encontrada",
      });
    }

    res.json({
      success: true,
      data: alertas[0],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      mensaje: "Error al obtener la alerta",
      error: error.message,
    });
  }
};

const eliminarAlerta = async (req, res) => {
  try {
    const { id } = req.params;

    const [resultado] = await db.query(
      "DELETE FROM Alertas_Cadena_Frio WHERE id_alerta = ?",
      [id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        mensaje: "Alerta no encontrada.",
      });
    }

    res.json({
      success: true,
      mensaje: "Alerta eliminada exitosamente",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      mensaje: "Error al eliminar la alerta",
      error: error.message,
    });
  }
};

module.exports = {
  crearAlertaInterna,
  obtenerAlertas,
  cambiarEstadoAlerta,
  crearAlerta,
  obtenerAlertaPorId,
  eliminarAlerta,
  actualizarOCrearAlerta,
};
