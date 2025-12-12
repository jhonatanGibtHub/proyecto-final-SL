const express = require('express');
const router = express.Router();
const {
    obtenerVacunas,
    crearVacunas,
    actualizarVacunas,
    eliminarVacunas,
} = require('../controllers/vacunasController');


router.get('/', obtenerVacunas); 

router.post('/', crearVacunas); 

router.put('/:id', actualizarVacunas); 

router.delete('/:id', eliminarVacunas); 

module.exports = router;