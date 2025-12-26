const db = require('../config/database');


const obtenerUbicaciones = async (req, res) => {
    try {
        const [ubicaciones] = await db.query('SELECT * FROM Ubicaciones');
        res.json({
            success: true,
            count: ubicaciones.length,
            data: ubicaciones
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            mensaje: "Error al obtener las Ubicaciones",
            error: error.message
        });
    }
};


const crearUbicacion = async (req, res) => {
    try {
        const { nombre, tipo, distrito, provincia } = req.body;

      
        if (!nombre || !tipo || !distrito) {
            return res.status(400).json({
                success: false,
                mensaje: "Nombre, tipo y distrito son obligatorios."
            });
        }

        // Validación
        const tiposValidos = ['Almacén Central', 'Distribuidor', 'Centro de Salud'];
        if (!tiposValidos.includes(tipo)) {
            return res.status(400).json({
                success: false,
                mensaje: `Tipo de ubicación inválido. Debe ser uno de: ${tiposValidos.join(', ')}.`
            });
        }

        const [resultado] = await db.query(
            'INSERT INTO Ubicaciones (nombre, tipo, distrito, provincia) VALUES (?, ?, ?, ?)',
            [nombre, tipo, distrito, provincia]
        );

        res.status(201).json({
            success: true,
            mensaje: "Ubicación creada exitosamente",
            data: {
                id: resultado.insertId,
                nombre,
                tipo,
                distrito,
                provincia
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            mensaje: "Error al crear la Ubicación",
            error: error.message
        });
    }
};


const actualizarUbicacion = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, tipo, distrito, provincia } = req.body;

      
        const [ubicacionExistente] = await db.query('SELECT * FROM Ubicaciones WHERE id_ubicacion = ?', [id]);
        if (ubicacionExistente.length === 0) {
            return res.status(404).json({
                success: false,
                mensaje: "Ubicación no encontrada."
            });
        }

        //Validación 
        const tiposValidos = ['Almacén Central', 'Distribuidor', 'Centro de Salud'];
        if (tipo && !tiposValidos.includes(tipo)) {
            return res.status(400).json({
                success: false,
                mensaje: `Tipo de ubicación inválido. Debe ser uno de: ${tiposValidos.join(', ')}.`
            });
        }

       
        await db.query(
            'UPDATE Ubicaciones SET nombre=?, tipo=?, distrito=?, provincia=? WHERE id_ubicacion=?',
            [nombre, tipo, distrito, provincia, id]
        );

        res.status(200).json({
            success: true,
            mensaje: "Ubicación actualizada exitosamente",
            data: { id, nombre, tipo, distrito, provincia }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            mensaje: "Error al modificar la Ubicación",
            error: error.message
        });
    }
};


const eliminarUbicacion = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Verificar existencia
        const [ubicacionExistente] = await db.query('SELECT * FROM Ubicaciones WHERE id_ubicacion = ?', [id]);
        if (ubicacionExistente.length === 0) {
            return res.status(404).json({
                success: false,
                mensaje: "Ubicación no encontrada."
            });
        }

        await db.query(
            'DELETE FROM Ubicaciones WHERE id_ubicacion=?',
            [id]
        );

        res.status(200).json({
            success: true,
            mensaje: "Ubicación eliminada exitosamente."
        });

    } catch (error) {
        // Regla de Borrado
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
             return res.status(409).json({ // 409 Conflict
                 success: false,
             
                 mensaje: "No se puede eliminar esta ubicación. Aún tiene sensores activos, inventario (stock) o movimientos logísticos registrados."
             });
         }

        res.status(500).json({
            success: false,
            mensaje: "Error al eliminar la Ubicación",
            error: error.message
        });
    }
};


const obtenerUbicacionPorId = async (req, res) => {
    try {
        const { id } = req.params;

        const [ubicaciones] = await db.query(
            'SELECT * FROM Ubicaciones WHERE id_ubicacion = ?',
            [id]
        );

        if (ubicaciones.length === 0) {
            return res.status(404).json({
                success: false,
                mensaje: "Ubicación no encontrada."
            });
        }

        res.status(200).json({
            success: true,
            data: ubicaciones[0]
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            mensaje: "Error al obtener la Ubicación",
            error: error.message
        });
    }
};

module.exports = {
    obtenerUbicaciones,
    crearUbicacion,
    actualizarUbicacion,
    eliminarUbicacion,
    obtenerUbicacionPorId
};