import { Ride } from '../models/ride';

/**
 * Handles the validation of models
 */
export default class ValidationService {
  /**
   * Ensures that validity of a ride object checking the following conditions:
   * - Starting/Ending latitude must be between -90 and 90
   * - Starting/Ending longitude must be between -180 and 180
   * - Driver, rider, and driver vehicle name must not be empty
   * Returns all validadation errors, empty if there is none
   */
  public static validateRide(ride: Ride): Error[] {
    const errors: Error[] = [];

    if (ride.startLat < -90 || ride.startLat > 90
      || ride.startLong < -180 || ride.startLong > 180) {
      errors.push(new Error('Start latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively'));
    }

    if (ride.endLat < -90 || ride.endLat > 90 || ride.endLong < -180 || ride.endLong > 180) {
      errors.push(new Error('End latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively'));
    }

    if (ride.riderName.length < 1) {
      errors.push(new Error('Rider name must be a non empty string'));
    }

    if (ride.driverName.length < 1) {
      errors.push(new Error('Driver name must be a non empty string'));
    }

    if (ride.driverVehicle.length < 1) {
      errors.push(new Error('Driver vehicle name must be a non empty string'));
    }
    return errors;
  }

  /**
   * Ensures that validity of paging parameters, checking the following:
   * - Page must be > 0
   * - Limit must be >= 0
   * Returns all validadation errors, empty if there is none
   */
  public static validatePagingParameters(page: number, limit: number): Error[] {
    const errors: Error[] = [];

    if (page <= 0) {
      errors.push(new Error('Page must be greater than 0'));
    }

    if (limit < 0) {
      errors.push(new Error('Limit must be equal or greater than 0'));
    }

    return errors;
  }
}
