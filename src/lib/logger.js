const { createLogger, transports, format } = require('winston');
const { combine, timestamp, printf, errors, json } = format;

const isProd = process.env.NODE_ENV === 'production';

const consoleFormat = printf(({ level, message, timestamp, stack, traceId, meta }) => {
  const base = `${timestamp} [${level}]${traceId ? ` [trace:${traceId}]` : ''} ${message}`;
  if (stack) return `${base} - ${stack}`;
  if (meta) return `${base} - ${JSON.stringify(meta)}`;
  return base;
});

const logger = createLogger({
  level: process.env.LOG_LEVEL || (isProd ? 'info' : 'debug'),
  format: combine(timestamp(), errors({ stack: true }), json()),
  transports: [
    new transports.Console({
      format: combine(timestamp(), errors({ stack: true }), consoleFormat),
    }),
  ],
  exitOnError: false,
});

module.exports = logger;
