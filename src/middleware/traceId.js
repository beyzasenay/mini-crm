const { v4: uuidv4 } = require('uuid');

module.exports = function traceIdMiddleware(req, res, next) {
  const traceId = req.headers['x-trace-id'] || uuidv4();
  req.traceId = traceId;
  res.setHeader('X-Trace-Id', traceId);
  next();
};
