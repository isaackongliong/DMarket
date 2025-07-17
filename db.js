const mysql = require('mysql2');

// Create connection to Aiven MySQL
const db = mysql.createConnection({
  host: 'mysql-158a8f52-isaack200433-07ba.c.aivencloud.com',
  user: 'avnadmin',
  password: 'YOUR_PASSWORD_HERE', // 👈 replace with your actual password
  database: 'defaultdb',          // 👈 use "defaultdb" unless renamed
  port: 15690,                    // 👈 Aiven’s custom port
  ssl: {
    rejectUnauthorized: true      // 👈 enable SSL as required by Aiven
  }
});

// Connect to database
db.connect((err) => {
  if (err) {
    console.error('❌ MySQL connection failed:', err);
    return;
  }
  console.log('✅ Connected to Aiven MySQL database');
});

module.exports = db;
