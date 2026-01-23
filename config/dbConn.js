// config/dbConn.js
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.PG_URI, // e.g. postgres://user:pass@host:port/db
});

const connectDB = async () => {
  try {
    const client = await pool.connect();
    console.log('PostgreSQL Connected Successfully');
    client.release();
    return true;
  } catch (err) {
    console.error(' PostgreSQL Connection Error:', err.message);
    throw err; // Let server.js handle exit
  }
};

module.exports = { pool, connectDB };
