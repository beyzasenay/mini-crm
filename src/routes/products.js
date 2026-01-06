const express = require('express');
const router = express.Router();
const productService = require('../services/productService');
const logger = require('../lib/logger');

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Tüm ürünleri listele
 *     description: Aktif ürünlerin listesini döndürür.
 *     tags:
 *       - Ürünler
 *     responses:
 *       200:
 *         description: Ürün listesi
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */
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

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Yeni ürün oluştur
 *     description: Yeni bir ürün kaydı oluşturur.
 *     tags:
 *       - Ürünler
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: USB Kablo
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *                 example: 29.99
 *               stock:
 *                 type: integer
 *                 example: 100
 *     responses:
 *       201:
 *         description: Ürün başarıyla oluşturuldu
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Geçersiz girdi
 */
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

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Ürün detayını getir
 *     tags:
 *       - Ürünler
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Ürün detayı
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Ürün bulunamadı
 */
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

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Ürün bilgilerini güncelle
 *     tags:
 *       - Ürünler
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               stock:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Güncellenmiş ürün
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 */
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

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Ürün sil
 *     tags:
 *       - Ürünler
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Ürün başarıyla silindi
 *       404:
 *         description: Ürün bulunamadı
 */
// DELETE /api/products/:id
router.delete('/:id', async (req, res, next) => {
  try {
    await productService.deleteProduct(req.params.id);
    res.status(204).send();
  } catch (err) {
    logger.error('Error deleting product', { err });
    if (err.status) {
      return res.status(err.status).json({ message: err.message });
    }
    next(err);
  }
});

/**
 * @swagger
 * /api/products/{id}/decrease-stock:
 *   post:
 *     summary: Ürün stoğunu azalt
 *     description: Sipariş oluşturulduğunda stok azaltır.
 *     tags:
 *       - Ürünler
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantity
 *             properties:
 *               quantity:
 *                 type: integer
 *                 example: 5
 *     responses:
 *       200:
 *         description: Stok başarıyla azaltıldı
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Geçersiz miktarı
 *       409:
 *         description: Yetersiz stok
 */
// POST /api/products/:id/decrease-stock
router.post('/:id/decrease-stock', async (req, res, next) => {
  try {
    const product = await productService.decreaseStock(req.params.id, req.body.quantity);
    res.json(product);
  } catch (err) {
    logger.error('Error decreasing product stock', { err });
    if (err.status) {
      return res.status(err.status).json({ message: err.message });
    }
    next(err);
  }
});

module.exports = router;
