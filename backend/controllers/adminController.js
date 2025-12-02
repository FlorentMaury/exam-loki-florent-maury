// backend/controllers/adminController.js
const axios = require('axios');
const Order = require('../models/Order');
const Product = require('../models/Product');
const validator = require('validator');
const adminLog = require('debug')('adminRoutes:console');

// Récupération de toutes les commandes.
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find();
    res.json(orders);
  } catch (error) {
    console.error('Erreur lors de la récupération des commandes.', error);
    res.status(500).json({ message: 'Une erreur est survenue.' });
  }
};

// Validation: Mise à jour du statut de commande sécurisée.
exports.updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // Sécurité: Validation de id (MongoDB ID).
  if (!id || !validator.isMongoId(id)) {
    return res.status(400).json({ message: 'Identifiant commande invalide.' });
  }

  // Sécurité: Validation de status (liste blanche).
  const validStatuses = ['En attente', 'Confirmée', 'Expédiée', 'Livrée', 'Annulée'];
  if (!status || typeof status !== 'string' || !validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Statut invalide.' });
  }

  try {
    const order = await Order.findByIdAndUpdate(id, { status }, { new: true });

    // Sécurité: Vérifier que la commande existe.
    if (!order) {
      return res.status(404).json({ message: 'Commande non trouvée.' });
    }

    adminLog(`Statut de commande mis à jour: ${id} -> ${status}`);

    // Notification du service.
    try {
      await axios.post('http://localhost:8000/notify', {
        message: `Le statut de la commande ${id} a été mis à jour en "${status}".`,
      });
    } catch (error) {
      adminLog(`Erreur lors de l\'envoi de la notification: ${error.message}`);
    }

    res.json({ message: 'Statut de la commande mis à jour avec succès.', order });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut.', error);
    res.status(500).json({ message: 'Une erreur est survenue.' });
  }
};

// Validation: Validation de commande sécurisée.
exports.validateOrder = async (req, res) => {
  const { id } = req.params;

  // Sécurité: Validation de id (MongoDB ID).
  if (!id || !validator.isMongoId(id)) {
    return res.status(400).json({ message: 'Identifiant commande invalide.' });
  }

  try {
    const order = await Order.findByIdAndUpdate(id, { status: 'Confirmée' }, { new: true });

    // Sécurité: Vérifier que la commande existe.
    if (!order) {
      return res.status(404).json({ message: 'Commande non trouvée.' });
    }

    adminLog(`Commande validée: ${id}`);

    // Notification du service.
    try {
      await axios.post('http://localhost:8000/notify', {
        message: `La commande ${id} a été validée.`,
      });
    } catch (error) {
      adminLog(`Erreur lors de l\'envoi de la notification: ${error.message}`);
    }

    res.json({ message: 'Commande validée avec succès.', order });
  } catch (error) {
    console.error('Erreur lors de la validation de la commande.', error);
    res.status(500).json({ message: 'Une erreur est survenue.' });
  }
};

// Récupération de tous les produits.
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    console.error('Erreur lors de la récupération des produits.', error);
    res.status(500).json({ message: 'Une erreur est survenue.' });
  }
};

// Validation: Mise à jour du stock du produit sécurisée.
exports.updateProductStock = async (req, res) => {
  const { id } = req.params;
  const { stock } = req.body;

  // Sécurité: Validation de id (MongoDB ID).
  if (!id || !validator.isMongoId(id)) {
    return res.status(400).json({ message: 'Identifiant produit invalide.' });
  }

  // Sécurité: Validation que stock est fourni.
  if (stock === undefined || stock === null) {
    return res.status(400).json({ message: 'Le stock est requis.' });
  }

  // Sécurité: Validation du type de stock (entier).
  if (!Number.isInteger(stock)) {
    return res.status(400).json({ message: 'Le stock doit être un nombre entier.' });
  }

  // Sécurité: Validation que le stock est positif et inférieur au maximum.
  if (stock < 0 || stock > 1000000) {
    return res.status(400).json({ message: 'Le stock doit être entre 0 et 1000000.' });
  }

  try {
    const product = await Product.findByIdAndUpdate(id, { stock }, { new: true });

    // Sécurité: Vérifier que le produit existe.
    if (!product) {
      return res.status(404).json({ message: 'Produit non trouvé.' });
    }

    adminLog(`Stock du produit mis à jour: ${id} -> ${stock}`);

    // Notification du service.
    try {
      await axios.post('http://localhost:8000/notify', {
        message: `Le stock du produit ${id} a été mis à jour à ${stock}.`,
      });
    } catch (error) {
      adminLog(`Erreur lors de l\'envoi de la notification: ${error.message}`);
    }

    res.json({ message: 'Stock du produit mis à jour avec succès.', product });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du stock.', error);
    res.status(500).json({ message: 'Une erreur est survenue.' });
  }
};
