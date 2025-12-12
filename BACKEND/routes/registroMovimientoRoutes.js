const express = require('express');
const router = express.Router();
const {
    obtenerMovimientos,
    crearMovimiento,
    registrarRecepcion
} = require('../controllers/registroMovimientoController');


router.get('/', obtenerMovimientos);

router.post('/', crearMovimiento);

router.put('/:id/recepcion', registrarRecepcion); 

module.exports = router;