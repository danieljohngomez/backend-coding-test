import { createLogger, format, transports } from 'winston';
import sqlite3 from 'sqlite3';
import { buildSchemas } from './schemas';
import server from './app';

sqlite3.verbose();

const port = 8010;

const db = new sqlite3.Database(':memory:');

const app = server(db);

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
