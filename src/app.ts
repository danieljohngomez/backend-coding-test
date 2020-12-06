import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import helmet from 'helmet';
import parseNumber from './util';
import SqlRideService from './services/sql-ride';
import { ApiError } from './models/api-error';
import { RideEntity } from './models/ride-entity';
import ValidationService from './services/validation';
import { Ride } from './models/ride';
import { Paged } from './models/page';
import ApiErrors from './api-errors';

const app = express();

const jsonParser = bodyParser.json();

const server = (rideService: SqlRideService) => {
  app.use(helmet());

  app.get('/health', (_req, res) => res.send('Healthy'));

  app.post('/rides', jsonParser, async (req: Request<Ride>, res: Response<RideEntity | ApiError>) => {
    const ride: Ride = req.body;
    const validationErrors = ValidationService.validateRide(ride);
    if (validationErrors.length > 0) {
      return res.status(400).send(ApiErrors.validation(validationErrors));
    }

    const rideId = await rideService.insertRide(ride);
    const rideEntity = await rideService.getRide(rideId);

    return res.send(rideEntity);
  });

  app.get('/rides', async (req, res: Response<Paged<RideEntity> | ApiError>) => {
    const page = parseNumber(req.query.page, 1);
    const limit = parseNumber(req.query.limit, 20);

    const validationErrors = ValidationService.validatePagingParameters(page, limit);
    if (validationErrors.length > 0) {
      return res.status(400).send(ApiErrors.validation(validationErrors));
    }

    const totalResults = await rideService.countRides();
    if (totalResults <= 0) {
      return res.send({
        totalResults: 0,
        totalPages: 1,
        page: 1,
        limit,
        data: [],
      });
    }
    const rides = await rideService.getRides(page, limit);
    const totalPages = limit === 0 ? 1 : Math.ceil(totalResults / limit);

    const paginatedRides: Paged<RideEntity> = {
      totalResults,
      totalPages,
      page,
      limit,
      data: rides,
    };
    return res.send(paginatedRides);
  });

  app.get('/rides/:id', async (req, res: Response<RideEntity | ApiError>) => {
    const ride = await rideService.getRide(parseNumber(req.params.id, undefined));
    if (ride == null) {
      return res.status(404).send(ApiErrors.rideNotFound());
    }

    return res.send(ride);
  });

  return app;
};

export default server;
