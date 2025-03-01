// Глобальные переменные
const grid = 32;
let score = 0;
let timeLeft = 90;
let isPlaying = false;
let gameOver = true;
let rAF = null;
let timerInterval = null;
const playfield = [];
const colors = { 'I': 'cyan', 'O': 'yellow', 'T': 'purple', 'S': 'green', 'Z': 'red', 'J': 'blue', 'L': 'orange' };
const tetrominos = {
  'I': [[0,0,0,0], [1,1,1,1], [0,0,0,0], [0,0,0,0]],
  'J': [[1,0,0], [1,1,1], [0,0,0]],
  'L': [[0,0,1], [1,1,1], [0,0,0]],
  'O': [[1,1], [1,1]],
  'S': [[0,1,1], [1,1,0], [0,0,0]],
  'Z': [[1,1,0], [0,1,1], [0,0,0]],
  'T': [[0,1,0], [1,1,1], [0,0,0]]
};
let tetromino = null;
let count = 0;

// Получение элементов DOM с проверкой
let canvas = null;
let context = null;
try {
    canvas = document.getElementById('game');
    if (!canvas) throw new Error('Canvas element not found');
    context = canvas.getContext('2d');
    if (!context) throw new Error('2D context not available');
    console.log("Canvas and context initialized successfully");
} catch (e) {
    console.error("Error initializing canvas:", e);
}

// Track game state for ZKP
let gameState = { moves: [], finalScore: 0, finalTime: 0 };

// Функция начального экрана
function showStartScreen() {
    if (!context || !canvas) {
        console.error("Canvas or context not available for showStartScreen");
        return;
    }
    console.log("Showing start screen");
    context.fillStyle = 'black';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = 'deeppink';
    context.font = '50px Arial';
    context.textAlign = 'center';
    context.fillText('START', canvas.width / 2, 300);
    context.font = '30px Arial';
    context.fillText('PRESS SPACE', canvas.width / 2, 340);
    context.textAlign = 'left';
    if (!gameOver) return;
    rAF = requestAnimationFrame(showStartScreen);
}

// Обработчик клавиш
document.addEventListener('keydown', function(e) {
    if (gameOver && e.key === ' ') {
        startGame();
        return;
    }
    if (gameOver || !isPlaying) return;
    let move = { type: e.key, score: score, time: timeLeft };
    console.log("Key pressed:", e.key, "Move:", move, "Current gameState:", JSON.stringify(gameState, null, 2));
    switch(e.key) {
        case 'ArrowLeft':
            if (isValidMove(tetromino.matrix, tetromino.row, tetromino.col - 1)) {
                tetromino.col--;
                gameState.moves.push(move);
                console.log("Updated gameState after move:", JSON.stringify(gameState, null, 2));
            }
            break;
        case 'ArrowRight':
            if (isValidMove(tetromino.matrix, tetromino.row, tetromino.col + 1)) {
                tetromino.col++;
                gameState.moves.push(move);
                console.log("Updated gameState after move:", JSON.stringify(gameState, null, 2));
            }
            break;
        case 'ArrowDown':
            if (isValidMove(tetromino.matrix, tetromino.row + 1, tetromino.col)) {
                tetromino.row++;
                score += 1;
                updateScoreboard();
                gameState.moves.push(move);
                console.log("Updated gameState after move:", JSON.stringify(gameState, null, 2));
            }
            break;
        case 'ArrowUp':
            const rotated = rotateMatrix(tetromino.matrix);
            if (isValidMove(rotated, tetromino.row, tetromino.col)) {
                tetromino.matrix = rotated;
                gameState.moves.push(move);
                console.log("Updated gameState after move:", JSON.stringify(gameState, null, 2));
            }
            break;
    }
    console.log("Final gameState after key press:", JSON.stringify(gameState, null, 2));
});

// Функция старта игры
function startGame() {
    if (!gameOver) return;
    if (!context || !canvas) {
        console.error("Canvas or context not available for startGame");
        return;
    }
    isPlaying = true;
    gameOver = false;
    score = 0;
    timeLeft = 90;
    gameState = { moves: [], finalScore: 0, finalTime: 0 }; // Reset game state
    console.log("Starting game, initial gameState:", JSON.stringify(gameState, null, 2));
    context.clearRect(0, 0, canvas.width, canvas.height);
    playfield.length = 0;
    for (let row = -2; row < 20; row++) {
        playfield[row] = [];
        for (let col = 0; col < 10; col++) {
            playfield[row][col] = 0;
        }
    }
    tetromino = getNextTetromino();
    updateScoreboard();
    rAF = requestAnimationFrame(loop);
    timerInterval = setInterval(updateTimer, 1000);
    console.log("Game started, timerInterval:", timerInterval);
}

