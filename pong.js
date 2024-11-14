const { body } = document;
const canvas = document.createElement('canvas');
const context = canvas.getContext('2d');
const width = 500;
const height = 700;
const screenWidth = window.screen.width;
const canvasPosition = screenWidth / 2 - width / 2;
const mobileQuery = window.matchMedia('(max-width: 600px)');
const gameOverElement = document.createElement('div');

// Bar Properties
const barHeight = 10;
const barWidth = 50;
const barOffset = 25;
let barBottomX = 225;
let barTopX = 225;
let playerMoved = false;
let barContact = false;

// Ball Properties
let ballX = 250;
let ballY = 350;
const ballRadius = 5;

// Game Speed
let speedY;
let speedX;
let trajectoryX;
let aiSpeed;

// Detect Mobile Settings
if (mobileQuery.matches) {
  speedY = -2;
  speedX = speedY;
  aiSpeed = 3;
} else {
  speedY = -1;
  speedX = speedY;
  aiSpeed = 3;
}

// Score
let playerScore = 0;
let aiScore = 0;
const scoreToWin = 10;
let isGameOver = true;
let isNewGame = true;

// Render the game background and elements
function renderBackground() {
  // Background color
  context.fillStyle = 'black';
  context.fillRect(0, 0, width, height);

  // Bars color and player bar
  context.fillStyle = 'white';
  context.fillRect(barBottomX, height - 20, barWidth, barHeight);

  // AI Bar
  context.fillRect(barTopX, 10, barWidth, barHeight);

  // Center line
  context.beginPath();
  context.setLineDash([4]);
  context.moveTo(0, 350);
  context.lineTo(500, 350);
  context.strokeStyle = 'grey';
  context.stroke();

  // Ball
  context.beginPath();
  context.arc(ballX, ballY, ballRadius, 2 * Math.PI, false);
  context.fillStyle = 'white';
  context.fill();

  // Score display
  context.font = '32px Courier New';
  context.fillText(playerScore, 20, canvas.height / 2 + 50);
  context.fillText(aiScore, 20, canvas.height / 2 - 30);
}

function setupCanvas() {
  canvas.width = width;
  canvas.height = height;
  body.appendChild(canvas);
  renderBackground();
}

// Reset the ball to the center
function resetBall() {
  ballX = width / 2;
  ballY = height / 2;
  speedY = -3;
  barContact = false;
}

// Update ball position and movement
function moveBall() {
  ballY += -speedY;
  if (playerMoved && barContact) {
    ballX += speedX;
  }
}

// Ball collision detection and bouncing
function handleBallBounce() {
  if (ballX < 0 && speedX < 0 || ballX > width && speedX > 0) {
    speedX = -speedX;
  }

  if (ballY > height - barOffset) {
    if (ballX > barBottomX && ballX < barBottomX + barWidth) {
      barContact = true;
      speedY = adjustSpeed(speedY);
      speedY = -speedY;
      trajectoryX = ballX - (barBottomX + barOffset);
      speedX = trajectoryX * 0.3;
    } else if (ballY > height) {
      resetBall();
      aiScore++;
    }
  }

  if (ballY < barOffset) {
    if (ballX > barTopX && ballX < barTopX + barWidth) {
      speedY = adjustSpeed(speedY);
      speedY = -speedY;
    } else if (ballY < 0) {
      resetBall();
      playerScore++;
    }
  }
}

// Adjust speed with a maximum limit
function adjustSpeed(currentSpeed) {
  if (playerMoved) {
    currentSpeed += currentSpeed < 0 ? -1 : 1;
    return Math.min(Math.max(currentSpeed, -5), 5);
  }
  return currentSpeed;
}

// AI movement logic
function moveAI() {
  if (playerMoved) {
    barTopX += (barTopX + barOffset < ballX) ? aiSpeed : -aiSpeed;
  }
}

// Show game over screen
function showGameOver(winner) {
  canvas.hidden = true;
  gameOverElement.textContent = '';
  gameOverElement.classList.add('game-over-container');

  const title = document.createElement('h1');
  title.textContent = `${winner} Wins!`;

  const playAgainBtn = document.createElement('button');
  playAgainBtn.onclick = startGame;
  playAgainBtn.textContent = 'Play Again';

  gameOverElement.append(title, playAgainBtn);
  body.appendChild(gameOverElement);
}

// Check if game is over
function checkGameOver() {
  if (playerScore === scoreToWin || aiScore === scoreToWin) {
    isGameOver = true;
    const winner = playerScore === scoreToWin ? 'Player 1' : 'Computer';
    showGameOver(winner);
  }
}

// Main game loop
function animate() {
  renderBackground();
  moveBall();
  handleBallBounce();
  moveAI();
  checkGameOver();
  if (!isGameOver) {
    window.requestAnimationFrame(animate);
  }
}

// Start game
function startGame() {
  if (isGameOver && !isNewGame) {
    body.removeChild(gameOverElement);
    canvas.hidden = false;
  }
  isGameOver = false;
  isNewGame = false;
  playerScore = 0;
  aiScore = 0;
  resetBall();
  setupCanvas();
  animate();

  canvas.addEventListener('mousemove', (e) => {
    playerMoved = true;
    barBottomX = e.clientX - canvasPosition - barOffset;
    barBottomX = Math.max(0, Math.min(barBottomX, width - barWidth));
    canvas.style.cursor = 'none';
  });
}

// On load
startGame();