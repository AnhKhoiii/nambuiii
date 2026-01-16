const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "nam252005",        
  database: "game_xo"
});

db.connect(err => {
  if (err) {
    console.error(" Kết nối MySQL thất bại:", err);
  } else {
    console.log(" MySQL đã kết nối (db.js)");
  }
});

module.exports = db;
