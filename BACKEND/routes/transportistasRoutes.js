const express = require('express');
const router = express.Router();
const {
    obtenerTransportistas,
    crearTransportista,
    actualizarTransportista,
    eliminarTransportista,
    obtenerTransportistaPorId
} = require('../controllers/transportistasController');


router.get('/', obtenerTransportistas);

router.post('/', crearTransportista);

router.get('/:id', obtenerTransportistaPorId);

router.put('/:id', actualizarTransportista);

router.delete('/:id', eliminarTransportista);

module.exports = router;