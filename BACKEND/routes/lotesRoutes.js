const express = require('express');
const router = express.Router();
const {
    obtenerLotes,
    crearLote,
    obtenerLotePorId,
    actualizarLote,
    eliminarLote
} = require('../controllers/lotesController');


router.get('/', obtenerLotes);

router.get('/:id', obtenerLotePorId);

router.post('/', crearLote);

router.put('/:id', actualizarLote);

router.delete('/:id', eliminarLote);

module.exports = router;