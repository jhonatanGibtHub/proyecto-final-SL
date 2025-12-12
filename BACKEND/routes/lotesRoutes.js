const express = require('express');
const router = express.Router();
const {
    obtenerLotes,
    crearLote,
    
} = require('../controllers/lotesController');


router.get('/', obtenerLotes);

router.post('/', crearLote);

module.exports = router;