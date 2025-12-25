const db = require("../config/database");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

/**
 * Registrar nuevo usuario
 * POST /api/auth/registro
 */
const registrarUsuario = async (req, res) => {
  try {
    const { nombre, email, password, rol, is_google_account, picture } =
      req.body;

    // Verificar si el email ya existe
    if (!is_google_account) {
      const [USUARIO_EXISTE] = await db.query(
        "SELECT * FROM usuarios WHERE email = ? AND is_google_account = 0",
        [email]
      );

      if (USUARIO_EXISTE.length > 0) {
        return res.status(400).json({
          success: false,
          type: "USER_EXIST",
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
    const [USUARIO_REGISTRAR] = await db.query(
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
        id: USUARIO_REGISTRAR.insertId,
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
    const { email, password } = req.body;

    // Validar campos
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        mensaje: "Email y password son obligatorios",
      });
    }

    // Buscar usuario
    const [usuarios] = await db.query(
      "SELECT * FROM usuarios WHERE email = ? AND activo = 1 AND is_google_account = 0",
      [email]
    );

    if (usuarios.length === 0) {
      return res.status(401).json({
        success: false,
        mensaje: "Credenciales inválidas",
      });
    }

    const usuario = usuarios[0];

    // Verificar password
    const passwordValido = await bcrypt.compare(password, usuario.password);

    if (!passwordValido) {
      return res.status(401).json({
        success: false,
        mensaje: "Credenciales inválidas",
      });
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
        nombre: usuario.nombre,
        email: usuario.email,
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

async function generateRandomPassword() {
  const length = 20;
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=";

  let password = "";

  for (let i = 0, n = charset.length; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * n));
  }

  const saltRounds = parseInt(process.env.BCRYPT_ROUNDS, 10) || 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  return passwordHash;
}
/**
 * Login con Google
 * POST /api/auth/google
 */

const loginGoogle = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        success: false,
        mensaje: "Token requerido",
      });
    }

    // ⚠️ OJO: decode NO valida el token (solo lee el payload)
    const decoded = jwt.decode(idToken);

    if (!decoded || !decoded.email) {
      return res.status(400).json({
        success: false,
        mensaje: "Token inválido",
      });
    }

    const { email, name, picture } = decoded;

    // Buscar usuario Google activo
    const [usuarios] = await db.query(
      `SELECT * FROM usuarios 
       WHERE email = ? 
       AND activo = 1 
       AND is_google_account = 1`,
      [email]
    );

    let usuario;

    if (usuarios.length === 0) {
      // Crear usuario Google
      const passwordHash = await generateRandomPassword();
      const [result] = await db.query(
        `INSERT INTO usuarios 
         (nombre, email, password, is_google_account, picture, activo)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          name,
          email,
          passwordHash,
          true,
          picture,
          true,
        ]
      );

      // Obtener usuario recién creado
      const [nuevoUsuario] = await db.query(
        "SELECT * FROM usuarios WHERE id = ?",
        [result.insertId]
      );

      usuario = nuevoUsuario[0];
    } else {
      usuario = usuarios[0];
    }

    // Generar JWT propio
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

    return res.json({
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
    return res.status(500).json({
      success: false,
      mensaje: "Error en login con Google",
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

module.exports = {
  registrarUsuario,
  login,
  loginGoogle,
  obtenerPerfil,
};