// Функция обновления таймера
function updateTimer() {
    console.log("Timer tick, timeLeft:", timeLeft, "isPlaying:", isPlaying);
    if (timeLeft > 0 && isPlaying) {
        timeLeft--;
        updateScoreboard();
    } else if (isPlaying) {
        console.log("Time is up, calling showTimeUp()");
        showTimeUp();
    }
    console.log("GameState after timer tick:", JSON.stringify(gameState, null, 2));
}

// Функция получения следующего тетромино
function getNextTetromino() {
    const names = Object.keys(tetrominos);
    const name = names[Math.floor(Math.random() * names.length)];
    console.log("Generating new tetromino:", name);
    return { name, matrix: tetrominos[name], row: -2, col: Math.floor((10 - tetrominos[name][0].length) / 2) };
}

// Функция обновления счета и времени
function updateScoreboard() {
    if (!context || !canvas) {
        console.error("Canvas or context not available for updateScoreboard");
        return;
    }
    console.log("Updating scoreboard, score:", score, "timeLeft:", timeLeft);
    context.fillStyle = 'black';
    context.fillRect(0, 0, canvas.width, 40);
    context.fillStyle = 'deeppink';
    context.font = '24px Arial';
    context.textAlign = 'left';
    context.fillText(`Score: ${score}`, 10, 30);
    context.textAlign = 'right';
    context.fillText(`Time: ${timeLeft}`, 310, 30);
    context.textAlign = 'left';
}

// Функция отображения Game Over
function showGameOver() {
    if (!context || !canvas) {
        console.error("Canvas or context not available for showGameOver");
        return;
    }
    cancelAnimationFrame(rAF);
    clearInterval(timerInterval);
    gameOver = true;
    isPlaying = false;
    gameState.finalScore = score;
    gameState.finalTime = timeLeft;
    console.log("Showing Game Over, gameState:", JSON.stringify(gameState, null, 2));
    // Проверяем, определена ли generateProof, чтобы избежать ошибки
    if (typeof generateProof === 'function') {
        generateProof(); // Вызов функции генерации доказательства
    } else {
        console.error("generateProof is not defined, cannot generate proof");
        document.getElementById('proof').innerText = "Error: generateProof is not defined";
    }
    context.fillStyle = 'black';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = 'deeppink';
    context.font = '50px Arial';
    context.textAlign = 'center';
    context.fillText('GAME OVER', canvas.width / 2, 320);
    context.font = '30px Arial';
    context.fillText('PRESS SPACE', canvas.width / 2, 360);
    context.textAlign = 'left';
    console.log("GameState after Game Over:", JSON.stringify(gameState, null, 2));
}

// Функция отображения Time Up
function showTimeUp() {
    if (!context || !canvas) {
        console.error("Canvas or context not available for showTimeUp");
        return;
    }
    cancelAnimationFrame(rAF);
    clearInterval(timerInterval);
    gameOver = true;
    isPlaying = false;
    gameState.finalScore = score;
    gameState.finalTime = timeLeft;
    console.log("Showing Time Up, gameState:", JSON.stringify(gameState, null, 2));
    // Проверяем, определена ли generateProof, чтобы избежать ошибки
    if (typeof generateProof === 'function') {
        generateProof(); // Вызов функции генерации доказательства
    } else {
        console.error("generateProof is not defined, cannot generate proof");
        document.getElementById('proof').innerText = "Error: generateProof is not defined";
    }
    context.fillStyle = 'black';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = 'deeppink';
    context.font = '50px Arial';
    context.textAlign = 'center';
    context.fillText(`Score: ${score}`, canvas.width / 2, 280);
    context.fillText('PLAY AGAIN', canvas.width / 2, 340);
    context.font = '30px Arial';
    context.fillText('PRESS SPACE', canvas.width / 2, 380);
    context.textAlign = 'left';
    console.log("GameState after Time Up:", JSON.stringify(gameState, null, 2));
}

// Функция поворота матрицы
function rotateMatrix(matrix) {
    const n = matrix.length;
    const rotated = matrix.map(row => [...row]);
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            rotated[i][j] = matrix[n - 1 - j][i];
        }
    }
    console.log("Rotated matrix:", rotated);
    return rotated;
}

