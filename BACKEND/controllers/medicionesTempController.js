const db = require('../config/database');

const { crearAlertaInterna } = require('./alertasCadenaFrioController');



const obtenerMediciones = async (req, res) => {
    try {
        const [mediciones] = await db.query(`
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
            count: mediciones.length,
            data: mediciones
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            mensaje: "Error al obtener las Mediciones de Temperatura",
            error: error.message
        });
    }
};



const crearMedicion = async (req, res) => {
    try {
        const { id_sensor, id_lote, temperatura_c } = req.body;

        if (!id_sensor || !id_lote || temperatura_c === undefined || isNaN(temperatura_c)) {
            return res.status(400).json({
                success: false,
                mensaje: "ID de sensor, ID de lote y temperatura son obligatorios."
            });
        }

        const [resultado] = await db.query(
            'INSERT INTO Mediciones_Temp (id_sensor, id_lote, temperatura_c) VALUES (?, ?, ?)',
            [id_sensor, id_lote, temperatura_c]
        );
        const id_medicion_nueva = resultado.insertId;

        
        const [rangos] = await db.query(`
            SELECT V.temp_min_c, V.temp_max_c 
            FROM Lotes L
            JOIN Vacunas V ON L.id_vacuna = V.id_vacuna
            WHERE L.id_lote = ?
        `, [id_lote]);

        let tipo_alerta = null;

        if (rangos.length > 0) {
            const { temp_min_c, temp_max_c } = rangos[0];
            
            // Lógica de verificación
            if (temperatura_c > temp_max_c) {
                tipo_alerta = 'Máx. Excedida';
            } else if (temperatura_c < temp_min_c) {
                tipo_alerta = 'Mín. Violada';
            }
            
            // Alerta
            if (tipo_alerta) {
                await crearAlertaInterna({
                    id_medicion: id_medicion_nueva,
                    id_lote: id_lote,
                    tipo_alerta: tipo_alerta
                });
            }
        } 

        res.status(201).json({
            success: true,
            mensaje: "Medición de temperatura registrada exitosamente" + (tipo_alerta ? " y ALERTA GENERADA automáticamente." : "."),
            data: { id: id_medicion_nueva, id_sensor, id_lote, temperatura_c }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            mensaje: "Error al registrar la Medición",
            error: error.message
        });
    }
};


module.exports = {
    obtenerMediciones,
    crearMedicion,
};