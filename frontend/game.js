const SIZE = 15;
const WIN_COUNT = 5;

// Lấy chế độ chơi
const params = new URLSearchParams(window.location.search);
const mode = params.get("mode") || "player";

const AI_PLAYER = "O";
const HUMAN_PLAYER = "X";

// --- CẤU HÌNH MỚI ---
let maxDepth = 3; // Mặc định trung bình
let scoreX = 0;
let scoreO = 0;

// Cập nhật giao diện ban đầu
const modeText = document.getElementById("modeText");
const difficultyArea = document.getElementById("difficulty-area");
const inputNameX = document.getElementById("name-X");
const inputNameO = document.getElementById("name-O");

if (mode === "ai") {
  modeText.innerText = "Chế độ: Chơi với máy";
  difficultyArea.style.display = "block"; // Hiện chọn độ khó
  inputNameX.value = "Bạn";
  inputNameO.value = "Máy (AI)";
  inputNameO.disabled = true; // Không cho đổi tên máy
} else {
  modeText.innerText = "Chế độ: Chơi với người";
  difficultyArea.style.display = "none";
}

// Hàm thay đổi độ khó từ giao diện
function changeDifficulty() {
  const select = document.getElementById("difficultySelect");
  maxDepth = parseInt(select.value);
  console.log("Đã đổi độ khó, Depth =", maxDepth);
}

// --- LOGIC GAME CŨ (CÓ SỬA ĐỔI) ---
let board = Array(SIZE * SIZE).fill("");
let currentPlayer = "X";
let gameOver = false;
const boardDiv = document.getElementById("board");

function drawBoard() {
  boardDiv.innerHTML = "";
  boardDiv.style.gridTemplateColumns = `repeat(${SIZE}, 40px)`;

  board.forEach((cell, index) => {
    const div = document.createElement("div");
    div.className = "cell";
    if (cell === "X") div.style.color = "#e74c3c"; // Màu đỏ cho X
    if (cell === "O") div.style.color = "#2ecc71"; // Màu xanh cho O
    div.innerText = cell;
    div.onclick = () => handleClick(index);
    boardDiv.appendChild(div);
  });
  updateActivePlayerUI();
}

// Hiệu ứng highlight người đang chơi
function updateActivePlayerUI() {
  document.getElementById("card-X").classList.remove("active");
  document.getElementById("card-O").classList.remove("active");
  
  if (currentPlayer === "X") {
    document.getElementById("card-X").classList.add("active");
  } else {
    document.getElementById("card-O").classList.add("active");
  }
}

function handleClick(index) {
  if (board[index] || gameOver) return;
  if (mode === "ai" && currentPlayer === "O") return;

  board[index] = currentPlayer;
  drawBoard();

  if (checkWinner(index)) return;

  if (!board.includes("")) {
    gameOver = true;
    alert("Hòa!"); // Thông báo đơn giản
    saveHistory("draw");
    return;
  }

  // Đổi lượt
  currentPlayer = currentPlayer === "X" ? "O" : "X";
  updateActivePlayerUI();

  // Máy đánh
  if (mode === "ai" && currentPlayer === "O") {
    setTimeout(aiMove, 100); // Giảm delay cho mượt
  }
}

function checkWinner(index) {
  const player = board[index];
  const row = Math.floor(index / SIZE);
  const col = index % SIZE;

  const directions = [[1, 0], [0, 1], [1, 1], [1, -1]];

  for (let [dx, dy] of directions) {
    let count = 1;
    count += countDirection(row, col, dx, dy, player);
    count += countDirection(row, col, -dx, -dy, player);

    if (count >= WIN_COUNT) {
      gameOver = true;
      
      // -- CẬP NHẬT TỈ SỐ --
      updateScore(player);
      
      // Lấy tên người thắng
      let winnerName = player === "X" ? inputNameX.value : inputNameO.value;
      
      // Hiệu ứng thắng
      document.body.classList.add("win-flash");
      setTimeout(() => {
        document.body.classList.remove("win-flash");
        alert(`Chúc mừng! ${winnerName} (${player}) đã thắng!`);
      }, 300);

      saveHistory(player);
      return true;
    }
  }
  return false;
}

// Hàm cập nhật điểm số lên màn hình
function updateScore(winner) {
  if (winner === "X") {
    scoreX++;
    document.getElementById("score-X").innerText = scoreX;
  } else {
    scoreO++;
    document.getElementById("score-O").innerText = scoreO;
  }
}

function countDirection(row, col, dx, dy, player) {
  let r = row + dy;
  let c = col + dx;
  let count = 0;
  while (r >= 0 && r < SIZE && c >= 0 && c < SIZE && board[r * SIZE + c] === player) {
    count++;
    r += dy;
    c += dx;
  }
  return count;
}

