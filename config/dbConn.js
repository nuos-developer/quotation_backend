const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.PG_URI,
  // ssl: {
  //   rejectUnauthorized: false
  // }
});

const connectDB = async () => {
  try {
    const client = await pool.connect();
    console.log('PostgreSQL Connected Successfully');
    client.release();
    return true;
  } catch (err) {
    console.error('PostgreSQL Connection Error:', err.message);
    throw err;
  }
};

module.exports = { pool, connectDB };
