import { Database } from 'sqlite3';
import { Ride } from '../models/ride';
import { RideEntity } from '../models/ride-entity';

/**
 * Allows management of rides through an sqlite database
 */
export default class SqlRideService {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  /**
   * Ensures that the database is initialized that is, schema is created.
   * This does nothing if the schema is already created.
   */
  public initializeDb(): Promise<void> {
    const createRideTableSchema = `
      CREATE TABLE IF NOT EXISTS Rides
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

    return new Promise((resolve) => {
      const callback = () => {
        resolve();
      };
      this.db.run(createRideTableSchema, callback);
    });
  }

  /**
   * Deletes the schemas created by this service.
   */
  public clearDb(): Promise<void> {
    return new Promise((resolve) => {
      const callback = () => {
        resolve();
      };
      this.db.run('DROP TABLE IF EXISTS Rides', callback);
    });
  }

  /**
   * Adds a ride entity to the database and returns its ID
   * @param ride the ride to insert
   */
  public async insertRide(ride: Ride): Promise<number> {
    const values = [
      ride.startLat,
      ride.startLong,
      ride.endLat,
      ride.endLong,
      ride.riderName,
      ride.driverName,
      ride.driverVehicle,
    ];
    return new Promise((resolve) => {
      const statement = this.db.prepare('INSERT INTO Rides(startLat, startLong, endLat, endLong, riderName, driverName, driverVehicle) VALUES (?, ?, ?, ?, ?, ?, ?)');
      statement.run(values, function cb() {
        resolve(this.lastID);
      });
    });
  }

  /**
   * Gets a ride entity base on its ID.
   * @param rideId id of the ride
   */
  public getRide(rideId: number): Promise<RideEntity> {
    return new Promise((resolve) => {
      this.db.all('SELECT * FROM Rides WHERE rideID = ?', rideId, (_error: Error, rows: RideEntity[]) => {
        if (rows.length === 0) {
          resolve(null);
        } else {
          resolve(rows[0]);
        }
      });
    });
  }

  /**
   * Retrieves a list of rides, returning a paginated result set
   * @param page the page of the result set
   * @param limit maximum of number of results to return per page
   */
  public async getRides(page = 1, limit = 20): Promise<RideEntity[]> {
    const sqlLimit = limit === 0 ? -1 : limit;
    const offset = (page - 1) * limit;

    return new Promise((resolve) => {
      this.db.all('SELECT * FROM Rides LIMIT ? OFFSET ?', [sqlLimit, offset], (_error: Error, rows: RideEntity[]) => {
        resolve(rows);
      });
    });
  }

  /**
   * Returns the total number of rides in the database
   */
  public countRides(): Promise<number> {
    return new Promise((resolve) => {
      this.db.all('SELECT COUNT(*) AS size FROM Rides', (error: Error, rows: any[]) => {
        resolve(rows[0].size);
      });
    });
  }
}
