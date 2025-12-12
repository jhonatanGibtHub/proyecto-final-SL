const express = require('express');
const router = express.Router();
const {
    obtenerTransportistas,
    crearTransportista,
    actualizarTransportista,
    eliminarTransportista,
} = require('../controllers/transportistasController');


router.get('/', obtenerTransportistas);

router.post('/', crearTransportista);

router.put('/:id', actualizarTransportista);

router.delete('/:id', eliminarTransportista);

module.exports = router;