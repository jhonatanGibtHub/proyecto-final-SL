const db = require('../config/database');


const obtenerMovimientos = async (req, res) => {
    try {
       
        const [movimientos] = await db.query(`
            SELECT 
                RM.id_movimiento, 
                RM.id_lote, 
                UO.nombre AS origen,
                UD.nombre AS destino,
                T.nombre AS transportista,
                RM.fecha_envio, 
                RM.fecha_recepcion
            FROM Registro_Movimiento RM
            JOIN Ubicaciones UO ON RM.ubicacion_origen = UO.id_ubicacion
            JOIN Ubicaciones UD ON RM.ubicacion_destino = UD.id_ubicacion
            JOIN Transportistas T ON RM.id_transportista = T.id_transportista
            ORDER BY RM.fecha_envio DESC
        `);
        
        res.json({
            success: true,
            count: movimientos.length,
            data: movimientos
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            mensaje: "Error al obtener el Historial de Movimientos",
            error: error.message
        });
    }
};


const crearMovimiento = async (req, res) => {
    try {
        const { id_lote, ubicacion_origen, ubicacion_destino, id_transportista } = req.body;

        // Validación básica
        if (!id_lote || !ubicacion_origen || !ubicacion_destino || !id_transportista) {
            return res.status(400).json({
                success: false,
                mensaje: "Lote, origen, destino y transportista son obligatorios para iniciar un movimiento."
            });
        }
        
        
        const [resultado] = await db.query(
            'INSERT INTO Registro_Movimiento (id_lote, ubicacion_origen, ubicacion_destino, id_transportista) VALUES (?, ?, ?, ?)',
            [id_lote, ubicacion_origen, ubicacion_destino, id_transportista]
        );
        
       

        res.status(201).json({
            success: true,
            mensaje: "Movimiento iniciado y registrado exitosamente. Lote en tránsito.",
            data: {
                id: resultado.insertId,
                id_lote,
                ubicacion_origen,
                ubicacion_destino
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            mensaje: "Error al crear el registro de Movimiento",
            error: error.message
        });
    }
};


const registrarRecepcion = async (req, res) => {
    try {
        const { id } = req.params; 
        const { fecha_recepcion } = req.body; 

       
        const [movimientoExistente] = await db.query('SELECT fecha_recepcion FROM Registro_Movimiento WHERE id_movimiento = ?', [id]);
        if (movimientoExistente.length === 0) {
            return res.status(404).json({
                success: false,
                mensaje: "Registro de Movimiento no encontrado."
            });
        }
        
        if (movimientoExistente[0].fecha_recepcion !== null) {
            return res.status(400).json({
                success: false,
                mensaje: "Este movimiento ya ha sido marcado como recibido."
            });
        }
        
      
        await db.query(
            'UPDATE Registro_Movimiento SET fecha_recepcion=? WHERE id_movimiento=?',
            [fecha_recepcion || new Date(), id] 
        );
        
     
        res.status(200).json({
            success: true,
            mensaje: "Recepción de lote registrada exitosamente. Movimiento finalizado.",
            data: { id, fecha_recepcion }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            mensaje: "Error al registrar la recepción del Movimiento",
            error: error.message
        });
    }
};


const eliminarMovimiento = async (req, res) => {
    try {
        const { id } = req.params;
        const [resultado] = await db.query('DELETE FROM Registro_Movimiento WHERE id_movimiento = ?', [id]);

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                mensaje: "Movimiento no encontrado"
            });
        }

        res.json({
            success: true,
            mensaje: "Movimiento eliminado exitosamente"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            mensaje: "Error al eliminar el movimiento",
            error: error.message
        });
    }
};

const obtenerMovimientoPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const [movimientos] = await db.query(`
            SELECT 
                RM.id_movimiento, 
                RM.id_lote, 
                RM.ubicacion_origen,
                RM.ubicacion_destino,
                RM.id_transportista,
                RM.fecha_envio, 
                RM.fecha_recepcion
            FROM Registro_Movimiento RM
            WHERE RM.id_movimiento = ?
        `, [id]);
        
        if (movimientos.length === 0) {
            return res.status(404).json({
                success: false,
                mensaje: "Movimiento no encontrado"
            });
        }

        res.json({
            success: true,
            data: movimientos[0]
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            mensaje: "Error al obtener el movimiento",
            error: error.message
        });
    }
};

const actualizarMovimiento = async (req, res) => {
    try {
        const { id } = req.params;
        const { id_lote, ubicacion_origen, ubicacion_destino, id_transportista, fecha_envio, fecha_recepcion } = req.body;

        if (!id_lote || !ubicacion_origen || !ubicacion_destino || !id_transportista || !fecha_envio || !fecha_recepcion) {
            return res.status(400).json({
                success: false,
                mensaje: "Todos los campos son obligatorios."
            });
        }

        const [resultado] = await db.query(
            'UPDATE Registro_Movimiento SET id_lote = ?, ubicacion_origen = ?, ubicacion_destino = ?, id_transportista = ?, fecha_envio = ?, fecha_recepcion = ? WHERE id_movimiento = ?',
            [id_lote, ubicacion_origen, ubicacion_destino, id_transportista, fecha_envio, fecha_recepcion, id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                mensaje: "Movimiento no encontrado"
            });
        }

        res.json({
            success: true,
            mensaje: "Movimiento actualizado exitosamente",
            data: { id, id_lote, ubicacion_origen, ubicacion_destino, id_transportista, fecha_envio, fecha_recepcion }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            mensaje: "Error al actualizar el movimiento",
            error: error.message
        });
    }
};

module.exports = {
    obtenerMovimientos,
    obtenerMovimientoPorId,
    crearMovimiento,
    actualizarMovimiento,
    registrarRecepcion,
    eliminarMovimiento
};