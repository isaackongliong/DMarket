const mysql = require('mysql2');

// Create a connection to TiDB Cloud
const db = mysql.createConnection({
    host: 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com',
    user: 's2zfFMsbQeaoVaQ.root',
    password: 'DrAA1q6YdIyKww3i',  // Replace with actual password
    database: 'newschema5',
    port: 4000,
    ssl: {
        // Required for TiDB Cloud
        minVersion: 'TLSv1.2',
        rejectUnauthorized: true
    }
});

// Connect to TiDB
db.connect((err) => {
    if (err) {
        console.error('❌ Error connecting to TiDB:', err);
        return;
    }
    console.log('✅ Connected to TiDB Cloud database');
});

module.exports = db;