// --- LOGIC AI (MINIMAX) ---
function getCandidateMoves(board) {
  const moves = new Set();
  board.forEach((cell, i) => {
    if (cell !== "") {
      const r = Math.floor(i / SIZE);
      const c = i % SIZE;
      // Tìm các ô trống xung quanh quân cờ đã đánh
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr;
          const nc = c + dc;
          const idx = nr * SIZE + nc;
          if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE && board[idx] === "") {
            moves.add(idx);
          }
        }
      }
    }
  });
  if (moves.size === 0) return [Math.floor(SIZE * SIZE / 2)];
  return [...moves];
}

function evaluateBoard(board) {
  let score = 0;
  // Các hướng đánh giá
  const directions = [[1, 0], [0, 1], [1, 1], [1, -1]];

  for (let i = 0; i < board.length; i++) {
    if (board[i] === "") continue;
    const player = board[i];
    const row = Math.floor(i / SIZE);
    const col = i % SIZE;

    for (let [dx, dy] of directions) {
      // Chỉ tính nếu ô tiếp theo KHÁC player (để tránh lặp)
      // Đây là một cách đánh giá đơn giản hóa để demo
      const count = 1 + countDirection(row, col, dx, dy, player);
      
      let currentScore = 0;
      if (count >= 5) currentScore = 100000;
      else if (count === 4) currentScore = 5000; // Giảm điểm 4 để AI ưu tiên chặn hơn
      else if (count === 3) currentScore = 500;
      else if (count === 2) currentScore = 50;

      // Nếu là AI thì cộng điểm, Người thì trừ điểm
      score += (player === AI_PLAYER) ? currentScore : -currentScore;
    }
  }
  return score;
}

function minimax(board, depth, alpha, beta, maximizing) {
  if (depth === 0) return evaluateBoard(board);

  const moves = getCandidateMoves(board);
  // Nếu hết nước đi
  if (moves.length === 0) return evaluateBoard(board);

  if (maximizing) {
    let maxEval = -Infinity;
    for (let move of moves) {
      board[move] = AI_PLAYER;
      // Gọi đệ quy, giảm depth
      const evalScore = minimax(board, depth - 1, alpha, beta, false);
      board[move] = "";
      maxEval = Math.max(maxEval, evalScore);
      alpha = Math.max(alpha, evalScore);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (let move of moves) {
      board[move] = HUMAN_PLAYER;
      const evalScore = minimax(board, depth - 1, alpha, beta, true);
      board[move] = "";
      minEval = Math.min(minEval, evalScore);
      beta = Math.min(beta, evalScore);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

function aiMove() {
  if (gameOver) return;

  let bestScore = -Infinity;
  let bestMove = null;
  let moves = getCandidateMoves(board);

  // Sắp xếp nước đi ưu tiên gần trung tâm (Heuristic để cắt tỉa nhanh hơn)
  const center = Math.floor(SIZE / 2);
  moves.sort((a, b) => {
    const distA = Math.abs(Math.floor(a / SIZE) - center) + Math.abs((a % SIZE) - center);
    const distB = Math.abs(Math.floor(b / SIZE) - center) + Math.abs((b % SIZE) - center);
    return distA - distB;
  });

  // Sử dụng biến maxDepth được cấu hình
  for (let move of moves) {
    board[move] = AI_PLAYER;
    // maxDepth lấy từ selection
    const score = minimax(board, maxDepth, -Infinity, Infinity, false);
    board[move] = "";

    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  if (bestMove !== null) {
    board[bestMove] = AI_PLAYER;
    drawBoard();
    checkWinner(bestMove);
  } else {
      // Trường hợp hiếm (bàn đầy)
      gameOver = true;
  }
  
  // Đổi lượt về X sau khi máy đánh xong (nếu chưa thắng)
  if (!gameOver) {
      currentPlayer = "X";
      updateActivePlayerUI();
  }
}

function saveHistory(winner) {
  // Lấy tên thực tế từ ô input
  const winnerName = winner === "X" ? inputNameX.value : inputNameO.value;
  
  fetch("http://localhost:3000/api/history", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      mode: mode === "ai" ? "bot" : "pvp",
      winner: winnerName, // Lưu tên người thắng thay vì chỉ "X" hay "O"
      boardSize: SIZE
    })
  }).catch(err => console.log("Lỗi lưu lịch sử (Backend chưa chạy?):", err));
}

function resetGame() {
  board = Array(SIZE * SIZE).fill("");
  currentPlayer = "X";
  gameOver = false;
  drawBoard();
  // Lưu ý: Không reset điểm số scoreX, scoreO ở đây
}

// Hàm mới để reset cả tỉ số
function resetMatch() {
  scoreX = 0;
  scoreO = 0;
  document.getElementById("score-X").innerText = "0";
  document.getElementById("score-O").innerText = "0";
  resetGame();
}

function goHome() {
  window.location.href = "home.html";
}

// Khởi chạy ban đầu
drawBoard();