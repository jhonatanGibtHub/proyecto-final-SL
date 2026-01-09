const db = require("../config/database");

const obtenerVacunas = async (req, res) => {
  try {
    const [Vacunas] = await db.query("SELECT * FROM vacunas");

    res.json({
      success: true,
      count: Vacunas.length,
      data: Vacunas,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      mensaje: "Error al obtener las Vacunas",
      error: error.message,
    });
  }
};

const crearVacuna = async (req, res) => {
  try {
    const { nombre_comercial, fabricante, temp_min_c, temp_max_c } = req.body;

    const [VacunaCreada] = await db.query(
      `
                INSERT INTO Vacunas
                (
                    nombre_comercial, 
                    fabricante, 
                    temp_min_c, 
                    temp_max_c
                ) 
                VALUES (?,?,?,?)
    `,
      [nombre_comercial, fabricante, temp_min_c, temp_max_c]
    );

    res.status(201).json({
      success: true,
      mensaje: "Vacuna creada exitosamente",
      data: {
        id: VacunaCreada.insertId,
        nombre_comercial,
        fabricante,
        temp_min_c,
        temp_max_c,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      mensaje: "Error al crear las Vacunas",
      error: error.message,
    });
  }
};

const actualizarVacuna = async (req, res) => {
  try {
    const { id } = req.params;

    const { nombre_comercial, fabricante, temp_min_c, temp_max_c } = req.body;

    const vacunaExiste = await existeVacunaPorId(id);

    if (!vacunaExiste) {
      return res.status(404).json({
        success: false,
        mensaje: "Vacuna no encontrada",
      });
    }

    await db.query(
      "UPDATE vacunas set nombre_comercial=?, fabricante=?, temp_min_c=?, temp_max_c=? where id_vacuna=?",
      [nombre_comercial, fabricante, temp_min_c, temp_max_c, id]
    );

    res.status(200).json({
      success: true,
      mensaje: "Vacuna actualizada exitosamente",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      mensaje: "Error al modificar la Vacuna",
      error: error.message,
    });
  }
};

const existeVacunaPorId = async (id) => {
  const [result] = await db.query(
    "SELECT id_vacuna FROM vacunas WHERE id_vacuna = ?",
    [id]
  );

  return result.length > 0;
};

const eliminarVacuna = async (req, res) => {
  try {
    const { id } = req.params;

    const vacunaExiste = await existeVacunaPorId(id);
    if (!vacunaExiste) {
      return res.status(404).json({
        success: false,
        mensaje: "Vacuna no encontrada",
      });
    }

    await db.query("DELETE FROM vacunas where id_vacuna=?", [id]);

    res.status(200).json({
      success: true,
      mensaje: "Vacuna eliminada exitosamente",
    });
  } catch (error) {
    console.error(error);

    if (error.code === "ER_ROW_IS_REFERENCED_2") {
      return res.status(409).json({
        success: false,
        mensaje:
          "No se puede eliminar esta vacuna. Existen lotes registrados que dependen de ella.",
      });
    }
    res.status(500).json({
      success: false,
      mensaje: "Error al eliminar la Vacuna",
      error: error.message,
    });
  }
};

const obtenerVacunaPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const vacunaExiste = await existeVacunaPorId(id);
    if (!vacunaExiste) {
      return res.status(404).json({
        success: false,
        mensaje: "Vacuna no encontrada",
      });
    }

    const [vacuna] = await db.query("SELECT * FROM Vacunas WHERE id_vacuna = ?", [id]);
    

    res.status(200).json({
      success: true,
      mensaje: "Vacuna obtenida exitosamente",
      data: vacuna[0],
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      mensaje: "Error al obtener la Vacuna por ID",
      error: error.message,
    });
  }
};

module.exports = {
  obtenerVacunas,
  crearVacuna,
  actualizarVacuna,
  eliminarVacuna,
  obtenerVacunaPorId,
};
