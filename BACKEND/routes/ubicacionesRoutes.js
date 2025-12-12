const express = require('express');
const router = express.Router();
const {
    obtenerUbicaciones,
    crearUbicacion,
    actualizarUbicacion,
    eliminarUbicacion,
} = require('../controllers/ubicacionesController');


router.get('/', obtenerUbicaciones);

router.post('/', crearUbicacion);

router.put('/:id', actualizarUbicacion);

router.delete('/:id', eliminarUbicacion);

module.exports = router;