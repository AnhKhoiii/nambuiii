const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

// test server
app.get("/", (req, res) => {
  res.send("Backend Caro đang chạy OK ");
});

// lưu lịch sử đấu
app.post("/api/history", (req, res) => {
  const { mode, winner, boardSize } = req.body;

  const sql =
    "INSERT INTO history (mode, winner, board_size) VALUES (?, ?, ?)";

  db.query(sql, [mode, winner, boardSize], err => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Đã lưu lịch sử" });
  });
});

// lấy lịch sử đấu
app.get("/api/history", (req, res) => {
  db.query(
    "SELECT * FROM history ORDER BY created_at DESC",
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json(result);
    }
  );
});

//xoa lich su dau
app.delete("/api/history", (req, res) => {
  const sql = "DELETE FROM history";

  db.query(sql, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Xóa lịch sử thất bại" });
    }
    res.json({ message: "Đã xóa toàn bộ lịch sử đấu" });
  });
});

app.listen(3000, () => {
  console.log(" Server chạy tại http://localhost:3000");
});
