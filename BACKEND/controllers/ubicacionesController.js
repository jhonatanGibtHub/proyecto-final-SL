const db = require("../config/database");

// Libreria javascript para poder hacer peticiones http a APIs
const axios = require("axios");

const obtenerUbicaciones = async (req, res) => {
  try {
    const [ubicaciones] = await db.query("SELECT * FROM Ubicaciones");
    res.json({
      success: true,
      count: ubicaciones.length,
      data: ubicaciones,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      mensaje: "Error al obtener las Ubicaciones",
      error: error.message,
    });
  }
};

const ubicacionesClientes = async (req, res) => {
  try {
    const [ubicacionesClientes] = await db.query(`
      SELECT * 
      FROM Ubicaciones
      WHERE tipo <> 'Distribuidor'
    `);
    res.json({
      success: true,
      count: ubicacionesClientes.length,
      data: ubicacionesClientes,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      mensaje: "Error al obtener las Ubicaciones de los clientes",
      error: error.message,
    });
  }
};

const ubicacionesDistribuidor = async (req, res) => {
  try {
    const [ubicacionesDisrtibuidores] = await db.query(`
      SELECT * 
      FROM Ubicaciones
      WHERE tipo = 'Distribuidor'
    `);

    res.json({
      success: true,
      count: ubicacionesDisrtibuidores.length,
      data: ubicacionesDisrtibuidores,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      mensaje: "Error al obtener las Ubicaciones de los distribuidores",
      error: error.message,
    });
  }
};

const buscarUbicacionAPI = async (query) => {
  // Realiza una petición HTTP a la API de Nominatim
  const response = await axios.get(
    "https://nominatim.openstreetmap.org/search",
    {
      params: {
        q: query, // Texto de búsqueda (dirección)
        format: "json", // Formato de respuesta
        addressdetails: 1, // Devuelve detalles de la dirección
        countrycodes: "pe", // Limita la búsqueda a Perú
        limit: 1, // Solo trae el resultado más relevante
      },
      headers: {
        "User-Agent": "MiApp/1.0", // Requerido por la API de Nominatim
      },
    }
  );

  // Retorna el primer resultado si existe, si no retorna null
  return response.data?.length ? response.data[0] : null;
};

const extraerDatosDireccion = (address = {}) => {
  const distrito =
    address.city_district || address.suburb || address.neighbourhood || null;

  const provincia =
    address.county || address.state_district || address.state || null;

  const region = address.state || null;

  return { distrito, provincia, region };
};

const crearUbicacion = async (req, res) => {
  try {
    const { nombre, tipo, direccion, ubicacionTexto } = req.body;

    let lugarEncontrado = await buscarUbicacionAPI(
      `${direccion}, ${ubicacionTexto}, Perú`
    );

    if (!lugarEncontrado) {
      lugarEncontrado = await buscarUbicacionAPI(`${direccion}, Perú`);
    }

    if (!lugarEncontrado) {
      return res.status(400).json({
        success: false,
        mensaje: "No se encontró la ubicación en Perú.",
      });
    }

    const { distrito, provincia, region } = extraerDatosDireccion(
      lugarEncontrado.address
    );

    const latitud = Number.parseFloat(lugarEncontrado.lat);
    const longitud = Number.parseFloat(lugarEncontrado.lon);

    const [ubicacionCreado] = await db.query(
      `INSERT INTO Ubicaciones
      (nombre, tipo, direccion, distrito, provincia, region, latitud, longitud, ciudad)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nombre,
        tipo,
        direccion,
        distrito,
        provincia,
        region,
        latitud,
        longitud,
        ubicacionTexto,
      ]
    );

    res.status(201).json({
      success: true,
      mensaje: "Ubicación creada exitosamente",
      data: {
        id: ubicacionCreado.insertId,
        nombre,
        tipo,
        direccion,
        distrito,
        provincia,
        region,
        latitud,
        longitud,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      mensaje: "Error al crear la ubicación",
    });
  }
};

const actualizarUbicacion = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, tipo, direccion, ubicacionTexto } = req.body;

    let lugarEncontrado = await buscarUbicacionAPI(
      `${direccion}, ${ubicacionTexto}, Perú`
    );

    if (!lugarEncontrado) {
      lugarEncontrado = await buscarUbicacionAPI(`${direccion}, Perú`);
    }

    if (!lugarEncontrado) {
      return res.status(400).json({
        success: false,
        mensaje: "No se encontró la ubicación en Perú.",
      });
    }

    const { distrito, provincia, region } = extraerDatosDireccion(
      lugarEncontrado.address
    );

    const latitud = Number.parseFloat(lugarEncontrado.lat);
    const longitud = Number.parseFloat(lugarEncontrado.lon);

    await db.query(
      `UPDATE Ubicaciones
       SET nombre = ?, tipo = ?, direccion = ?,
           distrito = ?, provincia = ?, region = ?, latitud = ?, longitud = ?, ciudad = ?
       WHERE id_ubicacion = ?`,
      [
        nombre,
        tipo,
        direccion,
        distrito,
        provincia,
        region,
        latitud,
        longitud,
        ubicacionTexto,
        id,
      ]
    );

    res.json({
      success: true,
      mensaje: "Ubicación actualizada correctamente",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      mensaje: "Error al actualizar la ubicación",
    });
  }
};

const existeUbicacionPorId = async (id) => {
  const [result] = await db.query(
    "SELECT id_ubicacion FROM Ubicaciones WHERE id_ubicacion = ?",
    [id]
  );

  return result.length > 0;
};

const eliminarUbicacion = async (req, res) => {
  try {
    const { id } = req.params;

    const ubicacionExiste = await existeUbicacionPorId(id);
    if (!ubicacionExiste) {
      return res.status(404).json({
        success: false,
        mensaje: "Ubicacion no encontrada",
      });
    }

    await db.query("DELETE FROM Ubicaciones WHERE id_ubicacion=?", [id]);

    res.status(200).json({
      success: true,
      mensaje: "Ubicación eliminada exitosamente.",
    });
  } catch (error) {
    console.error(error);

    if (error.code === "ER_ROW_IS_REFERENCED_2") {
      return res.status(409).json({
        success: false,

        mensaje:
          "No se puede eliminar esta ubicación. Aún tiene sensores activos, inventario (stock) o movimientos logísticos registrados.",
      });
    }
    res.status(500).json({
      success: false,
      mensaje: "Error al eliminar la Ubicación",
      error: error.message,
    });
  }
};

const obtenerUbicacionPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const ubicacionExiste = await existeUbicacionPorId(id);
    if (!ubicacionExiste) {
      return res.status(404).json({
        success: false,
        mensaje: "Ubicacion no encontrada",
      });
    }

    const [ubicacion] = await db.query("SELECT * FROM Ubicaciones WHERE id_ubicacion = ?", [id]);
    res.status(200).json({
      success: true,
      data: ubicacion[0],
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      mensaje: "Error al obtener la Ubicación",
      error: error.message,
    });
  }
};

module.exports = {
  obtenerUbicaciones,
  crearUbicacion,
  actualizarUbicacion,
  eliminarUbicacion,
  obtenerUbicacionPorId,
  ubicacionesClientes,
  ubicacionesDistribuidor,
};
