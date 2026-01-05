const request = require('supertest');
const app = require('../src/app');
const { sequelize } = require('../src/models');
const { cleanDatabase, createTestProduct, createTestCustomer } = require('./helpers');

describe('Products API', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: false });
  });

  beforeEach(async () => {
    await cleanDatabase();
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('GET /api/products', () => {
    test('returns empty array when no products exist', async () => {
      const res = await request(app).get('/api/products');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(0);
    });

    test('returns list of products', async () => {
      await createTestProduct({ name: 'Product A', price: 100 });
      await createTestProduct({ name: 'Product B', price: 200 });

      const res = await request(app).get('/api/products');
      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body[0]).toHaveProperty('name');
      expect(res.body[0]).toHaveProperty('price');
      expect(res.body[0]).toHaveProperty('stock');
    });
  });

  describe('POST /api/products', () => {
    test('creates product with valid data', async () => {
      const res = await request(app)
        .post('/api/products')
        .send({
          name: 'Test Product',
          description: 'A test product',
          price: 99.99,
          priceType: 'fixed',
          isStockTracking: true,
          stock: 50
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.id).toBeDefined();
      expect(res.body.name).toBe('Test Product');
      expect(res.body.price).toBe(99.99);
      expect(res.body.stock).toBe(50);
    });

    test('rejects product without name', async () => {
      const res = await request(app)
        .post('/api/products')
        .send({
          price: 100,
          stock: 50
        });

      expect(res.statusCode).toBe(400);
    });

    test('creates product with minimum required fields', async () => {
      const res = await request(app)
        .post('/api/products')
        .send({
          name: 'Minimal Product',
          price: 50
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.name).toBe('Minimal Product');
    });
  });

  describe('GET /api/products/:id', () => {
    test('returns product by id', async () => {
      const product = await createTestProduct({ name: 'Test Product' });

      const res = await request(app).get(`/api/products/${product.id}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.id).toBe(product.id);
      expect(res.body.name).toBe('Test Product');
    });

    test('returns 404 for non-existent product', async () => {
      const res = await request(app).get('/api/products/99999');
      expect(res.statusCode).toBe(404);
    });
  });

  describe('PUT /api/products/:id', () => {
    test('updates product', async () => {
      const product = await createTestProduct();

      const res = await request(app)
        .put(`/api/products/${product.id}`)
        .send({ name: 'Updated Product', price: 150 });

      expect(res.statusCode).toBe(200);
      expect(res.body.name).toBe('Updated Product');
      expect(res.body.price).toBe(150);
    });
  });

  describe('DELETE /api/products/:id', () => {
    test('deletes product', async () => {
      const product = await createTestProduct();

      const res = await request(app).delete(`/api/products/${product.id}`);
      expect(res.statusCode).toBe(204);

      // Verify product is deleted
      const getRes = await request(app).get(`/api/products/${product.id}`);
      expect(getRes.statusCode).toBe(404);
    });
  });

  describe('Stock Management', () => {
    test('decreases stock when updating product', async () => {
      const product = await createTestProduct({ stock: 50 });

      const res = await request(app)
        .post(`/api/products/${product.id}/decrease-stock`)
        .send({ quantity: 10 });

      expect(res.statusCode).toBe(200);
      expect(res.body.stock).toBe(40);
    });

    test('rejects decrease-stock if insufficient stock', async () => {
      const product = await createTestProduct({ stock: 5 });

      const res = await request(app)
        .post(`/api/products/${product.id}/decrease-stock`)
        .send({ quantity: 10 });

      expect(res.statusCode).toBe(409);
    });
  });
});
