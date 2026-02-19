import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function migrate() {
  let connection;
  try {
    connection = await mysql.createConnection(process.env.DB_URL);

    // Create kodusers table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS kodusers (
        uid INT PRIMARY KEY AUTO_INCREMENT,
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        balance DECIMAL(15,2) DEFAULT 100000,
        phone VARCHAR(20),
        role ENUM('Customer', 'Manager', 'Admin') NOT NULL
      )
    `);
    console.log('Table kodusers created or already exists.');

    // Create CJWT table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS CJWT (
        tid INT PRIMARY KEY AUTO_INCREMENT,
        token TEXT NOT NULL,
        uid INT NOT NULL,
        expiry DATETIME NOT NULL,
        FOREIGN KEY (uid) REFERENCES kodusers(uid) ON DELETE CASCADE
      )
    `);
    console.log('Table CJWT created or already exists.');

    console.log('Migration completed successfully.');
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

migrate();
