const boardSize = 15;
const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");
const currentPlayerEl = document.getElementById("current-player");
const statusMessageEl = document.getElementById("status-message");
const resetBtn = document.getElementById("reset-btn");
const undoBtn = document.getElementById("undo-btn");

const margin = 30;
const cellSize = (canvas.width - margin * 2) / (boardSize - 1);

let board = Array.from({ length: boardSize }, () =>
  Array.from({ length: boardSize }, () => null)
);
let moveHistory = [];
let currentPlayer = "black";
let winner = null;

const render = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGrid();
  drawStarPoints();
  drawPieces();
};

const drawGrid = () => {
  ctx.strokeStyle = "#6d4c2f";
  ctx.lineWidth = 1;
  for (let i = 0; i < boardSize; i += 1) {
    const offset = margin + i * cellSize;
    ctx.beginPath();
    ctx.moveTo(margin, offset);
    ctx.lineTo(canvas.width - margin, offset);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(offset, margin);
    ctx.lineTo(offset, canvas.height - margin);
    ctx.stroke();
  }
};

const drawStarPoints = () => {
  const starPoints = [3, 7, 11];
  ctx.fillStyle = "#4a2f1b";
  starPoints.forEach((x) => {
    starPoints.forEach((y) => {
      ctx.beginPath();
      ctx.arc(
        margin + x * cellSize,
        margin + y * cellSize,
        4,
        0,
        Math.PI * 2
      );
      ctx.fill();
    });
  });
};

const drawPieces = () => {
  board.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      if (!cell) {
        return;
      }
      const x = margin + colIndex * cellSize;
      const y = margin + rowIndex * cellSize;
      const gradient = ctx.createRadialGradient(
        x - 6,
        y - 6,
        2,
        x,
        y,
        18
      );
      if (cell === "black") {
        gradient.addColorStop(0, "#5a5a5a");
        gradient.addColorStop(1, "#111111");
      } else {
        gradient.addColorStop(0, "#ffffff");
        gradient.addColorStop(1, "#d9d9d9");
      }
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, 18, 0, Math.PI * 2);
      ctx.fill();
    });
  });
};

const updateStatus = (message) => {
  statusMessageEl.textContent = message;
  if (winner) {
    currentPlayerEl.textContent = winner === "black" ? "黑棋" : "白棋";
  } else {
    currentPlayerEl.textContent = currentPlayer === "black" ? "黑棋" : "白棋";
  }
};

const getBoardPosition = (event) => {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  const col = Math.round((x - margin) / cellSize);
  const row = Math.round((y - margin) / cellSize);
  if (row < 0 || row >= boardSize || col < 0 || col >= boardSize) {
    return null;
  }
  return { row, col };
};

const isWinningMove = (row, col) => {
  const directions = [
    { dr: 0, dc: 1 },
    { dr: 1, dc: 0 },
    { dr: 1, dc: 1 },
    { dr: 1, dc: -1 },
  ];
  return directions.some(({ dr, dc }) => {
    let count = 1;
    let r = row + dr;
    let c = col + dc;
    while (board[r]?.[c] === currentPlayer) {
      count += 1;
      r += dr;
      c += dc;
    }
    r = row - dr;
    c = col - dc;
    while (board[r]?.[c] === currentPlayer) {
      count += 1;
      r -= dr;
      c -= dc;
    }
    return count >= 5;
  });
};

const handleMove = (row, col) => {
  if (winner || board[row][col]) {
    return;
  }
  board[row][col] = currentPlayer;
  moveHistory.push({ row, col, player: currentPlayer });

  if (isWinningMove(row, col)) {
    winner = currentPlayer;
    updateStatus(`${winner === "black" ? "黑棋" : "白棋"} 获胜！`);
  } else {
    currentPlayer = currentPlayer === "black" ? "white" : "black";
    updateStatus("正在进行中");
  }
  render();
};

const resetGame = () => {
  board = Array.from({ length: boardSize }, () =>
    Array.from({ length: boardSize }, () => null)
  );
  moveHistory = [];
  currentPlayer = "black";
  winner = null;
  updateStatus("正在进行中");
  render();
};

const undoMove = () => {
  if (moveHistory.length === 0 || winner) {
    return;
  }
  const lastMove = moveHistory.pop();
  if (!lastMove) {
    return;
  }
  board[lastMove.row][lastMove.col] = null;
  currentPlayer = lastMove.player;
  updateStatus("已悔棋");
  render();
};

canvas.addEventListener("click", (event) => {
  const pos = getBoardPosition(event);
  if (!pos) {
    return;
  }
  handleMove(pos.row, pos.col);
});

resetBtn.addEventListener("click", resetGame);
undoBtn.addEventListener("click", undoMove);

updateStatus("正在进行中");
render();
