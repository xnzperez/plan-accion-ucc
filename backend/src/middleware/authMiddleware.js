const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  // Obtener el token del encabezado de autorización
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Acceso Denegado. Token no proporcionado.' });
  }

  // El token usualmente viene como 'Bearer [token]' solo necesitamos el token
  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Formato de token inválido.' });
  }

  try {
    // Verificación del token
    const decoded = jwt.verify(token, 'secretkey');

    // Guardar los datos del usuario decodificado en el objeto 'req' para su uso posterior
    req.user = decoded.user;
    next(); // Pasar al siguiente middleware o ruta
  } catch (err) {
    return res.status(400).json({ error: 'Token inválido.' });
  }
}

// Nueva Función: recibe el rol permitido como argumento
const checkRole = (allowedRole) => {
  return (req, res, next) => {
    // req.user fue establecido por el middleware anterior
    if (!req.user || req.user.role !== allowedRole) {
      return res.status(403).json({ error: 'Acceso Prohibido. No tienes los permisos necesarios' });
    }
    next(); // El rol es permitido, pasar al siguiente middleware o ruta
  };
};

module.exports = {
  authMiddleware,
  checkRole,
};