// Функция проверки валидности хода
function isValidMove(matrix, cellRow, cellCol) {
    console.log("Checking move, matrix:", matrix, "cellRow:", cellRow, "cellCol:", cellCol);
    for (let row = 0; row < matrix.length; row++) {
        for (let col = 0; col < matrix[row].length; col++) {
            if (matrix[row][col]) {
                const newRow = cellRow + row;
                const newCol = cellCol + col;
                if (newCol < 0 || newCol >= 10 || newRow >= 20 || (newRow >= 0 && playfield[newRow][newCol])) {
                    console.log("Move invalid at newRow:", newRow, "newCol:", newCol);
                    return false;
                }
            }
        }
    }
    return true;
}

// Главный игровой цикл
function loop() {
    if (!isPlaying) {
        console.log("Game not playing, stopping loop");
        return;
    }
    console.log("Loop running, count:", count, "tetromino row:", tetromino.row, "tetromino col:", tetromino.col, "playfield[2]:", playfield[2]);
    if (!context || !canvas) {
        console.error("Canvas or context not available for loop");
        return;
    }
    context.clearRect(0, 0, canvas.width, canvas.height);
    updateScoreboard();
    for (let row = 0; row < 20; row++) {
        for (let col = 0; col < 10; col++) {
            if (playfield[row][col]) {
                context.fillStyle = colors[playfield[row][col]];
                context.fillRect(col * grid, row * grid, grid - 1, grid - 1);
            }
        }
    }
    if (++count > 8) {
        console.log("Checking game over condition, playfield[2]:", playfield[2]);
        for (let col = 0; col < 10; col++) {
            if (playfield[2][col] !== 0) {
                console.log("Game over due to tetromino at row 2, col:", col, "value:", playfield[2][col]);
                showGameOver();
                return;
            }
        }
        if (isValidMove(tetromino.matrix, tetromino.row + 1, tetromino.col)) {
            tetromino.row++;
        } else {
            placeTetromino();
            checkLines();
            tetromino = getNextTetromino();
            if (!isValidMove(tetromino.matrix, tetromino.row, tetromino.col)) {
                console.log("Game over due to invalid next tetromino, row:", tetromino.row, "col:", tetromino.col);
                showGameOver();
                return;
            }
        }
        count = 0;
    }
    drawTetromino();
    rAF = requestAnimationFrame(loop);
    console.log("GameState after loop:", JSON.stringify(gameState, null, 2));
}

// Функция отрисовки тетромино
function drawTetromino() {
    if (!context || !canvas) {
        console.error("Canvas or context not available for drawTetromino");
        return;
    }
    console.log("Drawing tetromino:", tetromino.name, "at row:", tetromino.row, "col:", tetromino.col);
    context.fillStyle = colors[tetromino.name];
    for (let row = 0; row < tetromino.matrix.length; row++) {
        for (let col = 0; col < tetromino.matrix[row].length; col++) {
            if (tetromino.matrix[row][col] && tetromino.row + row >= 0) {
                context.fillRect((tetromino.col + col) * grid, (tetromino.row + row) * grid, grid - 1, grid - 1);
            }
        }
    }
    console.log("GameState after drawing:", JSON.stringify(gameState, null, 2));
}

// Функция размещения тетромино
function placeTetromino() {
    if (!tetromino) {
        console.error("No tetromino to place");
        return;
    }
    console.log("Placing tetromino at row:", tetromino.row, "col:", tetromino.col);
    for (let row = 0; row < tetromino.matrix.length; row++) {
        for (let col = 0; col < tetromino.matrix[row].length; col++) {
            if (tetromino.matrix[row][col] && tetromino.row + row >= 0) {
                playfield[tetromino.row + row][tetromino.col + col] = tetromino.name;
                console.log("Placed at playfield[", tetromino.row + row, "][", tetromino.col + col, "] = ", tetromino.name);
            }
        }
    }
    console.log("GameState after placing:", JSON.stringify(gameState, null, 2));
}

// Функция проверки линий
function checkLines() {
    console.log("Checking lines, current score:", score);
    let linesCleared = 0;
    for (let row = 19; row >= 0; row--) {
        if (playfield[row].every(cell => cell !== 0)) {
            linesCleared++;
            playfield.splice(row, 1);
            playfield.unshift(Array(10).fill(0));
            console.log("Line cleared at row:", row);
            row++; // Повторить проверку текущей строки после сдвига
        }
    }
    if (linesCleared > 0) {
        score += linesCleared * 20;
        updateScoreboard();
        console.log("Lines cleared:", linesCleared, "New score:", score);
    }
    console.log("GameState after checking lines:", JSON.stringify(gameState, null, 2));
}

// Вызов начального экрана при загрузке
if (context && canvas) {
    showStartScreen();
} else {
    console.error("Cannot show start screen, canvas or context not available");
}