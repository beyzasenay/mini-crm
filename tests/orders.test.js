const request = require('supertest');
const app = require('../src/app');
const { sequelize } = require('../src/models');
const { cleanDatabase, createTestCustomer, createTestProduct, createTestOrder } = require('./helpers');

describe('Orders API', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: false });
  });

  beforeEach(async () => {
    await cleanDatabase();
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('GET /api/orders', () => {
    test('returns empty array when no orders exist', async () => {
      const res = await request(app).get('/api/orders');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(0);
    });

    test('returns list of orders', async () => {
      const customer = await createTestCustomer();
      await createTestOrder(customer, { totalAmount: 100 });
      await createTestOrder(customer, { totalAmount: 200 });

      const res = await request(app).get('/api/orders');
      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body[0]).toHaveProperty('totalAmount');
      expect(res.body[0]).toHaveProperty('status');
    });
  });

  describe('POST /api/orders', () => {
    test('creates order for registered customer', async () => {
      const customer = await createTestCustomer();
      const product = await createTestProduct({ stock: 100 });

      const res = await request(app)
        .post('/api/orders')
        .send({
          customerId: customer.id,
          items: [
            {
              productId: product.id,
              quantity: 2
            }
          ]
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.id).toBeDefined();
      expect(res.body.customerId).toBe(customer.id);
    });

    test('creates guest order without customerId', async () => {
      const product = await createTestProduct({ stock: 100 });

      const res = await request(app)
        .post('/api/orders')
        .send({
          guestFirstName: 'John',
          guestLastName: 'Doe',
          guestEmail: 'guest@example.com',
          items: [
            {
              productId: product.id,
              quantity: 1
            }
          ]
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.id).toBeDefined();
      expect(res.body.customerId).toBeNull();
    });

    test('rejects order without customerId and guest info', async () => {
      const product = await createTestProduct();
      const res = await request(app)
        .post('/api/orders')
        .send({
          items: [
            {
              productId: product.id,
              quantity: 1
            }
          ]
        });

      expect(res.statusCode).toBe(400);
    });

    test('creates order with products', async () => {
      const customer = await createTestCustomer();
      const product = await createTestProduct({ stock: 100 });

      const res = await request(app)
        .post('/api/orders')
        .send({
          customerId: customer.id,
          items: [
            {
              productId: product.id,
              quantity: 2
            }
          ]
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.id).toBeDefined();
    });
  });

  describe('GET /api/orders/:id', () => {
    test('returns order by id', async () => {
      const customer = await createTestCustomer();
      const order = await createTestOrder(customer);

      const res = await request(app).get(`/api/orders/${order.id}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.id).toBe(order.id);
      expect(res.body.totalAmount).toBe(order.totalAmount);
    });

    test('returns 404 for non-existent order', async () => {
      const res = await request(app).get('/api/orders/99999');
      expect(res.statusCode).toBe(404);
    });
  });

  describe('PUT /api/orders/:id/status', () => {
    test('updates order status', async () => {
      const customer = await createTestCustomer();
      const order = await createTestOrder(customer, { status: 'pending' });

      const res = await request(app)
        .put(`/api/orders/${order.id}/status`)
        .send({ status: 'completed' });

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('completed');
    });

    test('rejects invalid status', async () => {
      const customer = await createTestCustomer();
      const order = await createTestOrder(customer);

      const res = await request(app)
        .put(`/api/orders/${order.id}/status`)
        .send({ status: 'invalid_status' });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('DELETE /api/orders/:id', () => {
    test('deletes order', async () => {
      const customer = await createTestCustomer();
      const order = await createTestOrder(customer);

      const res = await request(app).delete(`/api/orders/${order.id}`);
      expect(res.statusCode).toBe(204);

      // Verify order is deleted
      const getRes = await request(app).get(`/api/orders/${order.id}`);
      expect(getRes.statusCode).toBe(404);
    });
  });

  describe('Stock Validation', () => {
    test('checks stock availability before creating order', async () => {
      const customer = await createTestCustomer();
      const product = await createTestProduct({ stock: 5, isStockTracking: true });

      const res = await request(app)
        .post('/api/orders')
        .send({
          customerId: customer.id,
          items: [
            {
              productId: product.id,
              quantity: 10 // exceeds available stock
            }
          ]
        });

      expect(res.statusCode).toBe(409);
    });

    test('decreases product stock when order is created', async () => {
      const customer = await createTestCustomer();
      const product = await createTestProduct({ stock: 50 });

      await request(app)
        .post('/api/orders')
        .send({
          customerId: customer.id,
          items: [
            {
              productId: product.id,
              quantity: 10
            }
          ]
        });

      // Verify stock was decreased
      const productRes = await request(app).get(`/api/products/${product.id}`);
      expect(productRes.body.stock).toBe(40);
    });
  });
});
