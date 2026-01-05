const { sequelize, Customer, Product, Order } = require('../src/models');
const logger = require('../src/lib/logger');

/**
 * Clean up database before tests
 */
async function cleanDatabase() {
  try {
    // Disable foreign key constraints for Postgres
    if (sequelize.options.dialect === 'postgres') {
      await sequelize.query('TRUNCATE TABLE "orders" CASCADE');
      await sequelize.query('TRUNCATE TABLE "products" CASCADE');
      await sequelize.query('TRUNCATE TABLE "customers" CASCADE');
    } else if (sequelize.options.dialect === 'sqlite') {
      // For SQLite
      await sequelize.query('PRAGMA foreign_keys = OFF');
      await Order.destroy({ where: {}, truncate: true });
      await Product.destroy({ where: {}, truncate: true });
      await Customer.destroy({ where: {}, truncate: true });
      await sequelize.query('PRAGMA foreign_keys = ON');
    } else {
      // Generic approach for other dialects
      await Order.destroy({ where: {}, truncate: true });
      await Product.destroy({ where: {}, truncate: true });
      await Customer.destroy({ where: {}, truncate: true });
    }
  } catch (err) {
    logger.error('Error cleaning database:', err);
    throw err;
  }
}

/**
 * Create test customer
 */
async function createTestCustomer(overrides = {}) {
  const defaults = {
    firstName: 'Test',
    lastName: 'Customer',
    phone: '+90 555 123 4567',
    email: 'test@example.com',
    address: 'Test Address',
    isActive: true
  };

  return Customer.create({ ...defaults, ...overrides });
}

/**
 * Create test product
 */
async function createTestProduct(overrides = {}) {
  const defaults = {
    name: 'Test Product',
    description: 'A test product',
    price: 100,
    priceType: 'fixed',
    isStockTracking: true,
    stock: 50,
    isActive: true
  };

  return Product.create({ ...defaults, ...overrides });
}

/**
 * Create test order
 */
async function createTestOrder(customer, overrides = {}) {
  const defaults = {
    customerId: customer?.id || null,
    totalAmount: 100,
    status: 'pending',
    isActive: true
  };

  return Order.create({ ...defaults, ...overrides });
}

module.exports = {
  cleanDatabase,
  createTestCustomer,
  createTestProduct,
  createTestOrder
};
