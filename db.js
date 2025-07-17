const mysql = require('mysql2');
// Isaac@gmail.com:isaacRepublicP0ly
// Database connection details
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'c372ga'
  });

//Connecting to database
db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

module.exports = db;