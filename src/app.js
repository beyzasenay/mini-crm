const express = require('express');
const logger = require('./lib/logger');

const customersRouter = require('./routes/customers');
const ordersRouter = require('./routes/orders');

const app = express();

// TODO: rate limiting, cors vs. düşünülmemiş
app.use(express.json());

// basit log
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

app.use('/api/customers', customersRouter);
app.use('/api/orders', ordersRouter);

// Hata yakalama (detaysız)
app.use((err, req, res, next) => {
  logger.error('Unhandled error', { err });
  const status = err.status || 500;
  const message = err.message || 'Bir hata oluştu';
  res.status(status).json({ message });
});

module.exports = app;
