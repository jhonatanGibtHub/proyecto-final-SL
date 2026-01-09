const db = require('../config/database');

const obtenerVacunas = async (req, res) => {
    try {
        const [Vacunas] = await db.query('SELECT * FROM vacunas');
        res.json({
            success: true,
            count: Vacunas.length,
            data: Vacunas
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            mensaje: "Error al obtener las Vacunas",
            error: error.message
        });
    }
};

const crearVacunas = async (req, res) => {
    try {
        const { nombre_comercial, fabricante, temp_min_c, temp_max_c } = req.body;
        const [resultado] = await db.query(
            'INSERT INTO Vacunas(nombre_comercial, fabricante, temp_min_c, temp_max_c) VALUES (?,?,?,?)',
            [nombre_comercial, fabricante, temp_min_c, temp_max_c]
        );

        res.status(201).json({
            success: true,
            mensaje: "Vacuna creada exitosamente",
            data: {
                id: resultado.insertId,
                nombre_comercial,
                fabricante,
                temp_min_c,
                temp_max_c
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            mensaje: "Error al crear la Vacuna",
            error: error.message
        });
    }
};


const actualizarVacunas = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre_comercial, fabricante, temp_min_c, temp_max_c } = req.body;

       
        const [VacunasExistente] = await db.query('SELECT * FROM vacunas WHERE id_vacuna= ?', [id]);
        if (VacunasExistente.length === 0) {
            return res.status(404).json({
                success: false,
                mensaje: "Vacuna no encontrada"
            });
        }
        
      
        if (isNaN(temp_min_c) || isNaN(temp_max_c) || temp_min_c >= temp_max_c) {
            return res.status(400).json({
                success: false,
                mensaje: "Los rangos de temperatura (T_min y T_max) son inválidos o T_min no es menor que T_max."
            });
        }

        
        await db.query(
            'UPDATE vacunas set nombre_comercial=?, fabricante=?, temp_min_c=?, temp_max_c=? where id_vacuna=?',
            [nombre_comercial, fabricante, temp_min_c, temp_max_c, id]
        );

        res.status(200).json({ 
            success: true,
            mensaje: "Vacuna actualizada exitosamente",
            data: {
                id,
                nombre_comercial,
                fabricante,
                temp_min_c,
                temp_max_c
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            mensaje: "Error al modificar la Vacuna",
            error: error.message
        });
    }
};


const eliminarVacunas = async (req, res) => {
    try {
        const { id } = req.params;

        
        const [VacunasExistente] = await db.query('SELECT * FROM vacunas WHERE id_vacuna= ?', [id]);
        if (VacunasExistente.length === 0) {
            return res.status(404).json({
                success: false,
                mensaje: "Vacuna no encontrada"
            });
        }

        
        await db.query(
            'DELETE FROM vacunas where id_vacuna=?',
            [id]
        );

        res.status(200).json({ 
            success: true,
            mensaje: "Vacuna eliminada exitosamente",
        });

    } catch (error) {
       
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
             return res.status(409).json({ 
                 success: false,
                 mensaje: "No se puede eliminar esta vacuna. Existen lotes registrados que dependen de ella."
             });
         }
        
        res.status(500).json({
            success: false,
            mensaje: "Error al eliminar la Vacuna",
            error: error.message
        });
    }
};


const obtenerVacunaPorId = async (req, res) => {
    try {
        const { id } = req.params;

        
        const [Vacuna] = await db.query('SELECT * FROM vacunas WHERE id_vacuna = ?', [id]);

        if (Vacuna.length === 0) {
          
            return res.status(404).json({
                success: false,
                mensaje: "Vacuna no encontrada"
            });
        }

       
        res.status(200).json({
            success: true,
            mensaje: "Vacuna obtenida exitosamente",
            data: Vacuna[0] 
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            mensaje: "Error al obtener la Vacuna por ID",
            error: error.message
        });
    }
};

module.exports = {
    obtenerVacunas,
    crearVacunas,
    actualizarVacunas,
    eliminarVacunas,
    obtenerVacunaPorId
};