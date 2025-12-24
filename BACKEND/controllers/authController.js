const db = require("../config/database");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");

/**
 * Registrar nuevo usuario
 * POST /api/auth/registro
 */
const registrarUsuario = async (req, res) => {
  try {
    // Validar errores
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errores: errors.array(),
      });
    }

    const { nombre, email, password, rol, is_google_account, picture } =
      req.body;

    // Verificar si el email ya existe
    if (!is_google_account) {
      const [usuarioExistente] = await db.query(
        "SELECT * FROM usuarios WHERE email = ?",
        [email]
      );

      if (usuarioExistente.length > 0) {
        return res.status(400).json({
          success: false,
          mensaje: "El email ya está registrado",
        });
      }
    }

    // Hashear password
    const salt = await bcrypt.genSalt(
      parseInt(process.env.BCRYPT_ROUNDS) || 10
    );
    const passwordHash = await bcrypt.hash(password, salt);

    // Insertar usuario
    const [resultado] = await db.query(
      "INSERT INTO usuarios (nombre, email, password, rol, is_google_account, picture, activo) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        nombre,
        email,
        passwordHash,
        rol || "usuario",
        is_google_account,
        picture,
        true,
      ]
    );

    res.status(201).json({
      success: true,
      mensaje: "Usuario registrado exitosamente",
      data: {
        id: resultado.insertId,
        nombre,
        email,
        rol: rol || "usuario",
        is_google_account,
        picture,
      },
    });
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    res.status(500).json({
      success: false,
      mensaje: "Error al registrar usuario",
      error: error.message,
    });
  }
};

/**
 * Iniciar sesión
 * POST /api/auth/login
 */
const login = async (req, res) => {
  try {
    const { email, password, is_google_account } = req.body;
    console.log(email);
    console.log(password);
    console.log(is_google_account);

    // Validar campos
    if (!email || !password || is_google_account) {
      return res.status(400).json({
        success: false,
        mensaje: "Email y password son obligatorios",
      });
    }

    // Buscar usuario
    const [usuarios] = await db.query(
      "SELECT * FROM usuarios WHERE email = ? AND activo = 1",
      [email]
    );

    if (usuarios.length === 0) {
      return res.status(401).json({
        success: false,
        mensaje: "Credenciales inválidas",
      });
    }

    const usuario = usuarios[0];

    if (!is_google_account) {
      // Verificar password
      const passwordValido = await bcrypt.compare(password, usuario.password);

      if (!passwordValido) {
        return res.status(401).json({
          success: false,
          mensaje: "Credenciales inválidas",
        });
      }
    }

    // Actualizar última conexión
    await db.query(
      "UPDATE usuarios SET ultima_conexion = CURRENT_TIMESTAMP WHERE id = ?",
      [usuario.id]
    );

    // Generar token JWT
    const token = jwt.sign(
      {
        id: usuario.id,
        email: usuario.email,
        nombre: usuario.nombre,
        rol: usuario.rol,
        picture: usuario.picture,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "24h" }
    );

    res.json({
      success: true,
      mensaje: "Inicio de sesión exitoso",
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        picture: usuario.picture,
      },
    });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({
      success: false,
      mensaje: "Error al iniciar sesión",
      error: error.message,
    });
  }
};

/**
 * Obtener perfil del usuario autenticado
 * GET /api/auth/perfil
 */
const obtenerPerfil = async (req, res) => {
  try {
    const [usuarios] = await db.query(
      "SELECT id, nombre, email, rol, fecha_registro, ultima_conexion FROM usuarios WHERE id = ?",
      [req.usuario.id]
    );

    if (usuarios.length === 0) {
      return res.status(404).json({
        success: false,
        mensaje: "Usuario no encontrado",
      });
    }

    res.json({
      success: true,
      data: usuarios[0],
    });
  } catch (error) {
    console.error("Error al obtener perfil:", error);
    res.status(500).json({
      success: false,
      mensaje: "Error al obtener perfil",
      error: error.message,
    });
  }
};

/**
 * Login con Google
 * POST /api/auth/google
 */
const loginGoogle = async (req, res) => {
  try {
    const { idToken } = req.body;
    const jwt = require("jsonwebtoken");
    const decoded = jwt.decode(idToken);

    if (!decoded || !decoded.email) {
      return res.status(400).json({
        success: false,
        mensaje: "Token inválido",
      });
    }

    const { email, name, picture } = decoded;

    // Buscar usuario por email
    const [usuarios] = await db.query(
      "SELECT * FROM usuarios WHERE email = ? AND activo = 1 AND is_google_account = 1",
      [email]
    );

    let usuario;

    if (usuarios.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          type: "USER_NOT_FOUND",
        },
      });
    }

    usuario = usuarios[0];

    // Generar token JWT
    const token = jwt.sign(
      {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        is_google_account: usuario.is_google_account,
        picture: usuario.picture,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Actualizar última conexión
    await db.query(
      "UPDATE usuarios SET ultima_conexion = CURRENT_TIMESTAMP WHERE id = ?",
      [usuario.id]
    );

    res.json({
      success: true,
      mensaje: "Login exitoso",
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        is_google_account: usuario.is_google_account,
        picture: usuario.picture,
      },
    });
  } catch (error) {
    console.error("Error en login Google:", error);
    res.status(500).json({
      success: false,
      mensaje: "Error en login con Google",
    });
  }
};

module.exports = {
  registrarUsuario,
  login,
  loginGoogle,
  obtenerPerfil,
};
