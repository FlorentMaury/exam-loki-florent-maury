// backend/controllers/orderController.js
const axios = require('axios');
const Order = require('../models/Order');
const validator = require('validator');
const orderLog = require('debug')('orderRoutes:console');
const logger = require('../config/logger');
const { auditLog } = require('../config/audit');

// Validation: Création de commande sécurisée.
exports.createOrder = async (req, res) => {
  const { items, shippingAddress, paymentMethod, shippingMethod } = req.body;
  const userId = req.user.userId;

  // Sécurité: Validation du userId (MongoDB ID).
  if (!validator.isMongoId(userId)) {
    return res.status(400).json({ message: 'Données utilisateur invalides.' });
  }

  // Sécurité: Validation du tableau items.
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'La commande doit contenir au moins un article.' });
  }

  // Sécurité: Validation de la longueur du tableau items.
  if (items.length > 100) {
    return res.status(400).json({ message: 'Une commande ne peut pas contenir plus de 100 articles.' });
  }

  // Sécurité: Validation de chaque article du panier.
  for (let i = 0; i < items.length; i++) {
    const item = items[i];

    // Sécurité: Validation de productId (MongoDB ID).
    if (!item.productId || !validator.isMongoId(item.productId)) {
      return res.status(400).json({ message: 'Identifiant produit invalide.' });
    }

    // Sécurité: Validation de quantity (nombre entier positif).
    if (!Number.isInteger(item.quantity) || item.quantity <= 0 || item.quantity > 1000) {
      return res.status(400).json({ message: 'La quantité doit être un entier positif et inférieur à 1000.' });
    }

    // Sécurité: Validation de price (nombre décimal positif).
    if (typeof item.price !== 'number' || item.price < 0 || item.price > 1000000) {
      return res.status(400).json({ message: 'Le prix doit être un nombre positif et inférieur à 1000000.' });
    }
  }

  // Sécurité: Validation de shippingAddress.
  if (!shippingAddress || typeof shippingAddress !== 'object') {
    return res.status(400).json({ message: 'Adresse de livraison invalide.' });
  }

  const { street, city, postalCode, country } = shippingAddress;

  // Sécurité: Validation des champs de l'adresse.
  if (!street || !city || !postalCode || !country) {
    return res.status(400).json({ message: 'Tous les champs de l\'adresse sont requis.' });
  }

  // Sécurité: Validation du type des champs d'adresse.
  if (typeof street !== 'string' || typeof city !== 'string' || typeof postalCode !== 'string' || typeof country !== 'string') {
    return res.status(400).json({ message: 'Format d\'adresse invalide.' });
  }

  // Sécurité: Validation de la longueur des champs d'adresse.
  if (street.length < 5 || street.length > 100) {
    return res.status(400).json({ message: 'La rue doit contenir entre 5 et 100 caractères.' });
  }

  if (city.length < 2 || city.length > 50) {
    return res.status(400).json({ message: 'La ville doit contenir entre 2 et 50 caractères.' });
  }

  if (postalCode.length < 3 || postalCode.length > 20) {
    return res.status(400).json({ message: 'Le code postal doit contenir entre 3 et 20 caractères.' });
  }

  if (country.length < 2 || country.length > 50) {
    return res.status(400).json({ message: 'Le pays doit contenir entre 2 et 50 caractères.' });
  }

  // Sécurité: Validation de paymentMethod (liste blanche).
  const validPaymentMethods = ['Carte bancaire', 'PayPal', 'Virement bancaire', 'Crypto-monnaie'];
  if (!paymentMethod || !validPaymentMethods.includes(paymentMethod)) {
    return res.status(400).json({ message: 'Méthode de paiement invalide.' });
  }

  // Sécurité: Validation de shippingMethod (liste blanche).
  const validShippingMethods = ['Express', 'Standard', 'Économique', 'Retrait'];
  if (!shippingMethod || !validShippingMethods.includes(shippingMethod)) {
    return res.status(400).json({ message: 'Méthode de livraison invalide.' });
  }

  try {
    // Calcul du total de la commande.
    const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

    // Création de la commande.
    const newOrder = new Order({
      userId,
      items,
      total,
      shippingAddress,
      paymentMethod,
      shippingMethod,
    });

    // Sauvegarde de la commande.
    const savedOrder = await newOrder.save();
    orderLog(`Commande créée avec succès: ${savedOrder._id}`);
    auditLog('ORDER_CREATED', userId, { orderId: savedOrder._id, total, items: items.length }, 'success');

    // Notification du service de notification.
    try {
      await axios.post('http://localhost:8000/notify', {
        to: 'syaob@yahoo.fr',
        subject: 'Nouvelle Commande Créée',
        text: `Une commande a été créée avec succès pour un total de ${total}€.`,
      });
    } catch (error) {
      orderLog(`Erreur lors de l\'envoi de la notification: ${error.message}`);
      logger.warn(`Notification échouée pour la commande ${savedOrder._id}`, error);
    }

    res.status(201).json({ message: 'Commande créée avec succès.', order: savedOrder });
  } catch (error) {
    logger.error('Erreur lors de la création de la commande.', error);
    auditLog('ORDER_CREATED', userId, { items: items.length }, 'failure');
    res.status(500).json({ message: 'Une erreur est survenue.' });
  }
};

