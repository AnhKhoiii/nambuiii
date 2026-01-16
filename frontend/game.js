const SIZE = 15;
const WIN_COUNT = 5;

const params = new URLSearchParams(window.location.search);
const mode = params.get("mode") || "player";

let aiSide = "O";     
let humanSide = "X";  

let maxDepth = 3; 
let scoreX = 0;
let scoreO = 0;

const modeText = document.getElementById("modeText");
const difficultyArea = document.getElementById("difficulty-area");
const inputNameX = document.getElementById("name-X");
const inputNameO = document.getElementById("name-O");

if (mode === "ai") {
  modeText.innerText = "Chế độ: Chơi với máy";
  difficultyArea.style.display = "block";
  inputNameX.value = "Bạn";
  inputNameO.value = "Máy (AI)";
  inputNameO.disabled = true;
} else {
  modeText.innerText = "Chế độ: Chơi với người";
  difficultyArea.style.display = "none";
}

function changeDifficulty() {
  const select = document.getElementById("difficultySelect");
  maxDepth = parseInt(select.value);
}

// --- LOGIC GAME ---
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
    if (cell === "X") div.style.color = "#e74c3c";
    if (cell === "O") div.style.color = "#2ecc71";
    div.innerText = cell;
    div.onclick = () => handleClick(index);
    boardDiv.appendChild(div);
  });
  updateActivePlayerUI();
}

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
  if (mode === "ai" && currentPlayer === aiSide) return;

  board[index] = currentPlayer;
  drawBoard();

  if (checkWinner(index)) return;

  if (!board.includes("")) {
    gameOver = true;
    alert("Hòa!");
    return;
  }

  currentPlayer = currentPlayer === "X" ? "O" : "X";
  updateActivePlayerUI();

  if (mode === "ai" && currentPlayer === aiSide) {
    setTimeout(aiMove, 100);
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
      updateScore(player);
      
      let winnerName = player === "X" ? inputNameX.value : inputNameO.value;
      
      document.body.classList.add("win-flash");
      setTimeout(() => {
        document.body.classList.remove("win-flash");
        alert(`Chúc mừng! ${winnerName} (${player}) đã thắng!`);
      }, 300);
      
      return true;
    }
  }
  return false;
}

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

// --- LOGIC AI ---
function getCandidateMoves(board) {
  const moves = new Set();
  board.forEach((cell, i) => {
    if (cell !== "") {
      const r = Math.floor(i / SIZE);
      const c = i % SIZE;
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
  const directions = [[1, 0], [0, 1], [1, 1], [1, -1]];

  for (let i = 0; i < board.length; i++) {
    if (board[i] === "") continue;
    const player = board[i];
    const row = Math.floor(i / SIZE);
    const col = i % SIZE;

    for (let [dx, dy] of directions) {
      const count = 1 + countDirection(row, col, dx, dy, player);
      let currentScore = 0;
      if (count >= 5) currentScore = 100000;
      else if (count === 4) currentScore = 5000;
      else if (count === 3) currentScore = 500;
      else if (count === 2) currentScore = 50;

      score += (player === aiSide) ? currentScore : -currentScore;
    }
  }
  return score;
}

function minimax(board, depth, alpha, beta, maximizing) {
  if (depth === 0) return evaluateBoard(board);
  const moves = getCandidateMoves(board);
  if (moves.length === 0) return evaluateBoard(board);

  if (maximizing) {
    let maxEval = -Infinity;
    for (let move of moves) {
      board[move] = aiSide; 
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
      board[move] = humanSide;
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
  const center = Math.floor(SIZE / 2);
  
  moves.sort((a, b) => {
    const distA = Math.abs(Math.floor(a / SIZE) - center) + Math.abs((a % SIZE) - center);
    const distB = Math.abs(Math.floor(b / SIZE) - center) + Math.abs((b % SIZE) - center);
    return distA - distB;
  });

  for (let move of moves) {
    board[move] = aiSide; 
    const score = minimax(board, maxDepth, -Infinity, Infinity, false);
    board[move] = "";
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  if (bestMove !== null) {
    board[bestMove] = aiSide;
    drawBoard();
    if (checkWinner(bestMove)) return;
  } else {
    gameOver = true;
  }
  
  if (!gameOver) {
    currentPlayer = humanSide;
    updateActivePlayerUI();
  }
}

function resetGame() {
  let tempName = inputNameX.value;
  inputNameX.value = inputNameO.value;
  inputNameO.value = tempName;

  let tempScore = scoreX;
  scoreX = scoreO;
  scoreO = tempScore;
  document.getElementById("score-X").innerText = scoreX;
  document.getElementById("score-O").innerText = scoreO;

  if (mode === "ai") {
    aiSide = (aiSide === "X") ? "O" : "X";
    humanSide = (humanSide === "X") ? "O" : "X";
  }

  board = Array(SIZE * SIZE).fill("");
  gameOver = false;
  currentPlayer = "X";
  drawBoard();

  if (mode === "ai" && aiSide === "X") {
    setTimeout(aiMove, 500);
  }
}

function resetMatch() {
  scoreX = 0;
  scoreO = 0;
  document.getElementById("score-X").innerText = "0";
  document.getElementById("score-O").innerText = "0";

  if (mode === "ai") {
    aiSide = "O";
    humanSide = "X";
    inputNameX.value = "Bạn";
    inputNameO.value = "Máy (AI)";
  } else {
    inputNameX.value = "Người chơi 1";
    inputNameO.value = "Người chơi 2";
  }

  board = Array(SIZE * SIZE).fill("");
  currentPlayer = "X";
  gameOver = false;
  drawBoard();
}


function goHome() {
  if (scoreX > 0 || scoreO > 0) {
    saveMatchResult();
  } else {
    window.location.href = "home.html";
  }
}

function saveMatchResult() {
  const p1Name = inputNameX.value;
  const p2Name = inputNameO.value;
  
  const payload = {
    mode: mode === "ai" ? "PvE" : "PvP",
    player1: p1Name,
    player2: p2Name,
    score1: scoreX,
    score2: scoreO,
    boardSize: SIZE
  };

  const fetchPromise = fetch("http://localhost:3000/api/history", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    keepalive: true 
  });

  const timeoutPromise = new Promise((resolve) => {
    setTimeout(() => resolve("timeout"), 500);
  });

  Promise.race([fetchPromise, timeoutPromise])
    .then(result => {
      if (result === "timeout") console.log("Server phản hồi chậm, bỏ qua đợi.");
      else console.log("Đã gửi dữ liệu.");
    })
    .catch(err => console.error("Lỗi khi lưu:", err))
    .finally(() => {
      window.location.href = "home.html";
    });
}

drawBoard();