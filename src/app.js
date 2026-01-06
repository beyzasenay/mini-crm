const express = require('express');
const logger = require('./lib/logger');
const traceId = require('./middleware/traceId');
const httpLogger = require('./middleware/httpLogger');
const { swaggerUiExpress, specs } = require('./config/swagger');

const customersRouter = require('./routes/customers');
const ordersRouter = require('./routes/orders');
const productsRouter = require('./routes/products');

const app = express();

// TODO: rate limiting, cors vs. düşünülmemiş
app.use(express.json());

// Trace ID and HTTP logging
app.use(traceId);
app.use(httpLogger);

// Swagger API dokümantasyonu
app.use('/api-docs', swaggerUiExpress.serve, swaggerUiExpress.setup(specs));

app.use('/api/customers', customersRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/products', productsRouter);

// Hata yakalama (iyileştirilmiş)
app.use((err, req, res, _next) => {
  const status = err.status || 500;
  const message = err.message || 'Bir hata oluştu';
  const trace = req.traceId || null;

  if (status >= 500) {
    logger.error(message, { err, traceId: trace });
  } else if (status >= 400) {
    logger.warn(message, { err, traceId: trace });
  } else {
    logger.info(message, { err, traceId: trace });
  }

  res.status(status).json({ message, traceId: trace });
});

module.exports = app;
