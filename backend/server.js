const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./db');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post('/api/history', (req, res) => {
  const { mode, player1, player2, score1, score2, boardSize } = req.body;
  
  const sql = "INSERT INTO game_history (mode, player1, player2, score1, score2, boardSize) VALUES (?, ?, ?, ?, ?, ?)";
  
  db.query(sql, [mode, player1, player2, score1, score2, boardSize], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send("Lỗi server");
    } else {
      res.send("Đã lưu lịch sử đấu");
    }
  });
});

app.get('/api/history', (req, res) => {
  db.query("SELECT * FROM game_history ORDER BY playedAt DESC", (err, result) => {
    if (err) throw err;
    res.json(result);
  });
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});