const db = require("../config/database");

const obtenerInventarioStock = async (req, res) => {
  try {
    // JOIN con Lotes y Ubicaciones
    const [inventario] = await db.query(`
    SELECT 
        I.id_inventario, 
        I.id_ubicacion,
        V.nombre_comercial AS vacuna,
        U.nombre AS ubicacion,
        U.direccion AS direccion,
        I.cantidad_actual, 
        I.fecha_ultima_actualizacion
    FROM Inventario_Stock I
    JOIN Vacunas V ON I.id_vacuna = V.id_vacuna
    JOIN Ubicaciones U ON I.id_ubicacion = U.id_ubicacion
    ORDER BY  U.nombre DESC
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
    const { id_vacuna, id_ubicacion, cantidad_actual } = req.body;

    // Regla de Negocio: Evitar duplicados.
    // Un lote solo puede tener un registro de stock en una ubicación a la vez.
    const [stockExistente] = await db.query(
      "SELECT * FROM Inventario_Stock WHERE id_vacuna = ? AND id_ubicacion = ?",
      [id_vacuna, id_ubicacion]
    );

    if (stockExistente.length > 0) {
      return res.status(409).json({
        success: false,
        mensaje:
          "Ya existe un registro de stock para este lote en esta ubicación. Por favor, use la función de 'actualizar'.",
      });
    }

    const [resultado] = await db.query(
      "INSERT INTO Inventario_Stock (id_vacuna, id_ubicacion, cantidad_actual) VALUES (?, ?, ?)",
      [id_vacuna, id_ubicacion, cantidad_actual]
    );

    res.status(201).json({
      success: true,
      mensaje: "Stock de lote ingresado exitosamente",
      data: {
        id: resultado.insertId,
        id_vacuna,
        id_ubicacion,
        cantidad_actual,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      mensaje: "Error al crear el registro de Stock",
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
        I.id_ubicacion,
        I.id_vacuna,
        V.nombre_comercial AS vacuna,
        U.nombre AS ubicacion,
        I.cantidad_actual, 
        I.fecha_ultima_actualizacion
      FROM Inventario_Stock I
      JOIN Vacunas V ON I.id_vacuna = V.id_vacuna
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

    const [resultado] = await db.query(
      "DELETE FROM Inventario_Stock WHERE id_inventario = ?",
      [id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        mensaje: "Registro de inventario no encontrado.",
      });
    }

    res.json({
      success: true,
      mensaje: "Registro de inventario eliminado exitosamente",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      mensaje: "Error al eliminar el registro de inventario",
      error: error.message,
    });
  }
};

const actualizarCantidadInventario = async (req, res) => {
  try {
    const { id } = req.params;
    const { cantidad_a_sumar } = req.body;

    // 🔹 Validar ID
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        mensaje: "ID de inventario inválido.",
      });
    }

    // 🔹 Validar cantidad a sumar
    if (cantidad_a_sumar === undefined || isNaN(cantidad_a_sumar)) {
      return res.status(400).json({
        success: false,
        mensaje: "La cantidad_a_sumar debe ser un número válido.",
      });
    }

    // 🔹 Verificar existencia
    const [inventario] = await db.query(
      "SELECT cantidad_actual FROM Inventario_Stock WHERE id_inventario = ?",
      [id]
    );

    if (inventario.length === 0) {
      return res.status(404).json({
        success: false,
        mensaje: "Inventario no encontrado.",
      });
    }

    // 🔹 Sumar cantidad existente + nueva
    await db.query(
      `
      UPDATE Inventario_Stock
      SET 
        cantidad_actual = cantidad_actual + ?,
        fecha_ultima_actualizacion = NOW()
      WHERE id_inventario = ?
      `,
      [cantidad_a_sumar, id]
    );

    const [rows] = await db.query(
      "SELECT cantidad_actual FROM Inventario_Stock WHERE id_inventario = ?",
      [id]
    );
    const cantidadActual = rows[0].cantidad_actual;

    res.status(200).json({
      success: true,
      mensaje: "Cantidad de inventario actualizada correctamente.",
      data: {
        id_inventario: id,
        cantidad_sumada: cantidadActual,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      mensaje: "Error al actualizar la cantidad del inventario.",
      error: error.message,
    });
  }
};

module.exports = {
  obtenerInventarioStock,
  crearInventarioStock,
  obtenerInventarioStockPorId,
  eliminarInventarioStock,
  actualizarCantidadInventario,
};
