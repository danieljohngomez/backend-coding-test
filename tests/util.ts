import { Database } from "sqlite3";
import { buildSchemas } from "../src/schemas";

export const addRide = (db: Database, callback?: () => void) => {
    const ride = [
        1,
        2,
        3,
        4,
        'Rider',
        'Driver',
        'Car',
    ]

    db.run('INSERT INTO Rides(startLat, startLong, endLat, endLong, riderName, driverName, driverVehicle) VALUES (?, ?, ?, ?, ?, ?, ?)', ride, callback);
};