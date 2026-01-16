const SIZE = 15;        // Kích thước bàn cờ
const WIN_COUNT = 5;   // 5 quân liên tiếp là thắng

//Lấy chế độ chơi
const params = new URLSearchParams(window.location.search);
const mode = params.get("mode") || "player";

document.getElementById("modeText").innerText =
  mode === "ai" ? "Chế độ: Chơi với máy" : "Chế độ: Chơi với người";

const AI_PLAYER = "O";
const HUMAN_PLAYER = "X";
const MAX_DEPTH = 3; // số bước tính trước

//Tạo bàn cờ
let board = Array(SIZE * SIZE).fill("");
let currentPlayer = "X";
let gameOver = false;
const boardDiv = document.getElementById("board");
const statusText = document.getElementById("status");
function drawBoard() {
  boardDiv.innerHTML = "";
  boardDiv.style.gridTemplateColumns = `repeat(${SIZE}, 40px)`;

  board.forEach((cell, index) => {
    const div = document.createElement("div");
    div.className = "cell";
    div.innerText = cell;
    div.onclick = () => handleClick(index);
    boardDiv.appendChild(div);//gan o co vao ban co
  });
}

//Xử lý click
function handleClick(index) {
  if (board[index] || gameOver) return;
  if (mode === "ai" && currentPlayer === "O") return;

  board[index] = currentPlayer;
  drawBoard();

  if (checkWinner(index)) return;

  // Kiểm tra hòa
  if (!board.includes("")) {
    gameOver = true;
    statusText.innerText = "Hòa!";
    saveHistory("draw");
    return;
  }

  // Chơi với người
  if (mode === "player") {
    currentPlayer = currentPlayer === "X" ? "O" : "X";
    statusText.innerText = `Lượt: ${currentPlayer}`;
  }

  // Chơi với máy
  if (mode === "ai") {
    currentPlayer = "O";
    statusText.innerText = "Lượt: O (Máy)";
    setTimeout(aiMove, 400);
  }
}

// Kiểm tra thắng
function checkWinner(index) {
  const player = board[index];
  const row = Math.floor(index / SIZE);
  const col = index % SIZE;

  const directions = [
    [1, 0],   // ngang
    [0, 1],   // dọc
    [1, 1],   // chéo \
    [1, -1]   // chéo /
  ];

  for (let [dx, dy] of directions) {
    let count = 1;
    count += countDirection(row, col, dx, dy, player);
    count += countDirection(row, col, -dx, -dy, player);

    if (count >= WIN_COUNT) {
      gameOver = true;
      statusText.innerText = `${player} thắng!`;
      saveHistory(player);
      document.body.classList.add("win-flash");
      setTimeout(() => {
        document.body.classList.remove("win-flash");
      }, 600);
      return true;
    }
  }
  return false;
}

function countDirection(row, col, dx, dy, player) {
  let r = row + dy;
  let c = col + dx;
  let count = 0;

  while (
    r >= 0 && r < SIZE &&
    c >= 0 && c < SIZE &&
    board[r * SIZE + c] === player
  ) {
    count++;
    r += dy;
    c += dx;
  }
  return count;
}

function getCandidateMoves(board) {
  const moves = new Set();

  board.forEach((cell, i) => {
    if (cell !== "") {
      const r = Math.floor(i / SIZE);
      const c = i % SIZE;

      // Chỉ kiểm tra bán kính 1 ô (dr: -1 to 1) để giảm tải cho máy
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr;
          const nc = c + dc;
          const idx = nr * SIZE + nc;

          if (
            nr >= 0 && nr < SIZE &&
            nc >= 0 && nc < SIZE &&
            board[idx] === ""
          ) {
            moves.add(idx);
          }
        }
      }
    }
  });

  if (moves.size === 0) {
    return [Math.floor(SIZE * SIZE / 2)];
  }

  return [...moves];
}

function evaluateBoard(board) {
  let score = 0;
  const directions = [[1, 0], [0, 1], [1, 1], [1, -1]];

  // Chỉ duyệt qua những ô có quân cờ để tính điểm
  for (let i = 0; i < board.length; i++) {
    if (board[i] === "") continue;

    const player = board[i];
    const row = Math.floor(i / SIZE);
    const col = i % SIZE;

    for (let [dx, dy] of directions) {
      // Chỉ tính điểm theo một chiều để tránh tính lặp lại một hàng 2 lần
      const count = 1 + countDirection(row, col, dx, dy, player);
      
      let currentScore = 0;
      if (count >= 5) currentScore = 100000;
      else if (count === 4) currentScore = 10000;
      else if (count === 3) currentScore = 1000;
      else if (count === 2) currentScore = 200;

      score += (player === AI_PLAYER) ? currentScore : -currentScore;
    }
  }
  return score;
}

function minimax(board, depth, alpha, beta, maximizing) {
  if (depth === 0) {
    return evaluateBoard(board);
  }

  const moves = getCandidateMoves(board);

  if (maximizing) {
    let maxEval = -Infinity;

    for (let move of moves) {
      board[move] = AI_PLAYER;
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

// Tạm thời dùng random
function aiMove() {
  if (gameOver) return;

  let bestScore = -Infinity;
  let bestMove = null;

  let moves = getCandidateMoves(board);
  
  // Ưu tiên các ô ở gần giữa bàn cờ hơn để tính toán nhanh hơn
  const center = Math.floor(SIZE / 2);
  moves.sort((a, b) => {
    const distA = Math.abs(Math.floor(a / SIZE) - center) + Math.abs((a % SIZE) - center);
    const distB = Math.abs(Math.floor(b / SIZE) - center) + Math.abs((b % SIZE) - center);
    return distA - distB;
  });

  for (let move of moves) {
    board[move] = AI_PLAYER;
    const score = minimax(board, MAX_DEPTH, -Infinity, Infinity, false);
    board[move] = "";

    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  if (bestMove !== null) {
    board[bestMove] = AI_PLAYER;
    drawBoard();
    if (checkWinner(bestMove)) return;
  }

  currentPlayer = "X";
  statusText.innerText = "Lượt: X";
}


// Lưu lịch sử
function saveHistory(winner) {
  fetch("http://localhost:3000/api/history", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      mode: mode === "ai" ? "bot" : "pvp",
      winner: winner,
      boardSize: SIZE
    })
  });
}

// Chức năng khác
function resetGame() {
  board = Array(SIZE * SIZE).fill("");
  currentPlayer = "X";
  gameOver = false;
  statusText.innerText = "Lượt: X";
  drawBoard();
}

function goHome() {
  window.location.href = "home.html";
}

drawBoard();
statusText.innerText = "Lượt: X";
