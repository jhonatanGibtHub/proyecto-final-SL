const express = require('express');
const router = express.Router();
const {
    obtenerMediciones,
    obtenerMedicionPorId,
    crearMedicion,
    actualizarMedicion,
    eliminarMedicion,
    actualizarTemperatura,
} = require('../controllers/medicionesTempController');


router.get('/', obtenerMediciones);
router.get('/:id', obtenerMedicionPorId);
router.post('/', crearMedicion);

router.put('/actualizartemp/:id', actualizarTemperatura);

router.put('/:id', actualizarMedicion);
router.delete('/:id', eliminarMedicion);

module.exports = router;