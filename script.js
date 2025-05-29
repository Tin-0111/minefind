const boardElement = document.getElementById('board');
const messageElement = document.getElementById('message');
const resetButton = document.getElementById('reset-button');
const timerElement = document.getElementById('timer');
const minesLeftElement = document.getElementById('mines-left');
const gridSize = 10;
const initialMineCount = 15; // 초기 지뢰 개수를 저장
let mineCount = initialMineCount;
let board = [];
let revealedCount = 0;
let gameover = false;
let timerInterval;
let startTime;

function createBoard() {
    board = Array(gridSize).fill(null).map(() => Array(gridSize).fill(null));
    placeMines();
    calculateNeighboringMines();
    renderBoard();
    revealedCount = 0;
    gameover = false;
    messageElement.textContent = '';
    mineCount = initialMineCount; // 게임 시작 시 남은 지뢰 수 초기화
    minesLeftElement.textContent = mineCount;
    resetTimer();
    startTimer();
}

function placeMines() {
    let minesPlaced = 0;
    while (minesPlaced < initialMineCount) {
        const row = Math.floor(Math.random() * gridSize);
        const col = Math.floor(Math.random() * gridSize);
        // 모서리에는 지뢰를 배치하지 않음
        if (!((row === 0 && col === 0) || (row === 0 && col === gridSize - 1) ||
              (row === gridSize - 1 && col === 0) || (row === gridSize - 1 && col === gridSize - 1)) &&
            !board[row][col]) {
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
            renderCell(cell, board[i][j]); // 초기 렌더링 시 깃발 상태 반영
            boardElement.appendChild(cell);
        }
    }
    minesLeftElement.textContent = mineCount; // 초기 남은 지뢰 수 표시
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
        updateMinesLeft();
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
    if (revealedCount === gridSize * gridSize - initialMineCount) {
        gameWin();
    }
}

function renderCell(cellElement, cellData) {
    cellElement.classList.remove('flagged');
    if (cellData?.isFlagged) {
        cellElement.classList.add('flagged');
        cellElement.textContent = '🚩';
    } else if (cellData?.isRevealed) {
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
    stopTimer();
}

function gameWin() {
    gameover = true;
    messageElement.textContent = '축하합니다! 모든 지뢰를 찾았습니다.';
    stopTimer();
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

function startTimer() {
    startTime = Date.now();
    timerInterval = setInterval(() => {
        const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
        timerElement.textContent = elapsedTime;
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
}

function resetTimer() {
    clearInterval(timerInterval);
    timerElement.textContent = 0;
}

function updateMinesLeft() {
    const flaggedCount = board.flat().filter(cell => cell?.isFlagged).length;
    minesLeftElement.textContent = initialMineCount - flaggedCount;
}

resetButton.addEventListener('click', createBoard);

createBoard();
