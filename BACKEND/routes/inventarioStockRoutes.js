const express = require('express');
const router = express.Router();
const {
    obtenerInventarioStock,
    crearInventarioStock,
    actualizarInventarioStock,
    obtenerInventarioStockPorId,
    eliminarInventarioStock
} = require('../controllers/inventarioStockController');


router.get('/', obtenerInventarioStock);

router.get('/:id', obtenerInventarioStockPorId);

router.post('/', crearInventarioStock);

router.put('/:id', actualizarInventarioStock);

router.delete('/:id', eliminarInventarioStock);


module.exports = router;