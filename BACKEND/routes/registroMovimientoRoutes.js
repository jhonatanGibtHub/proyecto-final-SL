const express = require('express');
const router = express.Router();
const {
    obtenerMovimientos,
    obtenerMovimientoPorId,
    crearMovimiento,
    actualizarMovimiento,
    eliminarMovimiento,
    marcarRecepcionAutomatica
} = require('../controllers/registroMovimientoController');


router.get('/', obtenerMovimientos);
router.get('/:id', obtenerMovimientoPorId);
router.post('/', crearMovimiento);
router.put('/:id', actualizarMovimiento);
router.put('/recepcion/:id', marcarRecepcionAutomatica);
router.delete('/:id', eliminarMovimiento);

module.exports = router;