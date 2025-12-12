const express = require('express');
const router = express.Router();
const {
    obtenerSensores,
    crearSensor,
    actualizarSensor
    
} = require('../controllers/sensoresTempController');


router.get('/', obtenerSensores);

router.post('/', crearSensor);

router.put('/:id', actualizarSensor);


module.exports = router;