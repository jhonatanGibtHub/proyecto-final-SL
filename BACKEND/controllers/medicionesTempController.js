const db = require("../config/database");

const { crearAlertaInterna } = require("./alertasCadenaFrioController");

const obtenerMediciones = async (req, res) => {
  try {
    const [Mediciones] = await db.query(`
            SELECT 
                MT.id_medicion, 
                ST.codigo_serie AS sensor, 
                MT.id_lote,
                V.nombre_comercial AS vacuna,
                MT.temperatura_c, 
                MT.timestamp_medicion
            FROM Mediciones_Temp MT
            JOIN Sensores_Temp ST ON MT.id_sensor = ST.id_sensor
            JOIN Lotes L ON MT.id_lote = L.id_lote
            JOIN Vacunas V ON L.id_vacuna = V.id_vacuna
            ORDER BY MT.timestamp_medicion DESC
            LIMIT 100
        `);

    res.json({
      success: true,
      count: Mediciones.length,
      data: Mediciones,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      mensaje: "Error al obtener las Mediciones de Temperatura",
      error: error.message,
    });
  }
};

const existeMedicionPorId = async (id) => {
  const [result] = await db.query(
    "SELECT id_medicion FROM Mediciones_Temp WHERE id_medicion = ?",
    [id]
  );

  return result.length > 0;
};

const crearMedicion = async (req, res) => {
  try {
    const { id_sensor, id_lote, temperatura_c } = req.body;

    const [resultado] = await db.query(
      "INSERT INTO Mediciones_Temp (id_sensor, id_lote, temperatura_c) VALUES (?, ?, ?)",
      [id_sensor, id_lote, temperatura_c]
    );
    const id_medicion_nueva = resultado.insertId;

    const [rangos] = await db.query(
      `
            SELECT V.temp_min_c, V.temp_max_c 
            FROM Lotes L
            JOIN Vacunas V ON L.id_vacuna = V.id_vacuna
            WHERE L.id_lote = ?
        `,
      [id_lote]
    );

    let tipo_alerta = null;

    if (rangos.length > 0) {
      const { temp_min_c, temp_max_c } = rangos[0];

      if (temperatura_c > temp_max_c) {
        tipo_alerta = "Máx. Excedida";
      } else if (temperatura_c < temp_min_c) {
        tipo_alerta = "Mín. Violada";
      }

      if (tipo_alerta) {
        await crearAlertaInterna({
          id_medicion: id_medicion_nueva,
          id_lote: id_lote,
          tipo_alerta: tipo_alerta,
        });
      }
    }

    res.status(201).json({
      success: true,
      mensaje:
        "Medición de temperatura registrada exitosamente" +
        (tipo_alerta ? " y ALERTA GENERADA automáticamente." : "."),
      data: { id: id_medicion_nueva, id_sensor, id_lote, temperatura_c },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      mensaje: "Error al registrar la Medición",
      error: error.message,
    });
  }
};

const obtenerMedicionPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const medicionExiste = await existeMedicionPorId(id);
    if (!medicionExiste) {
      return res.status(404).json({
        success: false,
        mensaje: "Medicion de temperatura no encontrado",
      });
    }

    const [mediciones] = await db.query(
      `
            SELECT 
                MT.id_medicion, 
                MT.id_sensor,
                MT.id_lote,
                MT.temperatura_c, 
                MT.timestamp_medicion
            FROM Mediciones_Temp MT
            WHERE MT.id_medicion = ?
        `,
      [id]
    );

    res.json({
      success: true,
      data: mediciones[0],
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      mensaje: "Error al obtener la medición",
      error: error.message,
    });
  }
};

const actualizarMedicion = async (req, res) => {
  try {
    const { id } = req.params;
    const { id_sensor, id_lote, temperatura_c } = req.body;

    const [resultado] = await db.query(
      "UPDATE Mediciones_Temp SET id_sensor = ?, id_lote = ?, temperatura_c = ? WHERE id_medicion = ?",
      [id_sensor, id_lote, temperatura_c, id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        mensaje: "Medición no encontrada",
      });
    }

    res.json({
      success: true,
      mensaje: "Medición actualizada exitosamente",
      data: { id, id_sensor, id_lote, temperatura_c },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      mensaje: "Error al actualizar la medición",
      error: error.message,
    });
  }
};

const actualizarTemperatura = async (req, res) => {
  try {
    const { id } = req.params;
    const { temperatura_c } = req.body;

    const medicionExiste = await existeMedicionPorId(id);
    if (!medicionExiste) {
      return res.status(404).json({
        success: false,
        mensaje: "Medicion de temperatura no encontrado",
      });
    }

    await db.query(
      "UPDATE Mediciones_Temp SET temperatura_c = ? WHERE id_medicion = ?",
      [temperatura_c, id]
    );

    res.json({
      success: true,
      mensaje: "Temperatura actualizada exitosamente",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      mensaje: "Error al actualizar la temperatura",
      error: error.message,
    });
  }
};

const eliminarMedicion = async (req, res) => {
  try {
    const { id } = req.params;
    
    const medicionExiste = await existeMedicionPorId(id);
    if (!medicionExiste) {
      return res.status(404).json({
        success: false,
        mensaje: "Medicion de temperatura no encontrado",
      });
    }

    await db.query("DELETE FROM Mediciones_Temp WHERE id_medicion = ?", [id]);

    res.json({
      success: true,
      mensaje: "Medición eliminada exitosamente",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      mensaje: "Error al eliminar la medición",
      error: error.message,
    });
  }
};

module.exports = {
  obtenerMediciones,
  obtenerMedicionPorId,
  crearMedicion,
  actualizarMedicion,
  eliminarMedicion,
  actualizarTemperatura,
};
