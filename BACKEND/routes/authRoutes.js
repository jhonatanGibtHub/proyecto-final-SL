const express = require('express');
const router = express.Router();

const {
    registrarUsuario,
    login,
    loginGoogle,
    obtenerPerfil,
    obtenerUsuarios,
    toggleActivoUsuario,
    cambiarRolUsuario,
    obtenerUsuarioPorId,
    eliminarUsuario
} = require('../controllers/authController');

const { verificarToken, verificarAdmin } = require('../middleware/auth.middleware');

// Rutas públicas
router.post('/registro', registrarUsuario);
router.post('/login', login);
router.post('/login/google', loginGoogle);

// Rutas protegidas
router.get('/perfil', verificarToken, obtenerPerfil);

// Rutas de admin
router.get('/usuarios', verificarToken, verificarAdmin, obtenerUsuarios);
router.get('/usuarios/:id', verificarToken, verificarAdmin, obtenerUsuarioPorId);
router.put('/usuarios/:id/toggle-activo', verificarToken, verificarAdmin, toggleActivoUsuario);
router.put('/usuarios/:id/rol', verificarToken, verificarAdmin, cambiarRolUsuario);
router.delete('/usuarios/:id', verificarToken, verificarAdmin, eliminarUsuario);

module.exports = router;