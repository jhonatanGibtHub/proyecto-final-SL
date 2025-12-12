const express = require('express');
const router = express.Router();
const {
    obtenerAlertas,
    crearAlerta, 
    cambiarEstadoAlerta, 
} = require('../controllers/alertasCadenaFrioController');


router.get('/', obtenerAlertas);

router.post('/', crearAlerta); 

router.put('/:id/estado', cambiarEstadoAlerta);

module.exports = router;