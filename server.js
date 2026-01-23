// server.js
const app = require('./app');
const { connectDB } = require('./config/dbConn');

const PORT = process.env.PORT || 8080;

(async () => {
  try {
    console.log('Connecting to PostgreSQL...');
    await connectDB();

    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running successfully on http://192.168.1.14:${PORT}`);
    });

    server.on('error', (err) => {
      console.error('Server failed to start:', err.message);
      process.exit(1);
    });
  } catch (error) {
    console.error('Startup Error:', error.message);
    process.exit(1);
  }
})();
