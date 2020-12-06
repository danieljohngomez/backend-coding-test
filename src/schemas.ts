import { Database } from 'sqlite3';

export const buildSchemas = (db: Database, callback?: () => void) => {
  const createRideTableSchema = `
        CREATE TABLE Rides
        (
        rideID INTEGER PRIMARY KEY AUTOINCREMENT,
        startLat DECIMAL NOT NULL,
        startLong DECIMAL NOT NULL,
        endLat DECIMAL NOT NULL,
        endLong DECIMAL NOT NULL,
        riderName TEXT NOT NULL,
        driverName TEXT NOT NULL,
        driverVehicle TEXT NOT NULL,
        created DATETIME default CURRENT_TIMESTAMP
        )
    `;

  db.run(createRideTableSchema, callback);

  return db;
};

export const deleteSchemas = (db: Database, callback?: () => void) => {
  db.run('DROP TABLE IF EXISTS Rides', callback);
  return db;
};
