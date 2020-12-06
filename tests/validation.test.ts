import { Ride } from '../src/models/ride';
import ValidationService from '../src/services/validation';
import { expect } from 'chai';

describe('ValidationService tests', () => {

    describe('Ride validation', () => {
        it('Invalid ride should return all errors', (done) => {
            const invalidRide: Ride = {
                startLat: -999,
                startLong: -999,
                endLat: -999,
                endLong: -999,
                riderName: '',
                driverName: '',
                driverVehicle: '',
            }
            const errorMessages = ValidationService.validateRide(invalidRide).map(error => error.message);
            expect(errorMessages).deep.equal([
                'Start latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively',
                'End latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively',
                'Rider name must be a non empty string',
                'Driver name must be a non empty string',
                'Driver vehicle name must be a non empty string',
            ]);
            done();
        });

        it('Valid ride should not return errors', (done) => {
            const invalidRide: Ride = {
                startLat: 90,
                startLong: 180,
                endLat: 90,
                endLong: 180,
                riderName: 'Rider',
                driverName: 'Driver',
                driverVehicle: 'Driver',
            }
            const errorMessages = ValidationService.validateRide(invalidRide).map(error => error.message);
            expect(errorMessages).is.empty;
            done();
        });
    });
    
    describe('Pagination validation', () => {
        it('Invalid pagination parameters should return all errors', (done) => {
            const errorMessages = ValidationService.validatePagingParameters(-1, -1).map(error => error.message);
            expect(errorMessages).deep.equal([
                'Page must be greater than 0',
                'Limit must be equal or greater than 0',
            ]);
            done();
        });

        it('Valid pagination parameters should not return errors', (done) => {
            const errorMessages = ValidationService.validatePagingParameters(1, 1).map(error => error.message);
            expect(errorMessages).is.empty;
            done();
        });
    });
    
});
