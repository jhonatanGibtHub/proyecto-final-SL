const db = require('../config/database');


const obtenerLotes = async (req, res) => {
    try {
      
        const [lotes] = await db.query(`
            SELECT 
                L.id_lote, 
                V.nombre_comercial AS vacuna,
                L.fecha_fabricacion, 
                L.fecha_caducidad, 
                L.cantidad_inicial_unidades
            FROM Lotes L
            JOIN Vacunas V ON L.id_vacuna = V.id_vacuna
            ORDER BY L.fecha_fabricacion DESC
        `);
        
        res.json({
            success: true,
            count: lotes.length,
            data: lotes
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            mensaje: "Error al obtener los Lotes",
            error: error.message
        });
    }
};


const crearLote = async (req, res) => {
    try {
        const { id_vacuna, fecha_fabricacion, fecha_caducidad, cantidad_inicial_unidades } = req.body;

        
        if (!id_vacuna || !fecha_fabricacion || !fecha_caducidad || cantidad_inicial_unidades === undefined) {
            return res.status(400).json({
                success: false,
                mensaje: "ID de vacuna, fechas de fabricación/caducidad y cantidad inicial son obligatorios."
            });
        }
        
       
        const fab = new Date(fecha_fabricacion);
        const cad = new Date(fecha_caducidad);
        if (fab >= cad) {
            return res.status(400).json({
                success: false,
                mensaje: "La fecha de caducidad debe ser posterior a la fecha de fabricación."
            });
        }

        const [resultado] = await db.query(
            'INSERT INTO Lotes (id_vacuna, fecha_fabricacion, fecha_caducidad, cantidad_inicial_unidades) VALUES (?, ?, ?, ?)',
            [id_vacuna, fecha_fabricacion, fecha_caducidad, cantidad_inicial_unidades]
        );
        
   

        res.status(201).json({
            success: true,
            mensaje: "Lote registrado exitosamente",
            data: {
                id: resultado.insertId,
                id_vacuna,
                fecha_fabricacion,
                fecha_caducidad,
                cantidad_inicial_unidades
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            mensaje: "Error al registrar el Lote",
            error: error.message
        });
    }
};



module.exports = {
    obtenerLotes,
    crearLote,
   
};