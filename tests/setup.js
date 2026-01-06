// Test environment setup
process.env.NODE_ENV = 'test';

// Set test database URL if not already set
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'postgres://postgres:postgres@localhost:5432/mini_crm_test';
}

// Suppress debug logging during tests (optional)
process.env.LOG_LEVEL = 'error';

// Timeout for database operations
jest.setTimeout(10000);
