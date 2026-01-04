const express = require('express');
const router = express.Router();
const {
    obtenerUbicaciones,
    crearUbicacion,
    actualizarUbicacion,
    eliminarUbicacion,
    obtenerUbicacionPorId,
    obtenerUbicaciones_Cliente,
    obtenerUbicaciones_Distribuidor
} = require('../controllers/ubicacionesController');


router.get('/', obtenerUbicaciones);
router.get('/clientes', obtenerUbicaciones_Cliente);
router.get('/distribuidores', obtenerUbicaciones_Distribuidor);


router.post('/', crearUbicacion);

router.get('/:id', obtenerUbicacionPorId);

router.put('/:id', actualizarUbicacion);

router.delete('/:id', eliminarUbicacion);

module.exports = router;