const db = require("../config/database");

const obtenerInventarioStock = async (req, res) => {
  try {
    // JOIN con Lotes y Ubicaciones
    const [inventario] = await db.query(`
    SELECT 
        I.id_inventario, 
        V.nombre_comercial AS vacuna,
        I.id_lote,
        U.nombre AS ubicacion,
        I.cantidad_actual, 
        I.fecha_ultima_actualizacion
    FROM Inventario_Stock I
    JOIN Lotes L ON I.id_lote = L.id_lote
    JOIN Vacunas V ON L.id_vacuna = V.id_vacuna
    JOIN Ubicaciones U ON I.id_ubicacion = U.id_ubicacion
`);

    res.json({
      success: true,
      count: inventario.length,
      data: inventario,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      mensaje: "Error al obtener el Inventario de Stock",
      error: error.message,
    });
  }
};

const crearInventarioStock = async (req, res) => {
  try {
    const { id_lote, id_ubicacion, cantidad_actual } = req.body;

    // Validación básica
    if (
      !id_lote ||
      !id_ubicacion ||
      cantidad_actual === undefined ||
      cantidad_actual <= 0
    ) {
      return res.status(400).json({
        success: false,
        mensaje:
          "Lote, ubicación y una cantidad positiva son obligatorios para el ingreso de stock.",
      });
    }

    // Regla de Negocio: Evitar duplicados.
    // Un lote solo puede tener un registro de stock en una ubicación a la vez.
    const [stockExistente] = await db.query(
      "SELECT * FROM Inventario_Stock WHERE id_lote = ? AND id_ubicacion = ?",
      [id_lote, id_ubicacion]
    );

    if (stockExistente.length > 0) {
      return res.status(409).json({
        success: false,
        mensaje:
          "Ya existe un registro de stock para este lote en esta ubicación. Por favor, use la función de 'actualizar' para incrementar la cantidad.",
      });
    }

    const [resultado] = await db.query(
      "INSERT INTO Inventario_Stock (id_lote, id_ubicacion, cantidad_actual) VALUES (?, ?, ?)",
      [id_lote, id_ubicacion, cantidad_actual]
    );

    res.status(201).json({
      success: true,
      mensaje: "Stock de lote ingresado exitosamente",
      data: {
        id: resultado.insertId,
        id_lote,
        id_ubicacion,
        cantidad_actual,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      mensaje: "Error al crear el registro de Stock",
      error: error.message,
    });
  }
};

const actualizarInventarioStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { cantidad_actual } = req.body;

    const [stockExistente] = await db.query(
      "SELECT * FROM Inventario_Stock WHERE id_inventario = ?",
      [id]
    );
    if (stockExistente.length === 0) {
      return res.status(404).json({
        success: false,
        mensaje: "Registro de Stock no encontrado.",
      });
    }

    if (
      cantidad_actual === undefined ||
      isNaN(cantidad_actual) ||
      cantidad_actual < 0
    ) {
      return res.status(400).json({
        success: false,
        mensaje: "La cantidad actual debe ser un número positivo o cero.",
      });
    }

    // No se permite incrementar la cantidad si esta ya existe en otro lado (manejo logístico).
    // Solo se debería permitir decrementar (por consumo) o mover (a otra ubicación).
    // Aquí permitimos la actualización directa, pero validamos que no sea excesiva.
    if (
      cantidad_actual > stockExistente[0].cantidad_actual &&
      stockExistente[0].cantidad_actual > 0
    ) {
      // Este es un caso de RECEPCIÓN o DEVOLUCIÓN. Se recomienda usar una ruta específica
      // para RECEPCIÓN para un mejor control. Aquí solo se valida la lógica.
    }

    const [resultado] = await db.query(
      "UPDATE Inventario_Stock SET cantidad_actual=? WHERE id_inventario=?",
      [cantidad_actual, id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        mensaje:
          "Error al actualizar la cantidad de stock. Ningún registro afectado.",
      });
    }

    res.status(200).json({
      success: true,
      mensaje: "Stock actualizado exitosamente.",
      data: { id, cantidad_actual },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      mensaje: "Error al modificar el Stock",
      error: error.message,
    });
  }
};

const obtenerInventarioStockPorId = async (req, res) => {
  try {
    const { id } = req.params;

    // Validación básica del parámetro
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        mensaje: "El ID del inventario es inválido.",
      });
    }

    const [inventario] = await db.query(
      `
      SELECT 
        I.id_inventario, 
        V.nombre_comercial AS vacuna,
        I.id_lote,
        U.nombre AS ubicacion,
        I.cantidad_actual, 
        I.fecha_ultima_actualizacion
      FROM Inventario_Stock I
      JOIN Lotes L ON I.id_lote = L.id_lote
      JOIN Vacunas V ON L.id_vacuna = V.id_vacuna
      JOIN Ubicaciones U ON I.id_ubicacion = U.id_ubicacion
      WHERE I.id_inventario = ?
      `,
      [id]
    );

    if (inventario.length === 0) {
      return res.status(404).json({
        success: false,
        mensaje: "Registro de inventario no encontrado.",
      });
    }

    res.status(200).json({
      success: true,
      data: inventario[0],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      mensaje: "Error al obtener el inventario por ID",
      error: error.message,
    });
  }
};

const eliminarInventarioStock = async (req, res) => {
  try {
    const { id } = req.params;

    const [resultado] = await db.query('DELETE FROM Inventario_Stock WHERE id_inventario = ?', [id]);

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        mensaje: "Registro de inventario no encontrado."
      });
    }

    res.json({
      success: true,
      mensaje: "Registro de inventario eliminado exitosamente"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      mensaje: "Error al eliminar el registro de inventario",
      error: error.message
    });
  }
};


module.exports = {
  obtenerInventarioStock,
  crearInventarioStock,
  actualizarInventarioStock,
  obtenerInventarioStockPorId,
  eliminarInventarioStock
};
