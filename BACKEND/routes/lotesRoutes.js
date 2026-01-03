const express = require('express');
const router = express.Router();
const {
    obtenerLotes,
    crearLote,
    obtenerLotePorId,
    actualizarLote,
    eliminarLote,
    actualizarCantidadInicialLote,
    obtenerLotes_Medicion
} = require('../controllers/lotesController');


router.get('/', obtenerLotes);
router.get('/lotes_medicion/', obtenerLotes_Medicion);

router.get('/:id', obtenerLotePorId);

router.post('/', crearLote);

router.put('/:id', actualizarLote);

router.put('/actualizarcantidad/:id', actualizarCantidadInicialLote);

router.delete('/:id', eliminarLote);

module.exports = router;