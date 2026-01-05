const express = require('express');
const router = express.Router();
const productService = require('../services/productService');
const logger = require('../lib/logger');

// GET /api/products
router.get('/', async (req, res, next) => {
  try {
    const products = await productService.listProducts();
    res.json(products);
  } catch (err) {
    logger.error('Error listing products', { err });
    next(err);
  }
});

// POST /api/products
router.post('/', async (req, res, next) => {
  try {
    const product = await productService.createProduct(req.body);
    res.status(201).json(product);
  } catch (err) {
    logger.error('Error creating product', { err });
    if (err.status) {
      return res.status(err.status).json({ message: err.message });
    }
    next(err);
  }
});

// GET /api/products/:id
router.get('/:id', async (req, res, next) => {
  try {
    const product = await productService.getProductById(req.params.id);
    res.json(product);
  } catch (err) {
    logger.error('Error getting product', { err });
    if (err.status) {
      return res.status(err.status).json({ message: err.message });
    }
    next(err);
  }
});

// PUT /api/products/:id
router.put('/:id', async (req, res, next) => {
  try {
    const product = await productService.updateProduct(req.params.id, req.body);
    res.json(product);
  } catch (err) {
    logger.error('Error updating product', { err });
    if (err.status) {
      return res.status(err.status).json({ message: err.message });
    }
    next(err);
  }
});

// DELETE /api/products/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const result = await productService.deleteProduct(req.params.id);
    res.json(result);
  } catch (err) {
    logger.error('Error deleting product', { err });
    if (err.status) {
      return res.status(err.status).json({ message: err.message });
    }
    next(err);
  }
});

module.exports = router;
