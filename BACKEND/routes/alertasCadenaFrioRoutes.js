const express = require('express');
const router = express.Router();
const {
    obtenerAlertas,
    crearAlerta, 
    cambiarEstadoAlerta,
    obtenerAlertaPorId,
    eliminarAlerta
} = require('../controllers/alertasCadenaFrioController');


router.get('/', obtenerAlertas);

router.get('/:id', obtenerAlertaPorId);

router.post('/', crearAlerta); 

router.put('/:id/estado', cambiarEstadoAlerta);

router.delete('/:id', eliminarAlerta);

module.exports = router;

module.exports = router;