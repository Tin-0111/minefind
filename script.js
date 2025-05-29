const boardElement = document.getElementById('board');
const messageElement = document.getElementById('message');
const resetButton = document.getElementById('reset-button');
const gridSize = 10;
const mineCount = 15;
let board = [];
let revealedCount = 0;
let gameover = false;

function createBoard() {
    board = Array(gridSize).fill(null).map(() => Array(gridSize).fill(null));
    placeMines();
    calculateNeighboringMines();
    renderBoard();
    revealedCount = 0;
    gameover = false;
    messageElement.textContent = '';
}

function placeMines() {
    let minesPlaced = 0;
    while (minesPlaced < mineCount) {
        const row = Math.floor(Math.random() * gridSize);
        const col = Math.floor(Math.random() * gridSize);
        if (!board[row][col]) {
            board[row][col] = { isMine: true };
            minesPlaced++;
        }
    }
}

function calculateNeighboringMines() {
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            if (!board[i][j]?.isMine) {
                let count = 0;
                for (let x = -1; x <= 1; x++) {
                    for (let y = -1; y <= 1; y++) {
                        if (x === 0 && y === 0) continue;
                        const ni = i + x;
                        const nj = j + y;
                        if (ni >= 0 && ni < gridSize && nj >= 0 && nj < gridSize && board[ni][nj]?.isMine) {
                            count++;
                        }
                    }
                }
                board[i][j] = { neighboringMines: count };
            }
        }
    }
}

function renderBoard() {
    boardElement.innerHTML = '';
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.row = i;
            cell.dataset.col = j;
            cell.addEventListener('click', handleCellClick);
            cell.addEventListener('contextmenu', handleCellRightClick); // 오른쪽 클릭 이벤트
            boardElement.appendChild(cell);
        }
    }
}

function handleCellClick(event) {
    if (gameover) return;
    const cellElement = event.target;
    const row = parseInt(cellElement.dataset.row);
    const col = parseInt(cellElement.dataset.col);

    if (board[row][col].isFlagged) return; // 깃발이 꽂혀있으면 클릭 무시

    revealCell(row, col);
}

function handleCellRightClick(event) {
    event.preventDefault(); // 기본 컨텍스트 메뉴 방지
    if (gameover) return;
    const cellElement = event.target;
    const row = parseInt(cellElement.dataset.row);
    const col = parseInt(cellElement.dataset.col);
    const cellData = board[row][col];

    if (!cellElement.classList.contains('revealed')) {
        cellData.isFlagged = !cellData.isFlagged;
        renderCell(cellElement, cellData);
    }
}

function revealCell(row, col) {
    if (row < 0 || row >= gridSize || col < 0 || col >= gridSize || board[row][col]?.isRevealed) {
        return;
    }

    const cellData = board[row][col];
    const cellElement = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);

    cellData.isRevealed = true;
    cellElement.classList.add('revealed');

    if (cellData.isMine) {
        cellElement.classList.add('mine');
        cellElement.textContent = '💣';
        gameOver();
        return;
    }

    if (cellData.neighboringMines > 0) {
        cellElement.textContent = cellData.neighboringMines;
    } else {
        // 주변 빈 칸 연쇄적으로 열기
        for (let x = -1; x <= 1; x++) {
            for (let y = -1; y <= 1; y++) {
                revealCell(row + x, col + y);
            }
        }
    }

    revealedCount++;
    if (revealedCount === gridSize * gridSize - mineCount) {
        gameWin();
    }
}

function renderCell(cellElement, cellData) {
    cellElement.classList.remove('flagged');
    if (cellData.isFlagged) {
        cellElement.classList.add('flagged');
        cellElement.textContent = '🚩';
    } else if (cellData.isRevealed) {
        cellElement.textContent = cellData.isMine ? '💣' : (cellData.neighboringMines > 0 ? cellData.neighboringMines : '');
        if (cellData.isMine) {
            cellElement.classList.add('mine');
        }
    } else {
        cellElement.textContent = '';
    }
}

function gameOver() {
    gameover = true;
    messageElement.textContent = '게임 오버! 지뢰를 밟았습니다.';
    revealAllMines();
}

function gameWin() {
    gameover = true;
    messageElement.textContent = '축하합니다! 모든 지뢰를 찾았습니다.';
}

function revealAllMines() {
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            if (board[i][j]?.isMine) {
                const cellElement = document.querySelector(`.cell[data-row="${i}"][data-col="${j}"]`);
                cellElement.classList.add('mine');
                cellElement.textContent = '💣';
            }
        }
    }
}

resetButton.addEventListener('click', createBoard);

createBoard();
