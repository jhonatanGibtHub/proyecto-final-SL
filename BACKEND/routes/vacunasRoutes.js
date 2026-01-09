const express = require('express');
const router = express.Router();
const {
    obtenerVacunas,
    crearVacuna,
    actualizarVacuna,
    eliminarVacuna,
    obtenerVacunaPorId
} = require('../controllers/vacunasController');

router.get('/', obtenerVacunas); 

router.get('/:id', obtenerVacunaPorId);

router.post('/', crearVacuna); 

router.put('/:id', actualizarVacuna); 

router.delete('/:id', eliminarVacuna); 

module.exports = router;