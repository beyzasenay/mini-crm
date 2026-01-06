// Test utilities for mocking and stubbing
module.exports = {
  /**
   * Create a mock logger
   */
  createMockLogger: () => ({
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  }),

  /**
   * Create a mock request object
   */
  createMockRequest: (overrides = {}) => ({
    body: {},
    params: {},
    query: {},
    headers: {},
    ...overrides
  }),

  /**
   * Create a mock response object
   */
  createMockResponse: () => {
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      end: jest.fn().mockReturnThis(),
      statusCode: 200
    };
    return res;
  },

  /**
   * Create a mock next function
   */
  createMockNext: () => jest.fn(),

  /**
   * Mock database queries
   */
  mockDatabaseQueries: {
    findOne: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn()
  }
};
