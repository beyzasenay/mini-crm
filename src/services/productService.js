const { Product } = require('../models');
const logger = require('../lib/logger');

async function listProducts() {
  const products = await Product.findAll({
    where: { isActive: true },
    limit: 100,
  });
  return products.map(p =>
    Object.assign({}, p.toJSON(), {
      price: parseFloat(p.price),
    })
  );
}

function validatePayload(payload) {
  if (!payload || !payload.name) {
    const err = new Error('`name` is required');
    err.status = 400;
    throw err;
  }
  if (payload.price !== undefined && payload.price < 0) {
    const err = new Error('`price` cannot be negative');
    err.status = 400;
    throw err;
  }
  if (payload.stock !== undefined && payload.stock < 0) {
    const err = new Error('`stock` cannot be negative');
    err.status = 400;
    throw err;
  }
  if (payload.priceType && !['fixed', 'variable'].includes(payload.priceType)) {
    const err = new Error('`priceType` must be "fixed" or "variable"');
    err.status = 400;
    throw err;
  }
}

async function createProduct(payload) {
  validatePayload(payload);

  logger.info('Creating product', { name: payload.name });

  const toCreate = {
    name: payload.name,
    description: payload.description || null,
    price: payload.price || 0,
    priceType: payload.priceType || 'fixed',
    isStockTracking: payload.isStockTracking !== undefined ? payload.isStockTracking : true,
    stock: payload.stock || 0,
    isActive: payload.isActive !== undefined ? payload.isActive : true,
  };

  const product = await Product.create(toCreate);
  return Object.assign({}, product.toJSON(), {
    price: parseFloat(product.price),
  });
}

async function getProductById(id) {
  const product = await Product.findByPk(id);
  if (!product) {
    const err = new Error('Product not found');
    err.status = 404;
    throw err;
  }
  return Object.assign({}, product.toJSON(), {
    price: parseFloat(product.price),
  });
}

async function getProductRaw(id) {
  const product = await Product.findByPk(id);
  if (!product) {
    const err = new Error('Product not found');
    err.status = 404;
    throw err;
  }
  return product;
}

async function updateProduct(id, payload) {
  const product = await getProductRaw(id);

  const validatePayloadObj = Object.assign({}, payload, {
    name: payload.name || product.name,
  });
  validatePayload(validatePayloadObj);

  const toUpdate = {};
  if ('name' in payload) toUpdate.name = payload.name;
  if ('description' in payload) toUpdate.description = payload.description || null;
  if ('price' in payload) toUpdate.price = payload.price;
  if ('priceType' in payload) toUpdate.priceType = payload.priceType;
  if ('isStockTracking' in payload) toUpdate.isStockTracking = payload.isStockTracking;
  if ('stock' in payload) {
    // only allow stock update if tracking is enabled
    if (!product.isStockTracking && payload.stock !== undefined) {
      const err = new Error('Cannot update stock for product with isStockTracking=false');
      err.status = 400;
      throw err;
    }
    toUpdate.stock = payload.stock;
  }
  if ('isActive' in payload) toUpdate.isActive = payload.isActive;

  await product.update(toUpdate);
  logger.info('Updated product', { id, updates: Object.keys(toUpdate) });
  const updated = await Product.findByPk(id);
  return Object.assign({}, updated.toJSON(), {
    price: parseFloat(updated.price),
  });
}

async function deleteProduct(id) {
  const product = await getProductRaw(id);
  await product.destroy();
  logger.info('Deleted product', { id });
  return { message: 'Product deleted' };
}

// Stok işlemleri (sipariş oluşturma için kullanılacak)
async function decreaseStock(productId, quantity) {
  const product = await getProductRaw(productId);

  if (!product.isStockTracking) {
    // Stok takibi yapılmayan ürün; işleme izin ver ama stok değiştirme
    logger.info('Stock tracking disabled for product', { productId });
    return Object.assign({}, product.toJSON(), {
      price: parseFloat(product.price),
    });
  }

  if (product.stock < quantity) {
    const err = new Error(
      `Insufficient stock. Available: ${product.stock}, Requested: ${quantity}`
    );
    err.status = 409;
    throw err;
  }

  await product.update({ stock: product.stock - quantity });
  const updated = await Product.findByPk(productId);
  logger.info('Decreased stock', { productId, quantity, newStock: updated.stock });
  return Object.assign({}, updated.toJSON(), {
    price: parseFloat(updated.price),
  });
}

module.exports = {
  listProducts,
  createProduct,
  getProductById,
  updateProduct,
  deleteProduct,
  decreaseStock,
};
