const express = require('express');
const router = express.Router();
const {
    obtenerMediciones,
    crearMedicion
} = require('../controllers/medicionesTempController');


router.get('/', obtenerMediciones);

router.post('/', crearMedicion);

module.exports = router;