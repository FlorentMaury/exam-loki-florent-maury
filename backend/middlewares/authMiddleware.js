// backend/middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');

// Middleware d'authentification sécurisé.
exports.authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];

  // Sécurité: Vérifier la présence du token.
  if (!token) {
    return res.status(401).json({ message: 'Token manquant.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Erreur de vérification du token.', error);
    // Sécurité: Message générique pour éviter l'exposition d'informations.
    return res.status(403).json({ message: 'Token invalide.' });
  }
};
  }
};

exports.isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Accès interdit' });
  next();
};