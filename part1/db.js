const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '', // Set your actual MySQL password here
  database: 'DogWalkService',
});

module.exports = pool;
