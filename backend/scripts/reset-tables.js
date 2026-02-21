/**
 * Reset tables - drops and recreates kodusers and CJWT
 * Use when schema needs to match the expected structure
 */

const mysql = require('mysql2/promise');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const DB_URL = process.env.DB_URL;
if (!DB_URL) {
  console.error('DB_URL environment variable is required. Create backend/.env with DB_URL.');
  process.exit(1);
}

async function reset() {
  let connection;
  try {
    const url = new URL(DB_URL);
    connection = await mysql.createConnection({
      host: url.hostname,
      port: url.port || 3306,
      user: url.username,
      password: url.password,
      database: url.pathname.slice(1) || 'defaultdb',
      ssl: { rejectUnauthorized: false },
    });

    console.log('Dropping tables...');
    await connection.execute('SET FOREIGN_KEY_CHECKS = 0');
    await connection.execute('DROP TABLE IF EXISTS CJWT');
    await connection.execute('DROP TABLE IF EXISTS kodusers');
    await connection.execute('SET FOREIGN_KEY_CHECKS = 1');
    console.log('Tables dropped.');

    console.log('Creating kodusers...');
    await connection.execute(`
      CREATE TABLE kodusers (
        uid INT PRIMARY KEY AUTO_INCREMENT,
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        balance DECIMAL(15, 2) DEFAULT 100000,
        phone VARCHAR(50),
        role ENUM('Customer', 'manager', 'admin') NOT NULL DEFAULT 'Customer',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Creating CJWT...');
    await connection.execute(`
      CREATE TABLE CJWT (
        token_id INT PRIMARY KEY AUTO_INCREMENT,
        token TEXT NOT NULL,
        user_id INT NOT NULL,
        expiry DATETIME NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES kodusers(uid) ON DELETE CASCADE,
        INDEX idx_token (token(255)),
        INDEX idx_user_id (user_id),
        INDEX idx_expiry (expiry)
      )
    `);

    console.log('Reset completed successfully.');
  } catch (err) {
    console.error('Reset failed:', err.message);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

reset();
