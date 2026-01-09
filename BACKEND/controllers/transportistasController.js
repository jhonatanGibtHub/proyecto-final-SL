const db = require("../config/database");

const existeTransportistaPorId = async (id) => {
  const [result] = await db.query(
    "SELECT id_transportista FROM Transportistas WHERE id_transportista = ?",
    [id]
  );

  return result.length > 0;
};

const obtenerTransportistas = async (req, res) => {
  try {
    const [transportistas] = await db.query("SELECT * FROM Transportistas");
    res.json({
      success: true,
      count: transportistas.length,
      data: transportistas,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      mensaje: "Error al obtener los Transportistas",
      error: error.message,
    });
  }
};

const crearTransportista = async (req, res) => {
  try {
    const { nombre, licencia, telefono, tipo_vehiculo } = req.body;

    const [transportistaCreado] = await db.query(
      "INSERT INTO Transportistas (nombre, licencia, telefono, tipo_vehiculo) VALUES (?, ?, ?, ?)",
      [nombre, licencia, telefono, tipo_vehiculo]
    );

    res.status(201).json({
      success: true,
      mensaje: "Transportista creado exitosamente",
      data: {
        id: transportistaCreado.insertId,
        nombre,
        licencia,
        telefono,
        tipo_vehiculo,
      },
    });
  } catch (error) {
    console.error(error);
    
    res.status(500).json({
      success: false,
      mensaje: "Error al crear el Transportista",
      error: error.message,
    });
  }
};

const actualizarTransportista = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, licencia, telefono, tipo_vehiculo } = req.body;

    const transportistaExiste = await existeTransportistaPorId(id);
    if (!transportistaExiste) {
      return res.status(404).json({
        success: false,
        mensaje: "Transportista no encontrada",
      });
    }

    await db.query(
      "UPDATE Transportistas SET nombre=?, licencia=?, telefono=?, tipo_vehiculo=? WHERE id_transportista=?",
      [nombre, licencia, telefono, tipo_vehiculo, id]
    );

    res.status(200).json({
      success: true,
      mensaje: "Transportista actualizado exitosamente",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      mensaje: "Error al modificar el Transportista",
      error: error.message,
    });
  }
};

const eliminarTransportista = async (req, res) => {
  try {
    const { id } = req.params;

    const transportistaExiste = await existeTransportistaPorId(id);
    if (!transportistaExiste) {
      return res.status(404).json({
        success: false,
        mensaje: "Transportista no encontrada",
      });
    }

    await db.query("DELETE FROM Transportistas WHERE id_transportista=?", [id]);

    res.status(200).json({
      success: true,
      mensaje: "Transportista eliminado exitosamente.",
    });
  } catch (error) {
    console.error(error);

    if (error.code === "ER_ROW_IS_REFERENCED_2") {
      return res.status(409).json({
        success: false,
        mensaje:
          "No se puede eliminar este transportista. Está referenciado en el historial de movimientos de lotes (Registro_Movimiento).",
      });
    }
    res.status(500).json({
      success: false,
      mensaje: "Error al eliminar el Transportista",
      error: error.message,
    });
  }
};
const obtenerTransportistaPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const transportistaExiste = await existeTransportistaPorId(id);
    if (!transportistaExiste) {
      return res.status(404).json({
        success: false,
        mensaje: "Transportista no encontrada",
      });
    }

    const transportistas = await db.query(
        'SELECT * FROM Transportistas WHERE id_transportista = ?', [id]
    );

    res.status(200).json({
      success: true,
      data: transportistas[0],
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      mensaje: "Error al obtener el Transportista",
      error: error.message,
    });
  }
};

module.exports = {
  obtenerTransportistas,
  crearTransportista,
  actualizarTransportista,
  eliminarTransportista,
  obtenerTransportistaPorId,
};
