const express = require('express');
const router = express.Router();
const {
    obtenerInventarioStock,
    crearInventarioStock,
    obtenerInventarioStockPorId,
    eliminarInventarioStock,
    actualizarCantidadInventario
} = require('../controllers/inventarioStockController');


router.get('/', obtenerInventarioStock);

router.get('/:id', obtenerInventarioStockPorId);

router.post('/', crearInventarioStock);

router.put('/actualizarcantidad/:id', actualizarCantidadInventario);

router.delete('/:id', eliminarInventarioStock);


module.exports = router;