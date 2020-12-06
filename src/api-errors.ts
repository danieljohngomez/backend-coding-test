import { ApiError } from './models/api-error';

/**
 * Creates API errors
 */
export default class ApiErrors {
  public static validation(errors: Error[]): ApiError {
    return {
      errorCode: 'VALIDATION_ERROR',
      messages: errors.map((error) => error.message),
    };
  }

  public static rideNotFound(): ApiError {
    return {
      errorCode: 'RIDES_NOT_FOUND_ERROR',
      messages: ['Could not find any rides'],
    };
  }
}
