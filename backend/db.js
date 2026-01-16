const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'nam252005',
  database: 'game_xo'
});

connection.connect(err => {
  if (err) throw err;
  console.log("Connected to MySQL!");
  
  const sql = `CREATE TABLE IF NOT EXISTS game_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    mode VARCHAR(50),
    player1 VARCHAR(255),
    player2 VARCHAR(255),
    score1 INT,
    score2 INT,
    boardSize INT,
    playedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`;
  
  connection.query(sql, (err) => {
    if (err) throw err;
    console.log("Table game_history checked/created");
  });
});

module.exports = connection;