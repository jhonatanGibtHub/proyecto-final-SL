const express = require('express');
const router = express.Router();
const {
    obtenerUbicaciones,
    crearUbicacion,
    actualizarUbicacion,
    eliminarUbicacion,
    obtenerUbicacionPorId
} = require('../controllers/ubicacionesController');


router.get('/', obtenerUbicaciones);

router.post('/', crearUbicacion);

router.get('/:id', obtenerUbicacionPorId);

router.put('/:id', actualizarUbicacion);

router.delete('/:id', eliminarUbicacion);

module.exports = router;