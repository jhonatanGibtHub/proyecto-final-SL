const express = require('express');
const router = express.Router();
const {
    obtenerSensores,
    obtenerSensorPorId,
    crearSensor,
    actualizarSensor,
    eliminarSensor
} = require('../controllers/sensoresTempController');


router.get('/', obtenerSensores);
router.get('/:id', obtenerSensorPorId);
router.post('/', crearSensor);
router.put('/:id', actualizarSensor);
router.delete('/:id', eliminarSensor);


module.exports = router;