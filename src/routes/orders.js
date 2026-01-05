const express = require('express');
const router = express.Router();
const orderService = require('../services/orderService');
const logger = require('../lib/logger');

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

// DELETE /api/orders/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const result = await orderService.deleteOrder(req.params.id);
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
