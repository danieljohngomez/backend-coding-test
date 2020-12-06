import { Ride } from './ride';

/**
 * Represents a ride object stored as an entity.
 * Usually used when persisting a ride object to database.
 */
export interface RideEntity extends Ride {
    rideID: number,
    created: string
}
