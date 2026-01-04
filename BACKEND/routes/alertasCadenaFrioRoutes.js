const express = require('express');
const router = express.Router();
const {
    obtenerAlertas,
    crearAlerta, 
    cambiarEstadoAlerta,
    obtenerAlertaPorId,
    eliminarAlerta,
    actualizarOCrearAlerta
} = require('../controllers/alertasCadenaFrioController');


router.get('/', obtenerAlertas);

router.get('/:id', obtenerAlertaPorId);

router.post('/', crearAlerta); 

router.put('/:id/estado', cambiarEstadoAlerta);

router.post('/enviaralerta/', actualizarOCrearAlerta);

router.delete('/:id', eliminarAlerta);

module.exports = router;

module.exports = router;