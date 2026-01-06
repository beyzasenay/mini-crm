const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUiExpress = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'MiniCRM API',
      version: '1.0.0',
      description: "Küçük işletmeler için müşteri, ürün ve sipariş yönetimi API'si",
      contact: {
        name: 'Development Team',
        email: 'dev@minicrm.local',
      },
      license: {
        name: 'MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Geliştirme ortamı',
      },
    ],
    components: {
      schemas: {
        Customer: {
          type: 'object',
          required: ['firstName'],
          properties: {
            id: {
              type: 'integer',
              example: 1,
            },
            firstName: {
              type: 'string',
              example: 'Ahmet',
            },
            lastName: {
              type: 'string',
              example: 'Yılmaz',
            },
            phone: {
              type: 'string',
              example: '5321234567',
            },
            email: {
              type: 'string',
              example: 'ahmet@example.com',
            },
            address: {
              type: 'string',
              example: 'İstanbul, Türkiye',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Product: {
          type: 'object',
          required: ['name'],
          properties: {
            id: {
              type: 'integer',
              example: 1,
            },
            name: {
              type: 'string',
              example: 'USB Kablo',
            },
            description: {
              type: 'string',
              example: 'Yüksek kaliteli USB-C kablo',
            },
            price: {
              type: 'number',
              format: 'float',
              example: 29.99,
            },
            priceType: {
              type: 'string',
              enum: ['fixed', 'variable'],
              example: 'fixed',
            },
            stock: {
              type: 'integer',
              example: 100,
            },
            isStockTracking: {
              type: 'boolean',
              example: true,
            },
            isActive: {
              type: 'boolean',
              example: true,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Order: {
          type: 'object',
          required: ['items'],
          properties: {
            id: {
              type: 'integer',
              example: 1,
            },
            customerId: {
              type: 'integer',
              nullable: true,
              example: 1,
            },
            guestFirstName: {
              type: 'string',
              nullable: true,
              example: 'Ayşe',
            },
            guestLastName: {
              type: 'string',
              nullable: true,
              example: 'Kaya',
            },
            guestEmail: {
              type: 'string',
              nullable: true,
              example: 'ayse@example.com',
            },
            guestPhone: {
              type: 'string',
              nullable: true,
              example: '5329876543',
            },
            totalAmount: {
              type: 'number',
              format: 'float',
              example: 99.99,
            },
            status: {
              type: 'string',
              enum: ['pending', 'processing', 'shipped', 'completed', 'cancelled'],
              example: 'pending',
            },
            notes: {
              type: 'string',
              nullable: true,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
            },
            duplicate: {
              type: 'object',
              nullable: true,
            },
          },
        },
      },
    },
  },
  apis: ['./src/routes/customers.js', './src/routes/products.js', './src/routes/orders.js'],
};

const specs = swaggerJsdoc(options);

module.exports = {
  swaggerUiExpress,
  specs,
};