// Validation: Suppression de commande sécurisée.
exports.deleteOrder = async (req, res) => {
  const { orderId } = req.body;

  // Sécurité: Validation de orderId (MongoDB ID).
  if (!orderId || !validator.isMongoId(orderId)) {
    return res.status(400).json({ message: 'Identifiant commande invalide.' });
  }

  try {
    const order = await Order.findByIdAndDelete(orderId);

    if (!order) {
      return res.status(404).json({ message: 'Commande non trouvée.' });
    }

    orderLog(`Commande supprimée: ${orderId}`);
    res.status(200).json({ message: 'Commande supprimée avec succès.' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la commande.', error);
    res.status(500).json({ message: 'Une erreur est survenue.' });
  }
};

// Récupération de toutes les commandes.
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find();
    res.status(200).json(orders);
  } catch (error) {
    console.error('Erreur lors de la récupération des commandes.', error);
    res.status(500).json({ message: 'Une erreur est survenue.' });
  }
};

// Validation: Validation de commande sécurisée.
exports.validateOrder = async (req, res) => {
  const { orderId } = req.body;

  // Sécurité: Validation de orderId (MongoDB ID).
  if (!orderId || !validator.isMongoId(orderId)) {
    return res.status(400).json({ message: 'Identifiant commande invalide.' });
  }

  try {
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: 'Commande non trouvée.' });
    }

    orderLog(`Commande validée: ${orderId}`);
    res.status(200).json({ message: 'Commande validée avec succès.', order });
  } catch (error) {
    console.error('Erreur lors de la validation de la commande.', error);
    res.status(500).json({ message: 'Une erreur est survenue.' });
  }
};

// Validation: Mise à jour du statut de commande sécurisée.
exports.updateOrderStatus = async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  // Sécurité: Validation de orderId (MongoDB ID).
  if (!orderId || !validator.isMongoId(orderId)) {
    return res.status(400).json({ message: 'Identifiant commande invalide.' });
  }

  // Sécurité: Validation de status (liste blanche).
  const validStatuses = ['En attente', 'Confirmée', 'Expédiée', 'Livrée', 'Annulée'];
  if (!status || typeof status !== 'string' || !validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Statut invalide.' });
  }

  try {
    const order = await Order.findByIdAndUpdate(
      orderId,
      { status, updatedAt: new Date() },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Commande non trouvée.' });
    }

    orderLog(`Statut de commande mis à jour: ${orderId} -> ${status}`);
    res.status(200).json({ message: 'Statut mis à jour avec succès.', order });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut.', error);
    res.status(500).json({ message: 'Une erreur est survenue.' });
  }
};


// exports.createOrder = async (req, res) => {
//     const products = req.body; // Attente d'un tableau d'objets { productId, quantity }
//     console.log(`products are ${JSON.stringify(products)}`)
