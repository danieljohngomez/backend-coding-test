/**
 * Represents a ride route
 */
export interface Ride {
    startLat: number,
    startLong: number,
    endLat: number,
    endLong: number,
    riderName: string,
    driverName: string,
    driverVehicle : string,
}
