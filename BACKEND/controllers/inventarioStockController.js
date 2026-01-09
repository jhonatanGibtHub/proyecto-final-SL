const db = require("../config/database");

const obtenerInventarioStock = async (req, res) => {
  try {
    const [Inventarios] = await db.query(`
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
      count: Inventarios.length,
      data: Inventarios,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      mensaje: "Error al obtener Los Inventarios",
      error: error.message,
    });
  }
};

const existeInventarioPorId = async (id) => {
  const [result] = await db.query(
    "SELECT id_inventario FROM Inventario_Stock WHERE id_inventario = ?",
    [id]
  );

  return result.length > 0;
};

const crearInventarioStock = async (req, res) => {
  try {
    const { id_vacuna, id_ubicacion, cantidad_actual } = req.body;

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

    const [inventarioCreado] = await db.query(
      "INSERT INTO Inventario_Stock (id_vacuna, id_ubicacion, cantidad_actual) VALUES (?, ?, ?)",
      [id_vacuna, id_ubicacion, cantidad_actual]
    );

    res.status(201).json({
      success: true,
      mensaje: "Nuevo inventario creado exitosamente",
      data: {
        id: inventarioCreado.insertId,
        id_vacuna,
        id_ubicacion,
        cantidad_actual,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      mensaje: "Error al crear  un nuevo inventario",
      error: error.message,
    });
  }
};

const obtenerInventarioStockPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const inventarioExiste = await existeInventarioPorId(id);
    if (!inventarioExiste) {
      return res.status(404).json({
        success: false,
        mensaje: "Inventario no encontrado",
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

    res.status(200).json({
      success: true,
      data: inventario[0],
    });
  } catch (error) {
    console.error(error);

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

    const inventarioExiste = await existeInventarioPorId(id);
    if (!inventarioExiste) {
      return res.status(404).json({
        success: false,
        mensaje: "Inventario no encontrada",
      });
    }

    await db.query(
      "DELETE FROM Inventario_Stock WHERE id_inventario = ?",
      [id]
    );

    res.json({
      success: true,
      mensaje: "Registro de inventario eliminado exitosamente",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      mensaje: "Error al eliminar el registro de inventario",
      error: error.message,
    });
  }
};

const inventariosClientes = async (req, res) => {
  try {
    const { id_lote } = req.params;
    
    const [inventariosClientes] = await db.query(`
      SELECT 
      I.id_inventario,
      I.id_vacuna,
      I.id_ubicacion,
      I.cantidad_actual,

      V.nombre_comercial AS nombre_vacuna,
      U.nombre AS nombre_ubicacion,
      U.direccion AS direccion

      FROM Inventario_Stock I
      JOIN Ubicaciones U ON I.id_ubicacion = U.id_ubicacion
      JOIN Vacunas V ON I.id_vacuna = V.id_vacuna
      JOIN Lotes L ON I.id_vacuna = L.id_vacuna
      WHERE L.id_lote = ?
      
    `,[id_lote]);
    res.json({
      success: true,
      count: inventariosClientes.length,
      data: inventariosClientes,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      mensaje: "Error al obtener los inventarios de los clientes",
      error: error.message,
    });
  }
};

const actualizarCantidadInventario = async (req, res) => {
  try {
    const { id } = req.params;
    const { cantidad_a_sumar } = req.body;

    const inventarioExiste = await existeInventarioPorId(id);
    if (!inventarioExiste) {
      return res.status(404).json({
        success: false,
        mensaje: "Inventario no encontrada",
      });
    }
    
    if (cantidad_a_sumar === undefined || Number.isNaN(cantidad_a_sumar)) {
      return res.status(400).json({
        success: false,
        mensaje: "La cantidad_a_sumar debe ser un número válido.",
      });
    }

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

    const [columnaCantidad] = await db.query(
      "SELECT cantidad_actual FROM Inventario_Stock WHERE id_inventario = ?",
      [id]
    );
    const cantidadActual = columnaCantidad[0].cantidad_actual;

    res.status(200).json({
      success: true,
      mensaje: "Cantidad de inventario actualizada correctamente.",
      data: {
        id_inventario: id,
        cantidad_sumada: cantidadActual,
      },
    });
  } catch (error) {
    console.error(error);

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
  inventariosClientes,
};
