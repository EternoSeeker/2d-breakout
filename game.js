// Canvas setup
const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

// Game constants
const paddleHeight = 10;
const paddleWidth = 80;
const ballRadius = 10;
const brickRowCount = 3;
const brickColumnCount = 6;
const brickWidth = 75;
const brickHeight = 20;
const brickPadding = 15;
const brickOffsetTop = 30;
const brickOffsetLeft = 30;
const minBallSpeed = 2.5;
const maxBallSpeed = minBallSpeed * 1.8;
const paddleSpeed = 4;

// Game variables
let x = canvas.width / 2;
let y = canvas.height - paddleHeight - ballRadius;
let dx = 2.5;
let dy = 2.5;
let paddleX = (canvas.width - paddleWidth) / 2;
let rightPressed = false;
let leftPressed = false;
let lastPaddleX = paddleX;
let paddleVelocityX = 0;
let score = 0;
let lives = 3;
let gameState = 'idle';
let ballColor = "#0095DD";
let ballLocked = true;  // New variable to track if ball is locked to paddle

// Initialize bricks
const bricks = [];
for (let c = 0; c < brickColumnCount; c++) {
  bricks[c] = [];
  for (let r = 0; r < brickRowCount; r++) {
    bricks[c][r] = { x: 0, y: 0, status: 1 };
  }
}

// Event listeners
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
// document.addEventListener("mousemove", mouseMoveHandler, false);

function keyDownHandler(e) {
  if (e.key === "Right" || e.key === "ArrowRight") {
    rightPressed = true;
  } else if (e.key === "Left" || e.key === "ArrowLeft") {
    leftPressed = true;
  } else if (e.key === " " && ballLocked) {  // Spacebar handler
    launchBall();
  }
}

function keyUpHandler(e) {
  if (e.key === "Right" || e.key === "ArrowRight") {
    rightPressed = false;
  } else if (e.key === "Left" || e.key === "ArrowLeft") {
    leftPressed = false;
  }
}

// function mouseMoveHandler(e) {
//   const relativeX = e.clientX - canvas.offsetLeft;
//   if (relativeX > 0 && relativeX < canvas.width) {
//     paddleX = Math.min(Math.max(relativeX - paddleWidth / 2, 0), canvas.width - paddleWidth);
//   }
// }

function launchBall() {
  if (ballLocked && gameState === 'playing') {
    ballLocked = false;
    dy = -minBallSpeed;  // Move upward
    dx = 0;  // Start with vertical movement only
  }
}

function getRandomHexColor() {
  let color;
  do {
    color = "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0");
  } while (getLuminance(color) > 0.8);
  return color;
}

function getLuminance(hex) {
  const r = parseInt(hex.substr(1, 2), 16) / 255;
  const g = parseInt(hex.substr(3, 2), 16) / 255;
  const b = parseInt(hex.substr(5, 2), 16) / 255;
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

function drawBall(color = "#0095DD") {
  ctx.beginPath();
  ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.closePath();
}

function drawPaddle() {
  ctx.beginPath();
  ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
  ctx.fillStyle = "#0095DD";
  ctx.fill();
  ctx.closePath();
}

function drawBricks() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      if (bricks[c][r].status === 1) {
        const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
        const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
        bricks[c][r].x = brickX;
        bricks[c][r].y = brickY;
        ctx.beginPath();
        ctx.rect(brickX, brickY, brickWidth, brickHeight);
        ctx.fillStyle = "#0095DD";
        ctx.fill();
        ctx.closePath();
      }
    }
  }
}

function drawScore() {
  ctx.font = "16px Arial";
  ctx.fillStyle = "#0095DD";
  ctx.fillText(`Score: ${score}`, 8, 20);
}

function drawLives() {
  ctx.font = "16px Arial";
  ctx.fillStyle = "#0095DD";
  ctx.fillText(`Lives: ${lives}`, canvas.width - 65, 20);
}

function collisionDetection() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      const b = bricks[c][r];
      if (b.status === 1) {
        if (x + ballRadius > b.x && x - ballRadius < b.x + brickWidth &&
            y + ballRadius > b.y && y - ballRadius < b.y + brickHeight) {
          dy = -dy;
          b.status = 0;
          score++;
          if (score === brickRowCount * brickColumnCount) {
            gameState = 'won';
          }
          ballColor = getRandomHexColor();
        }
      }
    }
  }
}

function updatePaddleVelocity() {
  paddleVelocityX = paddleX - lastPaddleX;
  lastPaddleX = paddleX;
}

function calculateNewBallVelocity(hitPosition) {
  const maxAngle = Math.PI / 3;
  const angle = hitPosition * maxAngle;
  const currentSpeed = Math.sqrt(dx * dx + dy * dy);
  const paddleInfluence = paddleVelocityX * 0.2;
  let newSpeed = currentSpeed + Math.abs(paddleInfluence);
  newSpeed = Math.max(minBallSpeed, Math.min(maxBallSpeed, newSpeed));
  
  dx = newSpeed * Math.sin(angle) + paddleInfluence;
  dy = -newSpeed * Math.cos(angle);
  dx = Math.max(Math.min(dx, maxBallSpeed), -maxBallSpeed);
}

function showEndMessage() {
  setTimeout(() => {
    alert(gameState === "won" ? "YOU WIN, CONGRATULATIONS!" : "GAME OVER");
    document.location.reload();
  }, 500);
}

function renderElements() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBricks();
  drawBall(ballColor);
  drawPaddle();
  drawScore();
  drawLives();
}

function resetBall() {
  ballLocked = true;
  x = paddleX + paddleWidth / 2;
  y = canvas.height - paddleHeight - ballRadius;
  // dx = 0;
  // dy = 0;
}

function draw() {
  if (gameState === 'paused') return;
  
  renderElements();
  collisionDetection();
  updatePaddleVelocity();

  // Update ball position if locked to paddle
  if (ballLocked) {
    x = paddleX + paddleWidth / 2;
    y = canvas.height - paddleHeight - ballRadius;
  } else {
    // Normal ball physics
    if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
      dx = -dx;
      ballColor = getRandomHexColor();
    }

    if (y + dy < ballRadius) {
      dy = -dy;
      ballColor = getRandomHexColor();
    } else if (y + dy > canvas.height - ballRadius - paddleHeight) {
      const ballLeft = x - ballRadius / 2;
      const ballRight = x + ballRadius / 2;

      if (ballRight > paddleX && ballLeft < paddleX + paddleWidth) {
        const contactPoint = Math.max(ballLeft, Math.min(x, ballRight));
        const hitPosition = (contactPoint - (paddleX + paddleWidth / 2)) / (paddleWidth / 2);
        calculateNewBallVelocity(hitPosition);
        y = canvas.height - paddleHeight - ballRadius;
        ballColor = getRandomHexColor();
      } else {
        lives--;
        if (!lives) {
          gameState = 'lost';
        } else {
          resetBall();
        }
      }
    }

    x += dx;
    y += dy;
  }

  // Paddle movement
  if (rightPressed) {
    paddleX = Math.min(paddleX + paddleSpeed, canvas.width - paddleWidth);
  } else if (leftPressed) {
    paddleX = Math.max(paddleX - paddleSpeed, 0);
  }

  if (gameState === 'playing') {
    requestAnimationFrame(draw);
  } else if (gameState === 'won' || gameState === 'lost') {
    showEndMessage();
  }
}

// Initialize game
gameState = 'playing';
// resetBall();
draw();