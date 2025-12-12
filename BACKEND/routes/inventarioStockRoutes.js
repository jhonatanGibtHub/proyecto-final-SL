const express = require('express');
const router = express.Router();
const {
    obtenerInventarioStock,
    crearInventarioStock,
    actualizarInventarioStock,

} = require('../controllers/inventarioStockController');


router.get('/', obtenerInventarioStock);

router.post('/', crearInventarioStock);

router.put('/:id', actualizarInventarioStock);


module.exports = router;