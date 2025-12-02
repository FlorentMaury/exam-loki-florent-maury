// controllers/productController.js
const Product = require('../models/Product');
const validator = require('validator');
const productLog = require('debug')('productRoutes:console');

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
  const { stock } = req.body;
  const { productId } = req.params;

  // Sécurité: Validation de productId (MongoDB ID).
  if (!productId || !validator.isMongoId(productId)) {
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
    // Recherche du produit.
    const product = await Product.findById(productId);

    // Sécurité: Vérifier que le produit existe.
    if (!product) {
      return res.status(404).json({ message: 'Produit non trouvé.' });
    }

    // Mise à jour du stock.
    product.stock = stock;
    product.updatedAt = Date.now();

    // Sauvegarde du produit.
    await product.save();

    productLog(`Stock du produit mis à jour: ${productId} -> ${stock}`);
    res.json({ message: 'Stock mis à jour avec succès.', product });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du stock.', error);
    res.status(500).json({ message: 'Une erreur est survenue.' });
  }
};