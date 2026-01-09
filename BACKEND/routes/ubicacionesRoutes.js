const express = require('express');
const router = express.Router();
const {
    obtenerUbicaciones,
    crearUbicacion,
    actualizarUbicacion,
    eliminarUbicacion,
    obtenerUbicacionPorId,
    ubicacionesClientes,
    ubicacionesDistribuidor
} = require('../controllers/ubicacionesController');


router.get('/', obtenerUbicaciones);
router.get('/clientes', ubicacionesClientes);
router.get('/distribuidores', ubicacionesDistribuidor);


router.post('/', crearUbicacion);

router.get('/:id', obtenerUbicacionPorId);

router.put('/:id', actualizarUbicacion);

router.delete('/:id', eliminarUbicacion);

module.exports = router;