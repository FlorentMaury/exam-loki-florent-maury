// backend/controllers/authController.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const validator = require('validator');
require('dotenv').config();
const axios = require('axios');
const authLog = require('debug')('authRoutes:console');

// Validation de la connexion.
exports.login = async (req, res) => {
  const { username, password } = req.body;
  authLog(`Tentative de connexion pour ${username}`);

  // Sécurité: Validation des champs vides.
  if (!username || !password) {
    return res.status(400).json({ message: 'Identifiants invalides.' });
  }

  try {
    const user = await User.findOne({ username });
    
    // Sécurité: Message générique pour éviter l'énumération d'utilisateurs.
    if (!user) {
      return res.status(401).json({ message: 'Identifiants invalides.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    
    // Sécurité: Message générique en cas d'erreur.
    if (!isMatch) {
      return res.status(401).json({ message: 'Identifiants invalides.' });
    }

    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    authLog(`Connexion réussie pour ${username}`);

    res.json({ token, role: user.role, username: user.username });
  } catch (error) {
    console.error('Erreur lors de la connexion.', error);
    res.status(500).json({ message: 'Une erreur est survenue.' });
  }
};

// Validation de l'inscription.
exports.register = async (req, res) => {
  const { username, email, password } = req.body;
  authLog(`Tentative d'inscription pour ${email}`);

  // Sécurité: Validation des champs vides.
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Tous les champs sont requis.' });
  }

  // Sécurité: Validation du format email.
  if (!validator.isEmail(email)) {
    return res.status(400).json({ message: 'Format d\'email invalide.' });
  }

  // Sécurité: Validation de la longueur du mot de passe.
  if (password.length < 8) {
    return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 8 caractères.' });
  }

  // Sécurité: Validation du nom d'utilisateur.
  if (username.length < 3) {
    return res.status(400).json({ message: 'Le nom d\'utilisateur doit contenir au moins 3 caractères.' });
  }

  try {
    // Vérifier si l'email existe déjà.
    const existingUser = await User.findOne({ email });
    
    if (existingUser) {
      authLog(`Email ${email} déjà utilisé`);
      return res.status(400).json({ message: 'Cet email est déjà utilisé.' });
    }

    // Créer un nouvel utilisateur.
    const user = new User({ username, email, password });
    await user.save();

    authLog(`Inscription réussie pour ${email}`)

    // Envoyer un email de bienvenue
    // await sendEmail(
    //   email,
    //   'Bienvenue dans notre application',
    //   `Bonjour ${username},\n\nMerci de vous être inscrit. Nous sommes ravis de vous accueillir !`
    // );

    // await axios.post('http://localhost:4002/notify', {
    //   to: email,
    //   subject: 'Bienvenue dans notre application',
    //   text: `Bonjour ${username},\n\nMerci de vous être inscrit. Nous sommes ravis de vous accueillir !`,
    // });

    res.status(201).json({ message: 'Utilisateur créé avec succès.' });
  } catch (error) {
    console.error('Erreur lors de l\'inscription', error);
    res.status(500).json({ message: 'Une erreur est survenue.' });
  }
};