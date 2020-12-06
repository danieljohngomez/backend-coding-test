import assert from 'assert';
import { stub } from 'sinon';
import sqlite3, { Database } from 'sqlite3';
import { Ride } from '../src/models/ride';
import SqlRideService from '../src/services/sql-ride';

const testRide: Ride = {
    startLat: 1,
    startLong: 2,
    endLat: 3,
    endLong: 4,
    riderName: 'Rider',
    driverName: 'Driver',
    driverVehicle: 'Vehicle'
}

describe('SqlRideService tests', () => {
    beforeEach((done) => {
        const test: any = this;
        test.db = new sqlite3.Database(':memory:')
        test.service = new SqlRideService(test.db);
        done();
    });
    
    const test: any = this;

    it('Initalize DB should create Rides table', async () => {
        const service: SqlRideService = test.service;
        const db: Database = test.db;
        await service.initializeDb();
        db.all("SELECT count(*) AS size FROM sqlite_master WHERE type='table' AND name='Rides'", (error: Error, result: any[]) => {
            assert.strictEqual(result[0].size, 1)
        })
    });

    it('Clear DB should drop Rides table', async () => {
        const service: SqlRideService = test.service;
        const db: Database = test.db;
        await service.initializeDb();
        await service.clearDb();
        db.all("SELECT count(*) AS size FROM sqlite_master WHERE type='table' AND name='Rides'", (error: Error, result: any[]) => {
            assert.strictEqual(result[0].size, 0)
        })
    });

    it('Insert and get by id should add and return ride', async () => {
        const service: SqlRideService = test.service;
        await service.initializeDb();
        const rideId = await service.insertRide(testRide)
        const rideEntity = await service.getRide(rideId);
        assert(rideEntity.rideID > 0);
        assert(rideEntity.created != null);
        assert.strictEqual(rideEntity.startLat, 1);
        assert.strictEqual(rideEntity.startLong, 2);
        assert.strictEqual(rideEntity.endLat, 3);
        assert.strictEqual(rideEntity.endLong, 4);
        assert.strictEqual(rideEntity.riderName, 'Rider');
        assert.strictEqual(rideEntity.driverName, 'Driver');
        assert.strictEqual(rideEntity.driverVehicle, 'Vehicle');
    });

    it('Get all should return all rides', async () => {
        const service: SqlRideService = test.service;
        await service.initializeDb();
        const ride1Id = await service.insertRide(testRide);
        const ride2Id = await service.insertRide(testRide);

        const rides = await service.getRides(1, 2);
        assert.strictEqual(rides[0].rideID, ride1Id);
        assert.strictEqual(rides[1].rideID, ride2Id);
        assert.strictEqual(rides.length, 2);
        
        rides.forEach(rideEntity => {
            assert.strictEqual(rideEntity.startLat, 1);
            assert.strictEqual(rideEntity.startLong, 2);
            assert.strictEqual(rideEntity.endLat, 3);
            assert.strictEqual(rideEntity.endLong, 4);
            assert.strictEqual(rideEntity.riderName, 'Rider');
            assert.strictEqual(rideEntity.driverName, 'Driver');
            assert.strictEqual(rideEntity.driverVehicle, 'Vehicle');
        })
    });

    it('Count should return correct count', async () => {
        const service: SqlRideService = test.service;
        await service.initializeDb();
        await service.insertRide(testRide);
        await service.insertRide(testRide);

        const count = await service.countRides();
        assert.strictEqual(count, 2);
    });

    it('Get by ID should return null if ride does not exist', async () => {
        const service: SqlRideService = test.service;
        await service.initializeDb();
        const ride = await service.getRide(9999);
        assert(ride == null);
    });

    describe('Database failures', () => {
        const failingDb = new sqlite3.Database(':memory:')
        stub(failingDb, 'run').callsFake(() => { throw new Error('test failure');});
        stub(failingDb, 'all').callsFake(() => { throw new Error('test failure');});
        stub(failingDb, 'prepare').callsFake(() => { throw new Error('test failure');});

        it('Should throw error when initialize db fails', async () => {
            const service = new SqlRideService(failingDb);
            try {
                await service.initializeDb();
            } catch(error) {
                assert.strictEqual(error.message, 'test failure');
            }
        });

        it('Should throw error when clear db fails', async () => {
            const service = new SqlRideService(failingDb);
            try {
                await service.clearDb();
            } catch(error) {
                assert.strictEqual(error.message, 'test failure');
            }
        });

        it('Should throw error when insert fails', async () => {
            const service = new SqlRideService(failingDb);
            try {
                await service.insertRide(testRide);
            } catch(error) {
                assert.strictEqual(error.message, 'test failure');
            }
        });

        it('Should throw error when get by id fails', async () => {
            const service = new SqlRideService(failingDb);
            try {
                await service.getRide(1);
            } catch(error) {
                assert.strictEqual(error.message, 'test failure');
            }
        });


        it('Should throw error when get all fails', async () => {
            const service = new SqlRideService(failingDb);
            try {
                await service.getRides();
            } catch(error) {
                assert.strictEqual(error.message, 'test failure');
            }
        });
    });

});
