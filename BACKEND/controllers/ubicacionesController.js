const db = require("../config/database");

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
    res.status(500).json({
      success: false,
      mensaje: "Error al obtener las Ubicaciones",
      error: error.message,
    });
  }
};

const obtenerUbicaciones_Cliente = async (req, res) => {
  try {
    const [ubicaciones] = await db.query(`
      SELECT * 
      FROM Ubicaciones
      WHERE tipo <> 'Distribuidor'
    `);

    res.json({
      success: true,
      count: ubicaciones.length,
      data: ubicaciones,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      mensaje: "Error al obtener las Ubicaciones",
      error: error.message,
    });
  }
};

const obtenerUbicaciones_Distribuidor = async (req, res) => {
  try {
    const [ubicaciones] = await db.query(`
      SELECT * 
      FROM Ubicaciones
      WHERE tipo = 'Distribuidor'
    `);

    res.json({
      success: true,
      count: ubicaciones.length,
      data: ubicaciones,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      mensaje: "Error al obtener las Ubicaciones",
      error: error.message,
    });
  }
};

const crearUbicacion = async (req, res) => {
  try {
    const { nombre, tipo, direccion, ubicacionTexto } = req.body;

    const buscar = async (query) => {
      const r = await axios.get(
        'https://nominatim.openstreetmap.org/search',
        {
          params: {
            q: query,
            format: 'json',
            addressdetails: 1,
            countrycodes: 'pe',
            limit: 1
          },
          headers: { 'User-Agent': 'MiApp/1.0' }
        }
      );
      return r.data?.length ? r.data[0] : null;
    };

   
    let place = await buscar(`${direccion}, ${ubicacionTexto}, Perú`);

    
    if (!place) {
      place = await buscar(`${direccion}, Perú`);
    }

    if (!place) {
      return res.status(400).json({
        success: false,
        mensaje: "No se encontró la ubicación en Perú."
      });
    }

    const address = place.address || {};

   
    const distrito =
      address.city_district ||
      address.suburb ||
      address.neighbourhood ||
      null;

    const provincia =
      address.county ||
      address.state_district ||
      address.state ||
      null;

    const region =
      address.state || null;

    const latitud = parseFloat(place.lat);
    const longitud = parseFloat(place.lon);

    const [resultado] = await db.query(
      `INSERT INTO Ubicaciones
      (nombre, tipo, direccion, distrito, provincia, region, latitud, longitud, ciudad)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nombre,
        tipo,
        direccion,
        distrito || ubicacionTexto,
        provincia,
        region,
        latitud,
        longitud,
        ubicacionTexto
      ]
    );

    res.status(201).json({
      success: true,
      mensaje: "Ubicación creada exitosamente",
      data: {
        id: resultado.insertId,
        nombre,
        tipo,
        direccion,
        distrito,
        provincia,
        region,
        latitud,
        longitud
      }
    });

  } catch (error) {
    
    res.status(500).json({
      success: false,
      mensaje: "Error al crear la ubicación"
    });
  }
};

const actualizarUbicacion = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, tipo, direccion, ubicacionTexto } = req.body;

    const buscar = async (query) => {
      const r = await axios.get(
        'https://nominatim.openstreetmap.org/search',
        {
          params: {
            q: query,
            format: 'json',
            addressdetails: 1,
            countrycodes: 'pe',
            limit: 1
          },
          headers: { 'User-Agent': 'MiApp/1.0' }
        }
      );
      return r.data?.length ? r.data[0] : null;
    };

    let place = await buscar(`${direccion}, ${ubicacionTexto}, Perú`);

    if (!place) {
      place = await buscar(`${direccion}, Perú`);
    }

    if (!place) {
      return res.status(400).json({
        success: false,
        mensaje: "No se encontró la ubicación."
      });
    }

    const address = place.address || {};

    const distrito =
      address.city_district ||
      address.suburb ||
      address.neighbourhood ||
      null;

    const provincia =
      address.county ||
      address.state_district ||
      address.state ||
      null;

    const region = address.state || null;

    const latitud = parseFloat(place.lat);
    const longitud = parseFloat(place.lon);

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
        id
      ]
    );

    res.json({
      success: true,
      mensaje: "Ubicación actualizada correctamente"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      mensaje: "Error al actualizar la ubicación"
    });
  }
};

const eliminarUbicacion = async (req, res) => {
  try {
    const { id } = req.params;

   
    const [ubicacionExistente] = await db.query(
      "SELECT * FROM Ubicaciones WHERE id_ubicacion = ?",
      [id]
    );
    if (ubicacionExistente.length === 0) {
      return res.status(404).json({
        success: false,
        mensaje: "Ubicación no encontrada.",
      });
    }

    await db.query("DELETE FROM Ubicaciones WHERE id_ubicacion=?", [id]);

    res.status(200).json({
      success: true,
      mensaje: "Ubicación eliminada exitosamente.",
    });
  } catch (error) {
  
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

    const [ubicaciones] = await db.query(
      "SELECT * FROM Ubicaciones WHERE id_ubicacion = ?",
      [id]
    );

    if (ubicaciones.length === 0) {
      return res.status(404).json({
        success: false,
        mensaje: "Ubicación no encontrada.",
      });
    }

    res.status(200).json({
      success: true,
      data: ubicaciones[0],
    });
  } catch (error) {
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
  obtenerUbicaciones_Cliente,
  obtenerUbicaciones_Distribuidor
};
