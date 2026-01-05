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
      database: process.env.DB_NAME || 'mini_crm_test',
      logging: false
    },
    app: {
      port: Number(process.env.APP_PORT) || 3001
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

const merged = Object.assign({}, base, envOverrides[NODE_ENV] || {});

module.exports = merged;
