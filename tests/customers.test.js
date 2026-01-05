const request = require('supertest');
const app = require('../src/app');
const { sequelize, Customer } = require('../src/models');
const { cleanDatabase, createTestCustomer } = require('./helpers');

describe('Customers API', () => {
  beforeAll(async () => {
    // Sync database schema (apply migrations)
    await sequelize.sync({ force: false });
  });

  beforeEach(async () => {
    // Clean database before each test
    await cleanDatabase();
  });

  afterAll(async () => {
    // Close database connection after all tests
    await sequelize.close();
  });

  describe('GET /api/customers', () => {
    test('returns empty array when no customers exist', async () => {
      const res = await request(app).get('/api/customers');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(0);
    });

    test('returns list of customers', async () => {
      // Create test customers
      await createTestCustomer({ firstName: 'John', email: 'john@example.com' });
      await createTestCustomer({ firstName: 'Jane', email: 'jane@example.com' });

      const res = await request(app).get('/api/customers');
      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body[0]).toHaveProperty('firstName');
      expect(res.body[0]).toHaveProperty('email');
    });
  });

  describe('POST /api/customers', () => {
    test('creates customer with valid data', async () => {
      const res = await request(app)
        .post('/api/customers')
        .send({
          firstName: 'Test',
          lastName: 'User',
          phone: '+90 555 123 4567',
          email: 'test@example.com',
          address: 'Test Address'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.id).toBeDefined();
      expect(res.body.firstName).toBe('Test');
      expect(res.body.email).toBe('test@example.com');
    });

    test('rejects customer without firstName', async () => {
      const res = await request(app)
        .post('/api/customers')
        .send({
          lastName: 'User',
          email: 'test@example.com'
        });

      expect(res.statusCode).toBe(400);
    });

    test('detects duplicate customer by phone', async () => {
      // Create first customer
      await createTestCustomer({ phone: '5551234567', email: 'first@example.com' });

      // Try to create duplicate with same phone
      const res = await request(app)
        .post('/api/customers')
        .send({
          firstName: 'Duplicate',
          lastName: 'User',
          phone: '5551234567',
          email: 'different@example.com'
        });

      expect(res.statusCode).toBe(409);
    });

    test('detects duplicate customer by email', async () => {
      // Create first customer
      await createTestCustomer({ email: 'duplicate@example.com', phone: '1234567890' });

      // Try to create duplicate with same email
      const res = await request(app)
        .post('/api/customers')
        .send({
          firstName: 'Duplicate',
          lastName: 'User',
          phone: '9876543210',
          email: 'duplicate@example.com'
        });

      expect(res.statusCode).toBe(409);
    });
  });

  describe('GET /api/customers/:id', () => {
    test('returns customer by id', async () => {
      const customer = await createTestCustomer({ firstName: 'John' });

      const res = await request(app).get(`/api/customers/${customer.id}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.id).toBe(customer.id);
      expect(res.body.firstName).toBe('John');
    });

    test('returns 404 for non-existent customer', async () => {
      const res = await request(app).get('/api/customers/99999');
      expect(res.statusCode).toBe(404);
    });
  });

  describe('PUT /api/customers/:id', () => {
    test('updates customer', async () => {
      const customer = await createTestCustomer();

      const res = await request(app)
        .put(`/api/customers/${customer.id}`)
        .send({ firstName: 'Updated', address: 'New Address' });

      expect(res.statusCode).toBe(200);
      expect(res.body.firstName).toBe('Updated');
      expect(res.body.address).toBe('New Address');
    });

    test('returns 404 for non-existent customer', async () => {
      const res = await request(app)
        .put('/api/customers/99999')
        .send({ firstName: 'Updated' });

      expect(res.statusCode).toBe(404);
    });
  });

  describe('DELETE /api/customers/:id', () => {
    test('deletes customer', async () => {
      const customer = await createTestCustomer();

      const res = await request(app).delete(`/api/customers/${customer.id}`);
      expect(res.statusCode).toBe(204);

      // Verify customer is deleted
      const getRes = await request(app).get(`/api/customers/${customer.id}`);
      expect(getRes.statusCode).toBe(404);
    });

    test('returns 404 for non-existent customer', async () => {
      const res = await request(app).delete('/api/customers/99999');
      expect(res.statusCode).toBe(404);
    });
  });
});
