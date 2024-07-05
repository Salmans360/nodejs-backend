const winston = require('winston');
const fs = require('fs');
require('winston-daily-rotate-file');
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.printf(
    (info) =>
      `${info.timestamp} ${info.level}: ${info.message.email}  ${info.message.error}`,
  ),
);

const transport = new winston.transports.DailyRotateFile({
  name: 'basic-log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: false,
  level: 'error',
  colorize: false,
  filename: './logs/error.txt',
  maxFiles: '1d',
  maxSize: '20k',
});
const removePrevious = async (filename) => {
  await fs.unlink(filename, (err) => {
    if (err) console.log(err);
    else {
      return true;
    }
  });
};
transport.on('rotate', async (oldFilename, newFilename) => {
  await removePrevious(oldFilename);
});

const logger = winston.createLogger({
  levels,
  format,
  transports: [transport],
});

module.exports = logger;
