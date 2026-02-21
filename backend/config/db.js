const mysql = require('mysql2/promise');
require('dotenv').config();

const DB_URL = process.env.DB_URL;
if (!DB_URL) {
  throw new Error('DB_URL environment variable is required');
}

function parseDbUrl(url) {
  const parsed = new URL(url);
  return {
    host: parsed.hostname,
    port: parsed.port || 3306,
    user: parsed.username,
    password: parsed.password,
    database: parsed.pathname.slice(1) || 'defaultdb',
    ssl: { rejectUnauthorized: false },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  };
}

const pool = mysql.createPool(parseDbUrl(DB_URL));

async function testConnection() {
  try {
    const conn = await pool.getConnection();
    await conn.ping();
    conn.release();
    return true;
  } catch (err) {
    console.error('DB connection failed:', err.message);
    return false;
  }
}

module.exports = { pool, testConnection };
