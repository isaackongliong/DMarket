const mysql = require('mysql2/promise'); // Use the promise-based API for better async handling
require('dotenv').config(); // Optional: For loading DATABASE_URL from a .env file locally

// Retrieve connection string from environment variables.
// Render automatically provides these to your deployed application.
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
    console.error('DATABASE_URL environment variable is not set. Please configure it in Render.');
    // Exit the process as database connection is crucial for the app to run.
    process.exit(1);
}

// Parse the connection string to extract individual parameters.
// This correctly handles all parts, including host, port, user, password, database, and SSL options.
const connectionConfig = new URL(databaseUrl);

// Ensure the protocol is 'mysql:' for the mysql2 driver.
if (connectionConfig.protocol !== 'mysql:') {
    console.error('Invalid DATABASE_URL protocol. Expected "mysql:".');
    process.exit(1);
}

// Create a connection pool. This is more robust for cloud environments,
// managing connections efficiently and handling reconnections.
const pool = mysql.createPool({
    host: connectionConfig.hostname,
    port: connectionConfig.port || 3306, // Default MySQL port if not specified in URL
    user: connectionConfig.username,
    password: connectionConfig.password,
    database: connectionConfig.pathname.substring(1), // Extracts 'newschema5' from '/newschema5'
    waitForConnections: true, // If true, getConnection() will wait if all connections are in use
    connectionLimit: 10, // Max number of connections the pool will create
    queueLimit: 0,       // Max number of requests for connections the pool will queue (0 means unlimited)
    // TiDB Cloud requires SSL/TLS encryption.
    // `rejectUnauthorized: false` allows the connection without strict CA certificate validation.
    // For production, it's recommended to set this to `true` and provide the CA certificate (`ca.pem`)
    // downloaded from your TiDB Cloud console for full security.
    ssl: {
        rejectUnauthorized: false
    }
});

// Test the connection to the pool to ensure it's working on startup.
pool.getConnection()
    .then(connection => {
        console.log('Successfully connected to TiDB Cloud database pool! 🎉');
        connection.release(); // Release the connection back to the pool immediately
    })
    .catch(err => {
        console.error('Error connecting to TiDB Cloud database pool:', err.message);
        // If the database connection fails on startup, the application cannot function.
        process.exit(1);
    });

// Export the connection pool. Your controllers will then acquire and release
// connections from this pool as needed.
module.exports = pool;