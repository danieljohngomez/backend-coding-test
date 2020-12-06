import request from 'supertest';
import assert from 'assert';
import sqlite3 from 'sqlite3';
import server from '../src/app';
import { RideEntity } from '../src/models/ride-entity';
import SqlRideService from '../src/services/sql-ride';
import { ApiError } from '../src/models/api-error';
import { Paged } from '../src/models/page';
import ValidationService from '../src/services/validation';
import { stub } from 'sinon';
import { Ride } from '../src/models/ride';
import { expect } from 'chai';

sqlite3.verbose();

const db = new sqlite3.Database(':memory:');

const rideService = new SqlRideService(db);

const app = server(rideService);

const testRide: Ride = {
  startLat: 10,
  startLong: 20,
  endLat: 30,
  endLong: 40,
  riderName: 'Rider',
  driverName: 'Driver',
  driverVehicle: 'Vehicle'
}

describe('API tests', () => {
  beforeEach(async () => {
    await rideService.clearDb();
    await rideService.initializeDb();
  });

  describe('GET /health', () => {
    it('should return health', (done) => {
      request(app)
        .get('/health')
        .expect('Content-Type', /text/)
        .expect(200, done);
    });
  });

  describe('POST /rides', () => {
    it('should add ride', (done) => {
      request(app)
        .post('/rides')
        .send(testRide)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, res) => {
          const ride = res.body;
          expect(ride.startLat).is.equals(testRide.startLat);
          expect(ride.startLong).is.equals(testRide.startLong);
          expect(ride.endLat).is.equals(testRide.endLat);
          expect(ride.endLong).is.equals(testRide.endLong);
          expect(ride.riderName).is.equals(testRide.riderName);
          expect(ride.driverName).is.equals(testRide.driverName);
          expect(ride.driverVehicle).is.equals(testRide.driverVehicle);
          return done();
        });
    });

    it('should return validation error if input is invalid', (done) => {
      const validationStub = stub(ValidationService, 'validateRide').callsFake(() => {
        return [new Error('Test Error')]
      })

      const ride: Ride = {
        startLat: 1,
        startLong: 2,
        endLat: 3,
        endLong: 4,
        riderName: 'Rider',
        driverName: 'Driver',
        driverVehicle: 'Vehicle'
      }

      request(app)
        .post('/rides')
        .send(ride)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .end((_err, res) => {
          validationStub.restore();
          const response: ApiError = res.body;
          expect(response.errorCode).is.equals('VALIDATION_ERROR')
          expect(response.messages).deep.equals(['Test Error'])
          return done();
        });
    });
  });

  describe('GET /rides', () => {
    it('should return empty rides if there are no rides', (done) => {
      request(app)
        .get('/rides')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .end((_err, res) => {
          const rides: Paged<RideEntity> = res.body;
          expect(rides.totalResults).is.equals(0);
          expect(rides.totalPages).is.equals(1);
          expect(rides.page).is.equals(1);
          expect(rides.data).is.empty;
          done();
        });
    });

    it('should return rides', async () => {
      await rideService.insertRide(testRide);
      request(app)
        .get('/rides')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .end((_err, res) => {
          const paginatedRides: Paged<RideEntity> = res.body;
          expect(paginatedRides.totalResults).is.equals(1);
          expect(paginatedRides.totalPages).is.equals(1);
          expect(paginatedRides.page).is.equals(1);
          expect(paginatedRides.limit).is.equals(20);
        });
    });

    it('should return validation error if page parameters are invalid', (done) => {
      request(app)
        .get('/rides?page=-999&limit=-999')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .end((_err, res) => {
          const response: ApiError = res.body;
          expect(response.errorCode).is.equals('VALIDATION_ERROR');
          expect(response.messages).deep.equals([
            'Page must be greater than 0',
            'Limit must be equal or greater than 0',
          ]);
          return done();
        });
    });

    it('should honor pagination when getting rides', async () => {
      await rideService.insertRide(testRide);
      await rideService.insertRide(testRide);
      request(app)
        .get('/rides?limit=1&page=1')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, res) => {
          const paginatedRides: Paged<RideEntity> = res.body;
          expect(paginatedRides.totalResults).is.equals(2);
          expect(paginatedRides.totalPages).is.equals(2);
          expect(paginatedRides.page).is.equals(1);
          expect(paginatedRides.limit).is.equals(1);
        });
    });
  });

  describe('GET /rides/{id}', () => {
    it('should get ride', async () => {
      const id = await rideService.insertRide(testRide);
      request(app)
          .get(`/rides/${id}`)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end((_err, res) => {
            const ride: RideEntity = res.body;
            expect(ride.rideID).is.equals(id);
          });
    });

    it('should get not return ride if ID does not exist', (done) => {
      request(app)
        .get('/rides/999')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, res) => {
          const response: ApiError = res.body;
          expect(response.errorCode).is.equals('RIDES_NOT_FOUND_ERROR');
          expect(response.messages).is.deep.equals(['Could not find any rides']);
          return done();
        });
    });
  });
});
