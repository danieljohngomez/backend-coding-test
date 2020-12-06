import request from 'supertest';
import assert from 'assert';
import sqlite3 from 'sqlite3';
import server from '../src/app';
import { buildSchemas, deleteSchemas } from '../src/schemas';
import { addRide } from './util';

sqlite3.verbose();

const db = new sqlite3.Database(':memory:');

const app = server(db);

describe('API tests', () => {
  beforeEach((done) => {
    db.serialize(() => {
      deleteSchemas(db, () => buildSchemas(db, () => done()));
    });
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
        .send({
          start_lat: 1,
          start_long: 2,
          end_lat: 3,
          end_long: 4,
          rider_name: 'Rider',
          driver_name: 'Driver',
          driver_vehicle: 'Car',
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, res) => {
          const ride = res.body[0];
          assert.strictEqual(ride.startLat, 1);
          assert.strictEqual(ride.startLong, 2);
          assert.strictEqual(ride.endLat, 3);
          assert.strictEqual(ride.endLong, 4);
          assert.strictEqual(ride.riderName, 'Rider');
          assert.strictEqual(ride.driverName, 'Driver');
          assert.strictEqual(ride.driverVehicle, 'Car');
          return done();
        });
    });

    it('should add not add ride if invalid start coordinates', (done) => {
      request(app)
        .post('/rides')
        .send({
          start_lat: -999,
          start_long: -999,
          end_lat: 1,
          end_long: 4,
          rider_name: 'Rider',
          driver_name: 'Driver',
          driver_vehicle: 'Car',
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, res) => {
          assert.strictEqual(res.body.error_code, 'VALIDATION_ERROR');
          assert.strictEqual(res.body.message, 'Start latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively');
          return done();
        });
    });

    it('should add not add ride if invalid end coordinates', (done) => {
      request(app)
        .post('/rides')
        .send({
          start_lat: 1,
          start_long: 1,
          end_lat: -999,
          end_long: -999,
          rider_name: 'Rider',
          driver_name: 'Driver',
          driver_vehicle: 'Car',
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, res) => {
          assert.strictEqual(res.body.error_code, 'VALIDATION_ERROR');
          assert.strictEqual(res.body.message, 'End latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively');
          return done();
        });
    });

    it('should add not add ride if rider name is empty', (done) => {
      request(app)
        .post('/rides')
        .send({
          start_lat: 1,
          start_long: 1,
          end_lat: 1,
          end_long: 1,
          rider_name: '',
          driver_name: 'Driver',
          driver_vehicle: 'Car',
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, res) => {
          assert.strictEqual(res.body.error_code, 'VALIDATION_ERROR');
          assert.strictEqual(res.body.message, 'Rider name must be a non empty string');
          return done();
        });
    });

    it('should add not add ride if driver name is empty', (done) => {
      request(app)
        .post('/rides')
        .send({
          start_lat: 1,
          start_long: 1,
          end_lat: 1,
          end_long: 1,
          rider_name: 'Rider',
          driver_name: '',
          driver_vehicle: 'Car',
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, res) => {
          assert.strictEqual(res.body.error_code, 'VALIDATION_ERROR');
          assert.strictEqual(res.body.message, 'Driver name must be a non empty string');
          return done();
        });
    });

    it('should add not add ride if driver name is empty', (done) => {
      request(app)
        .post('/rides')
        .send({
          start_lat: 1,
          start_long: 1,
          end_lat: 1,
          end_long: 1,
          rider_name: 'Rider',
          driver_name: 'Driver',
          driver_vehicle: '',
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, res) => {
          assert.strictEqual(res.body.error_code, 'VALIDATION_ERROR');
          assert.strictEqual(res.body.message, 'Driver vehicle name must be a non empty string');
          return done();
        });
    });
  });

  describe('GET /rides', () => {
    it('should return error if no ride', (done) => {
      request(app)
        .get('/rides')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, res) => {
          const body = res.body;
          assert.strictEqual(body.error_code, 'RIDES_NOT_FOUND_ERROR');
          assert.strictEqual(body.message, 'Could not find any rides');
          return done();
        });
    });

    it('should return rides', (done) => {
      addRide(db, () => {
        request(app)
          .get('/rides')
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end((err, res) => {
            assert.strictEqual(res.body.total_results, 1);
            assert.strictEqual(res.body.total_pages, 1);
            assert.strictEqual(res.body.page, 1);
            assert.strictEqual(res.body.limit, 20);
            const ride = res.body.data[0];
            assert(ride != null);
            return done();
          });
      });
    });

    it('should return validation error if page is <= 0', (done) => {
      request(app)
        .get('/rides?page=0')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, res) => {
          assert.strictEqual(res.body.error_code, 'VALIDATION_ERROR');
          assert.strictEqual(res.body.message, 'Page must be greater than 0');
          return done();
        });
    });

    it('should return validation error if limit is < 0', (done) => {
      request(app)
        .get('/rides?limit=-1')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, res) => {
          assert.strictEqual(res.body.error_code, 'VALIDATION_ERROR');
          assert.strictEqual(res.body.message, 'Limit must be equal or greater than 0');
          return done();
        });
    });

    it('should honor pagination when getting rides', (done) => {
      addRide(db, () => addRide(db, () => {
        request(app)
          .get('/rides?limit=1&page=1')
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end((err, res) => {
            assert.strictEqual(res.body.total_results, 2);
            assert.strictEqual(res.body.total_pages, 2);
            assert.strictEqual(res.body.page, 1);
            assert.strictEqual(res.body.limit, 1);
            const ride = res.body.data[0];
            assert(ride != null);
            return done();
          });
      }));
    });
  });

  describe('GET /rides/{id}', () => {
    it('should get ride', (done) => {
      addRide(db, () => {
        request(app)
          .get('/rides/1')
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end((err, res) => {
            const ride = res.body[0];
            assert.strictEqual(ride.rideID, 1);
            return done();
          });
      });
    });

    it('should get not return ride if ID does not exist', (done) => {
      request(app)
        .get('/rides/999')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, res) => {
          assert.strictEqual(res.body.error_code, 'RIDES_NOT_FOUND_ERROR');
          assert.strictEqual(res.body.message, 'Could not find any rides');
          return done();
        });
    });
  });
});