const ROWS = 7, COLS = 7, CELL_SIZE = 70;
const ARM_MIN = 3, ARM_MAX = 30;
const PEN_MIN = 1, PEN_MAX = 15;

const canvas = document.getElementById("gridCanvas");
const ctx = canvas.getContext("2d");

// Use .fill() with undefined and .map() to avoid shared references in multidimensional arrays.
const grid = Array(ROWS).fill().map(() => Array(COLS).fill().map(() => ({
  armLength: 15,
  penWidth: 2
})));

function drawGrid() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const { armLength, penWidth } = grid[r][c];
      if (penWidth <= 0) continue;
      const cx = c * CELL_SIZE + CELL_SIZE / 2;
      const cy = r * CELL_SIZE + CELL_SIZE / 2;
      ctx.lineWidth = penWidth;
      ctx.strokeStyle = "black";
      ctx.beginPath();
      ctx.moveTo(cx - armLength, cy);
      ctx.lineTo(cx + armLength, cy);
      ctx.moveTo(cx, cy - armLength);
      ctx.lineTo(cx, cy + armLength);
      ctx.stroke();
    }
  }
}

function getCell(x, y) {
  return {
    row: Math.floor(y / CELL_SIZE),
    col: Math.floor(x / CELL_SIZE)
  };
}

canvas.addEventListener("click", e => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left, y = e.clientY - rect.top;
  const { row, col } = getCell(x, y);
  if (row >= 0 && row < ROWS && col >= 0 && col < COLS) {
    grid[row][col].penWidth = Math.min(grid[row][col].penWidth + 1, PEN_MAX);
    drawGrid();
  }
});

canvas.addEventListener("contextmenu", e => {
  e.preventDefault();
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left, y = e.clientY - rect.top;
  const { row, col } = getCell(x, y);
  if (row >= 0 && row < ROWS && col >= 0 && col < COLS) {
    grid[row][col].penWidth = Math.max(grid[row][col].penWidth - 1, 0);
    drawGrid();
  }
});

canvas.addEventListener("wheel", e => {
  e.preventDefault();
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left, y = e.clientY - rect.top;
  const { row, col } = getCell(x, y);
  if (row >= 0 && row < ROWS && col >= 0 && col < COLS) {
    let cell = grid[row][col];
    cell.armLength += e.deltaY < 0 ? 1 : -1;
    cell.armLength = Math.max(ARM_MIN, Math.min(ARM_MAX, cell.armLength));
    drawGrid();
  }
}, { passive: false });

const colWidthSlider = document.getElementById("colWidthSlider");
const colLengthSlider = document.getElementById("colLengthSlider");
const rowWidthSlider = document.getElementById("rowWidthSlider");
const rowLengthSlider = document.getElementById("rowLengthSlider");

function applyAllDistributions() {
  const rowLengthFactor = (100 - parseInt(rowLengthSlider.value)) / 100;
  const rowWidthFactor  = (100 - parseInt(rowWidthSlider.value)) / 100;
  const colLengthFactor = parseInt(colLengthSlider.value) / 100;
  const colWidthFactor  = parseInt(colWidthSlider.value) / 100;

  for (let r = 0; r < ROWS; r++) {
    const rowLInterp = rowLengthFactor * (1 - r / (ROWS - 1)) + (1 - rowLengthFactor) * (r / (ROWS - 1));
    const rowWInterp = rowWidthFactor * (1 - r / (ROWS - 1)) + (1 - rowWidthFactor) * (r / (ROWS - 1));
    for (let c = 0; c < COLS; c++) {
     const colLInterp = colLengthFactor * (c / (COLS - 1)) + (1 - colLengthFactor) * (1 - c / (COLS - 1));
    const colWInterp = colWidthFactor * (c / (COLS - 1)) + (1 - colWidthFactor) * (1 - c / (COLS - 1));

      const armMix = rowLInterp * colLInterp;
      const penMix = rowWInterp * colWInterp;

      grid[r][c].armLength = ARM_MIN + armMix * (ARM_MAX - ARM_MIN);
      grid[r][c].penWidth  = PEN_MIN + penMix * (PEN_MAX - PEN_MIN);
    }
  }

  drawGrid();
}

rowLengthSlider.addEventListener("input", applyAllDistributions);
rowWidthSlider.addEventListener("input", applyAllDistributions);
colLengthSlider.addEventListener("input", applyAllDistributions);
colWidthSlider.addEventListener("input", applyAllDistributions);

applyAllDistributions();