const port = 8010;

const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database(':memory:');

const { createLogger, format, transports } = require('winston');

const buildSchemas = require('./src/schemas');

const app = require('./src/app')(db);

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    format.errors({ stack: true }),
    format.splat(),
    format.json(),
  ),
  transports: [
    new transports.File({ filename: 'app.log' }),
  ],
  exceptionHandlers: [
    new transports.File({ filename: 'exceptions.log' }),
  ],
});

db.serialize(() => {
  buildSchemas(db);

  app.listen(port, () => logger.info(`App started and listening on port ${port}`));
});
