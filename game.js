const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

let interval = 0;

const ballRadius = 10;

let x = canvas.width / 2;
let y = canvas.height - 30;

let dx = 2;
let dy = -2;
let ballSpeedMod = 0.5;
const friction = 0.01;

let paddleSpeed = 5;

const paddleHeight = 10;
const paddleWidth = 75;

let rightPressed = false;
let leftPressed = false;

let paddleX = (canvas.width - paddleWidth) / 2;

const brickRowCount = 3;
const brickColumnCount = 5;
const brickWidth = 75;
const brickHeight = 20;
const brickPadding = 10;
const brickOffsetTop = 30;
const brickOffsetLeft = 30;

let score = 0;

const bricks = [];

for (let c = 0; c < brickColumnCount; c++) {
  bricks[c] = [];
  for (let r = 0; r < brickRowCount; r++) {
    bricks[c][r] = { x: 0, y: 0, status: 1 };
  }
}

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

function keyDownHandler(e) {
  if (e.key === "Right" || e.key === "ArrowRight") {
    rightPressed = true;
  } else if (e.key === "Left" || e.key === "ArrowLeft") {
    leftPressed = true;
  }
}

function keyUpHandler(e) {
  if (e.key === "Right" || e.key === "ArrowRight") {
    rightPressed = false;
  } else if (e.key === "Left" || e.key === "ArrowLeft") {
    leftPressed = false;
  }
}

document.addEventListener("mousemove", mouseMoveHandler, false);

function mouseMoveHandler(e){
  const relativeX = e.clientX - canvas.offsetLeft;
  if(relativeX > 0 && relativeX < canvas.width){
    paddleX = relativeX - paddleWidth / 2;
  }
}

function collisionDetection() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      const b = bricks[c][r];
      // calculations
      if (b.status === 1) {
        if (
          x > b.x &&
          x < b.x + brickWidth &&
          y > b.y &&
          y < b.y + brickHeight
        ) {
          dy = -dy;
          b.status = 0;
          score++;
          if(score === brickRowCount * brickColumnCount){
            alert("YOU WIN, CONGRATULATIONS!");
            document.location.reload();
            clearInterval(interval);
          }
        }
      }
    }
  }
}

function drawScore(){
  ctx.font = "16px Arial";
  ctx.fillStyle = "#0095DD";
  ctx.fillText(`Score: ${score}`, 8, 20);
}

function getRandomHexColor() {
  let color;
  do {
    color =
      "#" +
      Math.floor(Math.random() * 16777215)
        .toString(16)
        .padStart(6, "0");
  } while (getLuminance(color) > 0.8); // Ensuring contrast against white
  return color;
}

function getLuminance(hex) {
  const r = parseInt(hex.substr(1, 2), 16) / 255;
  const g = parseInt(hex.substr(3, 2), 16) / 255;
  const b = parseInt(hex.substr(5, 2), 16) / 255;
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

let ballColor = "#0095DD";

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

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBricks();
  drawBall(ballColor);
  drawPaddle();
  drawScore();
  collisionDetection();
  ballSpeedMod -= ballSpeedMod > 0 ? friction : 0;

  if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
    dx = -dx;
    ballColor = getRandomHexColor();
  }

  if (y + dy < ballRadius) {
    dy = -dy;
    ballColor = getRandomHexColor();
  } else if (y + dy > canvas.height - ballRadius - paddleHeight / 2) {
    if (x > paddleX && x < paddleX + paddleWidth) {
      ballSpeedMod = 1.5;
      dy = -dy;
    } else {
      alert("GAME OVER");
      document.location.reload();
      clearInterval(interval);
    }
  }

  if (y + dy > canvas.height - ballRadius || y + dy < ballRadius) {
    dy = -dy;
    ballColor = getRandomHexColor();
  }

  if (rightPressed) {
    paddleX = Math.min(paddleX + paddleSpeed, canvas.width - paddleWidth);
  } else if (leftPressed) {
    paddleX = Math.max(paddleX - paddleSpeed, 0);
  }
  x += dx;
  y += dy > 0 ? dy + ballSpeedMod : dy - ballSpeedMod;
}

function startGame() {
  interval = setInterval(draw, 10);
}

const startButton = document.getElementById("runButton");
startButton.addEventListener("click", function () {
  startGame();
  this.disabled = true;
});
