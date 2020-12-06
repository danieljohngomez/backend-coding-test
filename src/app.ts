import { Database } from 'sqlite3';

import express from 'express';

import bodyParser from 'body-parser';

import parseNumber from './util';

const app = express();

const jsonParser = bodyParser.json();

const server = (db: Database) => {
  app.get('/health', (req, res) => res.send('Healthy'));

  app.post('/rides', jsonParser, (req, res) => {
    const startLatitude = Number(req.body.start_lat);
    const startLongitude = Number(req.body.start_long);
    const endLatitude = Number(req.body.end_lat);
    const endLongitude = Number(req.body.end_long);
    const riderName = req.body.rider_name;
    const driverName = req.body.driver_name;
    const driverVehicle = req.body.driver_vehicle;

    if (startLatitude < -90 || startLatitude > 90
        || startLongitude < -180 || startLongitude > 180) {
      return res.send({
        error_code: 'VALIDATION_ERROR',
        message: 'Start latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively',
      });
    }

    if (endLatitude < -90 || endLatitude > 90 || endLongitude < -180 || endLongitude > 180) {
      return res.send({
        error_code: 'VALIDATION_ERROR',
        message: 'End latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively',
      });
    }

    if (typeof riderName !== 'string' || riderName.length < 1) {
      return res.send({
        error_code: 'VALIDATION_ERROR',
        message: 'Rider name must be a non empty string',
      });
    }

    if (typeof driverName !== 'string' || driverName.length < 1) {
      return res.send({
        error_code: 'VALIDATION_ERROR',
        message: 'Driver name must be a non empty string',
      });
    }

    if (typeof driverVehicle !== 'string' || driverVehicle.length < 1) {
      return res.send({
        error_code: 'VALIDATION_ERROR',
        message: 'Driver vehicle name must be a non empty string',
      });
    }

    const values = [req.body.start_lat,
      req.body.start_long,
      req.body.end_lat,
      req.body.end_long,
      req.body.rider_name,
      req.body.driver_name,
      req.body.driver_vehicle,
    ];

    db.run('INSERT INTO Rides(startLat, startLong, endLat, endLong, riderName, driverName, driverVehicle) VALUES (?, ?, ?, ?, ?, ?, ?)', values, function cb(err) {
      if (err) {
        return res.send({
          error_code: 'SERVER_ERROR',
          message: 'Unknown error',
        });
      }

      db.all('SELECT * FROM Rides WHERE rideID = ?', this.lastID, (error, rows) => {
        if (error) {
          return res.send({
            error_code: 'SERVER_ERROR',
            message: 'Unknown error',
          });
        }

        return res.send(rows);
      });
      return true;
    });
    return true;
  });

  app.get('/rides', (req, res) => {
    const page = parseNumber(req.query.page, 1);
    const limit = parseNumber(req.query.limit, 20);

    if (page <= 0) {
      return res.send({
        error_code: 'VALIDATION_ERROR',
        message: 'Page must be greater than 0',
      });
    }

    if (limit < 0) {
      return res.send({
        error_code: 'VALIDATION_ERROR',
        message: 'Limit must be equal or greater than 0',
      });
    }

    db.all('SELECT COUNT(*) AS size FROM Rides', (countError, countRows) => {
      if (countError) {
        return res.send({
          error_code: 'SERVER_ERROR',
          message: 'Unknown error',
        });
      }

      const totalResults = countRows[0].size;
      const totalPages = limit === 0 ? 1 : Math.ceil(totalResults / limit);

      if (totalResults === 0) {
        return res.send({
          error_code: 'RIDES_NOT_FOUND_ERROR',
          message: 'Could not find any rides',
        });
      }

      const sqlLimit = limit === 0 ? -1 : limit;
      const offset = (page - 1) * limit;

      db.all(`SELECT * FROM Rides LIMIT ${sqlLimit} OFFSET ${offset}`, (err, rows) => {
        if (err) {
          return res.send({
            error_code: 'SERVER_ERROR',
            message: 'Unknown error',
          });
        }

        if (rows.length === 0) {
          return res.send({
            error_code: 'RIDES_NOT_FOUND_ERROR',
            message: 'Could not find any rides',
          });
        }

        return res.send({
          total_results: totalResults,
          total_pages: totalPages,
          page,
          limit,
          data: rows,
        });
      });
      return true;
    });
    return true;
  });

  app.get('/rides/:id', (req, res) => {
    db.all(`SELECT * FROM Rides WHERE rideID='${req.params.id}'`, (err, rows) => {
      if (err) {
        return res.send({
          error_code: 'SERVER_ERROR',
          message: 'Unknown error',
        });
      }

      if (rows.length === 0) {
        return res.send({
          error_code: 'RIDES_NOT_FOUND_ERROR',
          message: 'Could not find any rides',
        });
      }

      return res.send(rows);
    });
  });

  return app;
};

export default server;
