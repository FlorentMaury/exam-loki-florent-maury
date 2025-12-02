// backend/controllers/authController.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const validator = require('validator');
require('dotenv').config();
const axios = require('axios');
const authLog = require('debug')('authRoutes:console');

// Validation de la connexion sécurisée.
exports.login = async (req, res) => {
  const { username, password } = req.body;

  // Sécurité: Validation des champs vides.
  if (!username || !password) {
    return res.status(400).json({ message: 'Identifiants invalides.' });
  }

  // Sécurité: Validation du type de données.
  if (typeof username !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ message: 'Identifiants invalides.' });
  }

  // Sécurité: Validation de la longueur minimale.
  if (username.length < 3 || password.length < 8) {
    return res.status(400).json({ message: 'Identifiants invalides.' });
  }

  // Sécurité: Validation de la longueur maximale.
  if (username.length > 50 || password.length > 128) {
    return res.status(400).json({ message: 'Identifiants invalides.' });
  }

  // Sécurité: Sanitization - suppression des espaces.
  const sanitizedUsername = username.trim();
  const sanitizedPassword = password.trim();

  authLog(`Tentative de connexion pour ${sanitizedUsername}`);

  try {
    const user = await User.findOne({ username: sanitizedUsername });
    
    // Sécurité: Message générique pour éviter l'énumération d'utilisateurs.
    if (!user) {
      return res.status(401).json({ message: 'Identifiants invalides.' });
    }

    const isMatch = await bcrypt.compare(sanitizedPassword, user.password);
    
    // Sécurité: Message générique en cas d'erreur.
    if (!isMatch) {
      return res.status(401).json({ message: 'Identifiants invalides.' });
    }

    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    authLog(`Connexion réussie pour ${sanitizedUsername}`);

    res.json({ token, role: user.role, username: user.username });
  } catch (error) {
    console.error('Erreur lors de la connexion.', error);
    res.status(500).json({ message: 'Une erreur est survenue.' });
  }
};

// Validation de l'inscription sécurisée.
exports.register = async (req, res) => {
  const { username, email, password } = req.body;

  // Sécurité: Validation des champs vides.
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Tous les champs sont requis.' });
  }

  // Sécurité: Validation du type de données.
  if (typeof username !== 'string' || typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ message: 'Format de données invalide.' });
  }

  // Sécurité: Sanitization - suppression des espaces et conversion en minuscules.
  const sanitizedUsername = username.trim();
  const sanitizedEmail = email.trim().toLowerCase();
  const sanitizedPassword = password.trim();

  // Sécurité: Validation du format email.
  if (!validator.isEmail(sanitizedEmail)) {
    return res.status(400).json({ message: 'Format d\'email invalide.' });
  }

  // Sécurité: Validation de la longueur du nom d'utilisateur.
  if (sanitizedUsername.length < 3 || sanitizedUsername.length > 50) {
    return res.status(400).json({ message: 'Le nom d\'utilisateur doit contenir entre 3 et 50 caractères.' });
  }

  // Sécurité: Validation du nom d'utilisateur (caractères alphanumériques et underscores uniquement).
  if (!/^[a-zA-Z0-9_]+$/.test(sanitizedUsername)) {
    return res.status(400).json({ message: 'Le nom d\'utilisateur ne peut contenir que des lettres, chiffres et underscores.' });
  }

  // Sécurité: Validation de la longueur du mot de passe.
  if (sanitizedPassword.length < 8 || sanitizedPassword.length > 128) {
    return res.status(400).json({ message: 'Le mot de passe doit contenir entre 8 et 128 caractères.' });
  }

  // Sécurité: Validation de la complexité du mot de passe (au moins une majuscule, minuscule et chiffre).
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(sanitizedPassword)) {
    return res.status(400).json({ message: 'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre.' });
  }

  authLog(`Tentative d'inscription pour ${sanitizedEmail}`);

  try {
    // Vérifier si l'email existe déjà.
    const existingEmail = await User.findOne({ email: sanitizedEmail });
    
    if (existingEmail) {
      authLog(`Email ${sanitizedEmail} déjà utilisé`);
      return res.status(400).json({ message: 'Cet email est déjà utilisé.' });
    }

    // Vérifier si le nom d'utilisateur existe déjà.
    const existingUsername = await User.findOne({ username: sanitizedUsername });
    
    if (existingUsername) {
      authLog(`Nom d'utilisateur ${sanitizedUsername} déjà utilisé`);
      return res.status(400).json({ message: 'Ce nom d\'utilisateur est déjà utilisé.' });
    }

    // Créer un nouvel utilisateur.
    const user = new User({ username: sanitizedUsername, email: sanitizedEmail, password: sanitizedPassword });
    await user.save();

    authLog(`Inscription réussie pour ${sanitizedEmail}`);

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