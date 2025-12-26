const express = require('express');
const router = express.Router();
const {
    obtenerMovimientos,
    obtenerMovimientoPorId,
    crearMovimiento,
    actualizarMovimiento,
    registrarRecepcion,
    eliminarMovimiento
} = require('../controllers/registroMovimientoController');


router.get('/', obtenerMovimientos);
router.get('/:id', obtenerMovimientoPorId);
router.post('/', crearMovimiento);
router.put('/:id', actualizarMovimiento);
router.put('/:id/recepcion', registrarRecepcion);
router.delete('/:id', eliminarMovimiento);

module.exports = router;