const db = require('../config/database');


const obtenerSensores = async (req, res) => {
    try {
       
        const [sensores] = await db.query(`
            SELECT 
                ST.id_sensor, 
                ST.codigo_serie, 
                U.nombre AS ubicacion_actual,
                ST.ultima_calibracion
            FROM Sensores_Temp ST
            LEFT JOIN Ubicaciones U ON ST.id_ubicacion_actual = U.id_ubicacion
        `);
        
        res.json({
            success: true,
            count: sensores.length,
            data: sensores
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            mensaje: "Error al obtener los Sensores de Temperatura",
            error: error.message
        });
    }
};

const obtenerSensorPorId = async (req, res) => {
    try {
        const { id } = req.params;
        
        const [sensores] = await db.query(`
            SELECT 
                ST.id_sensor, 
                ST.codigo_serie, 
                ST.id_ubicacion_actual,
                U.nombre AS ubicacion_actual,
                ST.ultima_calibracion
            FROM Sensores_Temp ST
            LEFT JOIN Ubicaciones U ON ST.id_ubicacion_actual = U.id_ubicacion
            WHERE ST.id_sensor = ?
        `, [id]);
        
        if (sensores.length === 0) {
            return res.status(404).json({
                success: false,
                mensaje: "Sensor no encontrado"
            });
        }
        
        res.json({
            success: true,
            data: sensores[0]
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            mensaje: "Error al obtener el sensor",
            error: error.message
        });
    }
};


const crearSensor = async (req, res) => {
    try {
        const { codigo_serie, id_ubicacion_actual, ultima_calibracion } = req.body;

       
        let fechaCalibracion = ultima_calibracion;
        if (ultima_calibracion && typeof ultima_calibracion === 'string') {
            
            const date = new Date(ultima_calibracion);
            if (!isNaN(date.getTime())) {
                fechaCalibracion = date.toISOString().split('T')[0]; 
            }
        } else if (ultima_calibracion instanceof Date) {
            fechaCalibracion = ultima_calibracion.toISOString().split('T')[0];
        }

        const [resultado] = await db.query(
            'INSERT INTO Sensores_Temp (codigo_serie, id_ubicacion_actual, ultima_calibracion) VALUES (?, ?, ?)',
            [codigo_serie, id_ubicacion_actual, fechaCalibracion]
        );

        res.status(201).json({
            success: true,
            mensaje: "Sensor registrado exitosamente",
            data: {
                id: resultado.insertId,
                codigo_serie,
                id_ubicacion_actual,
                ultima_calibracion: fechaCalibracion
            }
        });

    } catch (error) {
   
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ 
                success: false,
                mensaje: "El código de serie del sensor ya existe."
            });
        }
        res.status(500).json({
            success: false,
            mensaje: "Error al crear el registro del Sensor",
            error: error.message
        });
    }
};


const actualizarSensor = async (req, res) => {
    try {
        const { id } = req.params; 
        const { id_ubicacion_actual, ultima_calibracion } = req.body;

       
        let fechaCalibracion = ultima_calibracion;
        if (ultima_calibracion && typeof ultima_calibracion === 'string') {
           
            const date = new Date(ultima_calibracion);
            if (!isNaN(date.getTime())) {
                fechaCalibracion = date.toISOString().split('T')[0]; 
            }
        } else if (ultima_calibracion instanceof Date) {
            fechaCalibracion = ultima_calibracion.toISOString().split('T')[0];
        }

        
        const [sensorExistente] = await db.query('SELECT * FROM Sensores_Temp WHERE id_sensor = ?', [id]);
        if (sensorExistente.length === 0) {
            return res.status(404).json({
                success: false,
                mensaje: "Sensor no encontrado."
            });
        }
        
       
        const [resultado] = await db.query(
            'UPDATE Sensores_Temp SET id_ubicacion_actual=?, ultima_calibracion=? WHERE id_sensor=?',
            [id_ubicacion_actual, fechaCalibracion, id]
        );
        
        if (resultado.affectedRows === 0) {
             return res.status(404).json({
                success: false,
                mensaje: "Error al actualizar el sensor. Ningún registro afectado."
            });
        }

        res.status(200).json({
            success: true,
            mensaje: "Sensor actualizado (ubicación/calibración) exitosamente.",
            data: { id, id_ubicacion_actual, ultima_calibracion: fechaCalibracion }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            mensaje: "Error al modificar el Sensor",
            error: error.message
        });
    }
};


const eliminarSensor = async (req, res) => {
    try {
        const { id } = req.params;
        
        const [resultado] = await db.query('DELETE FROM Sensores_Temp WHERE id_sensor = ?', [id]);
        
        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                mensaje: "Sensor no encontrado."
            });
        }
        
        res.json({
            success: true,
            mensaje: "Sensor eliminado exitosamente"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            mensaje: "Error al eliminar el sensor",
            error: error.message
        });
    }
};


module.exports = {
    obtenerSensores,
    obtenerSensorPorId,
    crearSensor,
    actualizarSensor,
    eliminarSensor
};