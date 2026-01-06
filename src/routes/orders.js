const express = require('express');
const router = express.Router();
const orderService = require('../services/orderService');
const logger = require('../lib/logger');

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Tüm siparişleri listele
 *     description: Filtreleme seçenekleriyle siparişleri döndürür.
 *     tags:
 *       - Siparişler
 *     parameters:
 *       - name: status
 *         in: query
 *         schema:
 *           type: string
 *           enum: [pending, processing, shipped, completed, cancelled]
 *       - name: customerId
 *         in: query
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Sipariş listesi
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 */
// GET /api/orders
router.get('/', async (req, res, next) => {
  try {
    const filters = {};
    if (req.query.status) filters.status = req.query.status;
    if (req.query.customerId) filters.customerId = req.query.customerId;

    const orders = await orderService.listOrders(filters);
    res.json(orders);
  } catch (err) {
    logger.error('Error listing orders', { err });
    next(err);
  }
});

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Yeni sipariş oluştur
 *     description: Müşteri veya misafir için sipariş oluşturur. Stok otomatik azaltılır.
 *     tags:
 *       - Siparişler
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               customerId:
 *                 type: integer
 *                 example: 1
 *               guestFirstName:
 *                 type: string
 *               guestLastName:
 *                 type: string
 *               guestEmail:
 *                 type: string
 *               guestPhone:
 *                 type: string
 *               items:
 *                 type: array
 *                 required: true
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: integer
 *                     quantity:
 *                       type: integer
 *     responses:
 *       201:
 *         description: Sipariş başarıyla oluşturuldu
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: Geçersiz girdi
 *       409:
 *         description: Yetersiz stok
 */
// POST /api/orders
router.post('/', async (req, res, next) => {
  try {
    const order = await orderService.createOrder(req.body);
    res.status(201).json(order);
  } catch (err) {
    logger.error('Error creating order', { err });
    if (err.status) {
      return res.status(err.status).json({ message: err.message });
    }
    next(err);
  }
});

// GET /api/orders/:id
/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Sipariş detayını getir
 *     tags:
 *       - Siparişler
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Sipariş detayı
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       404:
 *         description: Sipariş bulunamadı
 */
router.get('/:id', async (req, res, next) => {
  try {
    const order = await orderService.getOrderById(req.params.id);
    res.json(order);
  } catch (err) {
    logger.error('Error getting order', { err });
    if (err.status) {
      return res.status(err.status).json({ message: err.message });
    }
    next(err);
  }
});

/**
 * @swagger
 * /api/orders/{id}/status:
 *   put:
 *     summary: Sipariş durumunu güncelle
 *     tags:
 *       - Siparişler
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
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, processing, shipped, completed, cancelled]
 *     responses:
 *       200:
 *         description: Güncellenmiş sipariş
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: Geçersiz durum
 */
// PUT /api/orders/:id/status
router.put('/:id/status', async (req, res, next) => {
  try {
    if (!req.body.status) {
      return res.status(400).json({ message: '`status` is required' });
    }
    const order = await orderService.updateOrderStatus(req.params.id, req.body.status);
    res.json(order);
  } catch (err) {
    logger.error('Error updating order status', { err });
    if (err.status) {
      return res.status(err.status).json({ message: err.message });
    }
    next(err);
  }
});

/**
 * @swagger
 * /api/orders/{id}:
 *   delete:
 *     summary: Sipariş sil
 *     tags:
 *       - Siparişler
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Sipariş başarıyla silindi
 *       404:
 *         description: Sipariş bulunamadı
 */
// DELETE /api/orders/:id
router.delete('/:id', async (req, res, next) => {
  try {
    await orderService.deleteOrder(req.params.id);
    res.status(204).send();
  } catch (err) {
    logger.error('Error deleting order', { err });
    if (err.status) {
      return res.status(err.status).json({ message: err.message });
    }
    next(err);
  }
});

module.exports = router;
