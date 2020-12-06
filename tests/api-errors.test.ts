import { Ride } from '../src/models/ride';
import ValidationService from '../src/services/validation';
import { expect } from 'chai';
import ApiErrors from '../src/api-errors';
import { ApiError } from '../src/models/api-error';

describe('ApiErrors tests', () => {
    it('Create validation error', (done) => {
        const apiError = ApiErrors.validation([new Error('Test error')])
        const expected: ApiError = {
            errorCode: 'VALIDATION_ERROR',
            messages: ['Test error']
        }
        expect(apiError).deep.equal(expected);
        done();
    });

    it('Create ride not found error', (done) => {
        const apiError = ApiErrors.rideNotFound()
        const expected: ApiError = {
            errorCode: 'RIDES_NOT_FOUND_ERROR',
            messages: ['Could not find any rides']
        }
        expect(apiError).deep.equal(expected);
        done();
    });
});
