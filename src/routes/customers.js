const express = require('express');
const router = express.Router();
const customerService = require('../services/customerService');
const logger = require('../lib/logger');

/**
 * @swagger
 * /api/customers:
 *   get:
 *     summary: Tüm müşterileri listele
 *     description: Veritabanında kayıtlı tüm müşterileri döndürür.
 *     tags:
 *       - Müşteriler
 *     responses:
 *       200:
 *         description: Müşteri listesi
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Customer'
 *       500:
 *         description: Sunucu hatası
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// GET /api/customers
router.get('/', async (req, res, next) => {
  try {
    const customers = await customerService.listCustomers();
    res.json(customers);
  } catch (err) {
    logger.error('Error listing customers', { err });
    next(err);
  }
});

/**
 * @swagger
 * /api/customers:
 *   post:
 *     summary: Yeni müşteri oluştur
 *     description: Yeni bir müşteri kaydı oluşturur. firstName zorunludur.
 *     tags:
 *       - Müşteriler
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: Ahmet
 *               lastName:
 *                 type: string
 *                 example: Yılmaz
 *               phone:
 *                 type: string
 *                 example: '5321234567'
 *               email:
 *                 type: string
 *                 example: ahmet@example.com
 *               address:
 *                 type: string
 *                 example: İstanbul, Türkiye
 *     responses:
 *       201:
 *         description: Müşteri başarıyla oluşturuldu
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Customer'
 *       400:
 *         description: Geçersiz girdi
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Çakışan müşteri (telefon veya email zaten kayıtlı)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// POST /api/customers
router.post('/', async (req, res, next) => {
  try {
    const customer = await customerService.createCustomer(req.body);
    res.status(201).json(customer);
  } catch (err) {
    logger.error('Error creating customer', { err });
    if (err.status) {
      return res
        .status(err.status)
        .json({ message: err.message, duplicate: err.duplicate || null });
    }
    next(err);
  }
});

/**
 * @swagger
 * /api/customers/{id}:
 *   get:
 *     summary: Müşteri detayını getir
 *     description: ID'ye göre müşteri bilgilerini döndürür.
 *     tags:
 *       - Müşteriler
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Müşteri detayı
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Customer'
 *       404:
 *         description: Müşteri bulunamadı
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// GET /api/customers/:id
router.get('/:id', async (req, res, next) => {
  try {
    const customer = await customerService.getCustomerById(req.params.id);
    res.json(customer);
  } catch (err) {
    logger.error('Error getting customer', { err });
    if (err.status) {
      return res.status(err.status).json({ message: err.message });
    }
    next(err);
  }
});

/**
 * @swagger
 * /api/customers/{id}:
 *   put:
 *     summary: Müşteri bilgilerini güncelle
 *     description: Mevcut müşterinin bilgilerini güncelleştir.
 *     tags:
 *       - Müşteriler
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       200:
 *         description: Güncellenmiş müşteri
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Customer'
 *       404:
 *         description: Müşteri bulunamadı
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Çakışan müşteri
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// PUT /api/customers/:id
router.put('/:id', async (req, res, next) => {
  try {
    const customer = await customerService.updateCustomer(req.params.id, req.body);
    res.json(customer);
  } catch (err) {
    logger.error('Error updating customer', { err });
    if (err.status) {
      return res
        .status(err.status)
        .json({ message: err.message, duplicate: err.duplicate || null });
    }
    next(err);
  }
});

/**
 * @swagger
 * /api/customers/{id}:
 *   delete:
 *     summary: Müşteri sil
 *     description: ID'ye göre müşteri kaydını sil.
 *     tags:
 *       - Müşteriler
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       204:
 *         description: Müşteri başarıyla silindi
 *       404:
 *         description: Müşteri bulunamadı
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// DELETE /api/customers/:id
router.delete('/:id', async (req, res, next) => {
  try {
    await customerService.deleteCustomer(req.params.id);
    res.status(204).send();
  } catch (err) {
    logger.error('Error deleting customer', { err });
    if (err.status) {
      return res.status(err.status).json({ message: err.message });
    }
    next(err);
  }
});

module.exports = router;
