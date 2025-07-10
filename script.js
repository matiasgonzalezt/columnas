const canvas = document.getElementById('gridCanvas');
const ctx = canvas.getContext('2d');

const ROWS = 7;
const COLS = 7;
const CELL_SIZE = 80;

const ARM_LENGTHS = [5, 10, 15, 25, 40]; // 6 niveles
const PEN_WIDTHS = [0, 2, 5, 10, 15, 25];    // 7 niveles

// Estado por cada celda
const grid = [];
for(let r=0; r<ROWS; r++) {
  grid[r] = [];
  for(let c=0; c<COLS; c++) {
    grid[r][c] = {
      armIndex: 2,      // longitud brazo (empieza en 15)
      penWidthIndex: 1  // grosor (empieza en 2)
    };
  }
}

function drawCross(x, y, armLength, penWidth) {
  if(penWidth === 0) return; // invisible

  ctx.lineWidth = penWidth;
  ctx.strokeStyle = 'black';
  ctx.beginPath();

  // horizontal
  ctx.moveTo(x - armLength, y);
  ctx.lineTo(x + armLength, y);

  // vertical
  ctx.moveTo(x, y - armLength);
  ctx.lineTo(x, y + armLength);

  ctx.stroke();
}

function drawGrid() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for(let r=0; r<ROWS; r++) {
    for(let c=0; c<COLS; c++) {
      const cell = grid[r][c];
      const centerX = c*CELL_SIZE + CELL_SIZE/2;
      const centerY = r*CELL_SIZE + CELL_SIZE/2;
      const armLength = ARM_LENGTHS[cell.armIndex];
      const penWidth = PEN_WIDTHS[cell.penWidthIndex];
      drawCross(centerX, centerY, armLength, penWidth);
    }
  }
}

drawGrid();

// Convertir pixel a celda
function getCellFromCoords(x, y) {
  const col = Math.floor(x / CELL_SIZE);
  const row = Math.floor(y / CELL_SIZE);
  if(row < 0 || row >= ROWS || col < 0 || col >= COLS) return null;
  return {row, col};
}

// Manejar clicks y scroll
canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const cell = getCellFromCoords(x, y);
  if(!cell) return;

  const {row, col} = cell;
  // Click izquierdo aumenta grosor
  grid[row][col].penWidthIndex = Math.min(grid[row][col].penWidthIndex + 1, PEN_WIDTHS.length -1);
  drawGrid();
});

canvas.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const cell = getCellFromCoords(x, y);
  if(!cell) return;

  const {row, col} = cell;
  // Click derecho disminuye grosor
  grid[row][col].penWidthIndex = Math.max(grid[row][col].penWidthIndex - 1, 0);
  drawGrid();
});

// Scroll para cambiar longitud brazo
canvas.addEventListener('wheel', (e) => {
  e.preventDefault();
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const cell = getCellFromCoords(x, y);
  if(!cell) return;

  const {row, col} = cell;

  if(e.deltaY < 0) { // scrollea arriba: aumentar longitud
    grid[row][col].armIndex = Math.min(grid[row][col].armIndex + 1, ARM_LENGTHS.length -1);
  } else {           // scrollea abajo: disminuir longitud
    grid[row][col].armIndex = Math.max(grid[row][col].armIndex - 1, 0);
  }
  drawGrid();
});
