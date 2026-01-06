# Testing Guide

## Test Setup

This project uses **Jest** for unit and integration testing with **Supertest** for API endpoint testing.

### Test Structure

```
tests/
├── customers.test.js      # Customer API integration tests
├── products.test.js       # Product API integration tests
├── orders.test.js         # Order API integration tests
├── etl-cleaners.test.js   # ETL data cleaner unit tests
├── helpers.js             # Test helper utilities and fixtures
├── mocks.js               # Mock objects for testing
└── setup.js               # Jest setup and configuration
```

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm run test:watch
```

### Run tests with coverage report
```bash
npm run test:coverage
```

### Run specific test file
```bash
npm test -- customers.test.js
```

### Run tests matching a pattern
```bash
npm test -- --testNamePattern="creates customer"
```

## Test Environment Configuration

Tests run in a test environment (NODE_ENV=test) with:
- **Database**: PostgreSQL test database (mini_crm_test)
- **Database URL**: `postgres://postgres:postgres@localhost:5432/mini_crm_test`
- **Log Level**: error (suppress debug logs)

### Setting up test database

1. Ensure PostgreSQL is running locally or via Docker
2. Create test database:
   ```bash
   createdb mini_crm_test
   ```

3. Or use Docker Compose:
   ```bash
   docker-compose up -d
   ```

## Test Categories

### Unit Tests
- **etl-cleaners.test.js**: Tests for ETL data cleaning functions
  - Phone number normalization
  - Email validation
  - Name splitting and normalization

### Integration Tests
- **customers.test.js**: Customer CRUD operations and duplicate detection
- **products.test.js**: Product CRUD operations and stock management
- **orders.test.js**: Order creation, status management, and stock validation

## Test Helpers

### `createTestCustomer(overrides)`
Creates a test customer with sensible defaults.
```javascript
const customer = await createTestCustomer({ 
  firstName: 'John',
  email: 'john@example.com'
});
```

### `createTestProduct(overrides)`
Creates a test product with default stock and pricing.
```javascript
const product = await createTestProduct({ 
  name: 'Premium Widget',
  price: 199.99 
});
```

### `createTestOrder(customer, overrides)`
Creates a test order for a customer or as guest order.
```javascript
const order = await createTestOrder(customer, { 
  totalAmount: 500,
  status: 'pending'
});
```

### `cleanDatabase()`
Clears all data from test database before each test.
```javascript
beforeEach(async () => {
  await cleanDatabase();
});
```

## Mocking

Use mock utilities from `tests/mocks.js`:

```javascript
const { createMockLogger, createMockResponse } = require('./mocks');

const logger = createMockLogger();
const res = createMockResponse();
```

## CI/CD Pipeline

Tests run automatically on every push and pull request via GitHub Actions.

### GitHub Actions Workflow
- **File**: `.github/workflows/test.yml`
- **Triggers**: Push to main/develop, Pull Requests
- **Node versions**: 18.x, 20.x
- **Steps**:
  1. Checkout code
  2. Install dependencies
  3. Lint code
  4. Run tests
  5. Generate coverage report
  6. Upload coverage to Codecov

## Test Coverage

Coverage thresholds are configured in `jest.config.js`:
- Branches: 50%
- Functions: 50%
- Lines: 50%
- Statements: 50%

View coverage report:
```bash
npm run test:coverage
open coverage/lcov-report/index.html
```

## Writing Tests

### Example Unit Test
```javascript
describe('ETL Cleaners', () => {
  describe('normalizePhone', () => {
    test('removes formatting characters', () => {
      expect(normalizePhone('(532) 111-2233')).toBe('5321112233');
    });
  });
});
```

### Example Integration Test
```javascript
describe('Customers API', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  test('creates customer', async () => {
    const res = await request(app)
      .post('/api/customers')
      .send({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.id).toBeDefined();
  });
});
```

## Debugging Tests

### Run single test
```bash
npm test -- customers.test.js -t "creates customer"
```

### Run with verbose output
```bash
npm test -- --verbose
```

### Debug in VS Code
Add to `.vscode/launch.json`:
```json
{
  "type": "node",
  "request": "launch",
  "name": "Jest Debug",
  "program": "${workspaceFolder}/node_modules/jest/bin/jest.js",
  "args": ["--runInBand"],
  "console": "integratedTerminal"
}
```

## Common Issues

### Tests timeout
- Increase timeout in `jest.config.js`: `testTimeout: 10000`
- Check if database is running

### Database connection errors
- Verify PostgreSQL is running
- Check `DATABASE_URL` environment variable
- Ensure test database exists

### Import errors
- Clear Jest cache: `npm test -- --clearCache`
- Check file paths are correct

## Best Practices

1. **Use beforeEach to clean database** - ensures test isolation
2. **Use test helpers** - reduces boilerplate code
3. **Test both success and failure cases** - validate error handling
4. **Keep tests focused** - one concept per test
5. **Use meaningful test names** - describe what is being tested
6. **Mock external dependencies** - keep tests fast and isolated
7. **Add comments for complex test logic** - improve maintainability
