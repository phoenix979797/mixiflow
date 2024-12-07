const winston = require('winston');
const path = require('path');

const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    // Log to console
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    // Log errors to a file
    new winston.transports.File({
      filename: path.join(__dirname, '../logs/error.log'),
      level: 'error'
    }),
    // Log all levels to another file
    new winston.transports.File({
      filename: path.join(__dirname, '../logs/combined.log')
    })
  ]
});

module.exports = logger; 