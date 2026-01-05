const { Order, Customer, Product } = require('../models');
const productService = require('./productService');
const logger = require('../lib/logger');

async function listOrders(filters = {}) {
  const where = {};
  if (filters.status) where.status = filters.status;
  if (filters.customerId) where.customerId = filters.customerId;

  return Order.findAll({
    where,
    include: { model: Customer, required: false },
    limit: 100
  });
}

function validateOrderPayload(payload) {
  if (!payload) {
    const err = new Error('Request body is required');
    err.status = 400;
    throw err;
  }

  // Either customerId or guest info required
  if (!payload.customerId && (!payload.guestFirstName || !payload.guestEmail)) {
    const err = new Error('Either customerId or (guestFirstName + guestEmail) is required');
    err.status = 400;
    throw err;
  }

  if (!payload.items || !Array.isArray(payload.items) || payload.items.length === 0) {
    const err = new Error('`items` array is required with at least one item');
    err.status = 400;
    throw err;
  }

  for (const item of payload.items) {
    if (!item.productId || !item.quantity || item.quantity <= 0) {
      const err = new Error('Each item must have productId and quantity > 0');
      err.status = 400;
      throw err;
    }
  }

  if (payload.totalAmount !== undefined && payload.totalAmount < 0) {
    const err = new Error('`totalAmount` cannot be negative');
    err.status = 400;
    throw err;
  }
}

async function createOrder(payload) {
  validateOrderPayload(payload);

  let customer = null;
  if (payload.customerId) {
    customer = await Customer.findByPk(payload.customerId);
    if (!customer) {
      const err = new Error('Customer not found');
      err.status = 404;
      throw err;
    }
  }

  // Calculate total amount and verify stock
  let totalAmount = 0;
  for (const item of payload.items) {
    const product = await Product.findByPk(item.productId);
    if (!product) {
      const err = new Error(`Product ${item.productId} not found`);
      err.status = 404;
      throw err;
    }

    // Check stock only if tracking is enabled
    if (product.isStockTracking && product.stock < item.quantity) {
      const err = new Error(
        `Insufficient stock for product "${product.name}". Available: ${product.stock}, Requested: ${item.quantity}`
      );
      err.status = 409;
      throw err;
    }

    totalAmount += parseFloat(product.price) * item.quantity;
  }

  logger.info('Creating order', {
    customerId: payload.customerId,
    guestEmail: payload.guestEmail,
    itemCount: payload.items.length
  });

  const order = await Order.create({
    customerId: payload.customerId || null,
    guestFirstName: payload.guestFirstName || null,
    guestLastName: payload.guestLastName || null,
    guestPhone: payload.guestPhone || null,
    guestEmail: payload.guestEmail || null,
    totalAmount: totalAmount,
    status: 'pending',
    notes: payload.notes || null
  });

  // Decrease stock for all items
  for (const item of payload.items) {
    try {
      await productService.decreaseStock(item.productId, item.quantity);
    } catch (err) {
      logger.error('Stock decrease failed', { err });
      // Rollback order if stock update fails
      await order.destroy();
      throw err;
    }
  }

  return order;
}

async function getOrderById(id) {
  const order = await Order.findByPk(id, {
    include: { model: Customer, required: false }
  });
  if (!order) {
    const err = new Error('Order not found');
    err.status = 404;
    throw err;
  }
  return order;
}

async function updateOrderStatus(id, newStatus) {
  const validStatuses = ['pending', 'processing', 'shipped', 'cancelled', 'completed'];
  if (!validStatuses.includes(newStatus)) {
    const err = new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    err.status = 400;
    throw err;
  }

  const order = await getOrderById(id);
  await order.update({ status: newStatus });
  logger.info('Updated order status', { id, newStatus });
  return order;
}

async function deleteOrder(id) {
  const order = await getOrderById(id);
  await order.destroy();
  logger.info('Deleted order', { id });
  return { message: 'Order deleted' };
}

module.exports = {
  listOrders,
  createOrder,
  getOrderById,
  updateOrderStatus,
  deleteOrder
};
