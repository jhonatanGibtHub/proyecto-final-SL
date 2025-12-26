const express = require('express');
const router = express.Router();
const {
    obtenerMediciones,
    obtenerMedicionPorId,
    crearMedicion,
    actualizarMedicion,
    eliminarMedicion
} = require('../controllers/medicionesTempController');


router.get('/', obtenerMediciones);
router.get('/:id', obtenerMedicionPorId);
router.post('/', crearMedicion);
router.put('/:id', actualizarMedicion);
router.delete('/:id', eliminarMedicion);

module.exports = router;