// Load .env in non-production environments
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const NODE_ENV = process.env.NODE_ENV || 'development';

const base = {
  app: {
    env: NODE_ENV,
    port: Number(process.env.APP_PORT) || 3000
  },
  db: {
    dialect: 'postgres',
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'mini_crm',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASS || null,
    logging: false
  },
  logging: {
    level: process.env.LOG_LEVEL || (NODE_ENV === 'production' ? 'info' : 'debug')
  }
};

const envOverrides = {
  test: {
    db: {
      dialect: 'postgres',
      host: process.env.DB_HOST || '127.0.0.1',
      port: Number(process.env.DB_PORT) || 5432,
      database: process.env.DB_NAME || 'mini_crm_test',
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASS || 'postgres',
      logging: false
    },
    app: {
      port: Number(process.env.APP_PORT) || 3001
    },
    logging: {
      level: 'error'
    }
  },
  production: {
    app: {
      port: Number(process.env.APP_PORT) || 80
    },
    db: {
      logging: false
    }
  }
};

const merged = { ...base, ...envOverrides[NODE_ENV] };
// Deep merge db config
if (envOverrides[NODE_ENV]?.db) {
  merged.db = { ...base.db, ...envOverrides[NODE_ENV].db };
}
if (envOverrides[NODE_ENV]?.logging) {
  merged.logging = { ...base.logging, ...envOverrides[NODE_ENV].logging };
}

module.exports = merged;
