const express = require('express');
const router = express.Router();
const customerService = require('../services/customerService');
const logger = require('../lib/logger');

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

// POST /api/customers
router.post('/', async (req, res, next) => {
  try {
    const customer = await customerService.createCustomer(req.body);
    res.status(201).json(customer);
  } catch (err) {
    logger.error('Error creating customer', { err });
    if (err.status) {
      return res.status(err.status).json({ message: err.message, duplicate: err.duplicate || null });
    }
    next(err);
  }
});

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

// PUT /api/customers/:id
router.put('/:id', async (req, res, next) => {
  try {
    const customer = await customerService.updateCustomer(req.params.id, req.body);
    res.json(customer);
  } catch (err) {
    logger.error('Error updating customer', { err });
    if (err.status) {
      return res.status(err.status).json({ message: err.message, duplicate: err.duplicate || null });
    }
    next(err);
  }
});

// DELETE /api/customers/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const result = await customerService.deleteCustomer(req.params.id);
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
