const { Customer } = require('../models');
const logger = require('../lib/logger');
const duplicateService = require('./duplicateService');

async function listCustomers() {
  return Customer.findAll({
    limit: 50, // TODO: pagination eksik
  });
}

function validatePayload(payload) {
  if (!payload || !payload.firstName) {
    const err = new Error('`firstName` is required');
    err.status = 400;
    throw err;
  }
  if (payload.email && !/^\S+@\S+\.\S+$/.test(payload.email)) {
    const err = new Error('Invalid email format');
    err.status = 400;
    throw err;
  }
}

async function createCustomer(payload) {
  validatePayload(payload);

  // normalize phone for duplicate check
  const duplicate = await duplicateService.findDuplicate(payload);
  if (duplicate) {
    const err = new Error('Duplicate customer detected');
    err.status = 409;
    err.duplicate = {
      reason: duplicate.reason,
      customer: {
        id: duplicate.customer.id,
        firstName: duplicate.customer.firstName,
        lastName: duplicate.customer.lastName,
        phone: duplicate.customer.phone,
        email: duplicate.customer.email,
      },
    };
    throw err;
  }

  logger.info('Creating customer', { firstName: payload.firstName, lastName: payload.lastName });

  // create with allowed fields only
  const toCreate = {
    firstName: payload.firstName,
    lastName: payload.lastName || null,
    phone: payload.phone || null,
    email: payload.email || null,
    address: payload.address || null,
  };

  const customer = await Customer.create(toCreate);
  return customer;
}

async function getCustomerById(id) {
  const customer = await Customer.findByPk(id);
  if (!customer) {
    const err = new Error('Customer not found');
    err.status = 404;
    throw err;
  }
  return customer;
}

async function updateCustomer(id, payload) {
  const customer = await getCustomerById(id);

  if (payload.email && !/^\S+@\S+\.\S+$/.test(payload.email)) {
    const err = new Error('Invalid email format');
    err.status = 400;
    throw err;
  }

  if (payload.phone || payload.firstName) {
    const checkPayload = {
      firstName: payload.firstName || customer.firstName,
      lastName: payload.lastName || customer.lastName,
      phone: payload.phone || customer.phone,
    };
    const duplicate = await duplicateService.findDuplicate(checkPayload);
    if (duplicate && duplicate.customer.id !== parseInt(id)) {
      const err = new Error('Duplicate customer detected');
      err.status = 409;
      err.duplicate = {
        reason: duplicate.reason,
        customer: {
          id: duplicate.customer.id,
          firstName: duplicate.customer.firstName,
          lastName: duplicate.customer.lastName,
          phone: duplicate.customer.phone,
        },
      };
      throw err;
    }
  }

  const toUpdate = {};
  if ('firstName' in payload) toUpdate.firstName = payload.firstName;
  if ('lastName' in payload) toUpdate.lastName = payload.lastName;
  if ('phone' in payload) toUpdate.phone = payload.phone || null;
  if ('email' in payload) toUpdate.email = payload.email || null;
  if ('address' in payload) toUpdate.address = payload.address || null;
  if ('isActive' in payload) toUpdate.isActive = payload.isActive;

  await customer.update(toUpdate);
  logger.info('Updated customer', { id, updates: Object.keys(toUpdate) });
  return customer;
}

async function deleteCustomer(id) {
  const customer = await getCustomerById(id);
  await customer.destroy();
  logger.info('Deleted customer', { id });
  return { message: 'Customer deleted' };
}

module.exports = {
  listCustomers,
  createCustomer,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
};
