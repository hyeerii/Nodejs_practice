const mysql = require('mysql');
const db = mysql.createConnection({
    host: 'localhost',
    user: '',
    password: '',
    database: 'opentutorials'
  });
  db.connect();

  module.exports = db;