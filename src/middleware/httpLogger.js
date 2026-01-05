const logger = require('../lib/logger');

module.exports = function httpLogger(req, res, next) {
  const start = Date.now();
  const { method, url } = req;
  const traceId = req.traceId;

  logger.info(`Incoming request ${method} ${url}`, { traceId });

  const originalSend = res.send;
  res.send = function (body) {
    const duration = Date.now() - start;
    logger.info(`Response ${method} ${url} ${res.statusCode} - ${duration}ms`, {
      traceId,
      meta: { statusCode: res.statusCode },
    });
    return originalSend.call(this, body);
  };

  next();
};
