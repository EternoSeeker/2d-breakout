const GameConfig = {
  PADDLE: {
    HEIGHT: 15,
    WIDTH: 85,
    BORDER_RADIUS: 7,
    SPEED: 5,
    COLOR: "#00538f",
  },
  BALL: {
    RADIUS: 9,
    MIN_SPEED: 3,
    MAX_SPEED: 6,
    FRICTION: 0.01,
  },
  BRICK: {
    ROW_COUNT: 4,
    COLUMN_COUNT: 8,
    WIDTH: 60,
    HEIGHT: 15,
    PADDING: 10,
    OFFSET_TOP: 30,
    OFFSET_LEFT: 20,
    COLORS: ["0095dd", "1b63ab", "37327a", "520048"],
  },
};

class GameObject {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  draw(ctx) {}
}

class Ball extends GameObject {
  constructor(canvas) {
    super(
      canvas.width / 2,
      canvas.height - GameConfig.PADDLE.HEIGHT - GameConfig.BALL.RADIUS,
      GameConfig.BALL.RADIUS * 2,
      GameConfig.BALL.RADIUS * 2
    );

    this.canvas = canvas;
    this.radius = GameConfig.BALL.RADIUS;
    this.dx = GameConfig.BALL.MIN_SPEED;
    this.dy = GameConfig.BALL.MIN_SPEED;
    this.yDir = -1;
    this.color = "#0095DD";
    this.locked = true;
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.closePath();
  }

  launch() {
    if (this.locked) {
      this.locked = false;
      this.yDir = -1;
      this.dy = this.yDir * GameConfig.BALL.MIN_SPEED;
      this.dx = 0;
    }
  }

  reset(paddleX, paddleWidth) {
    this.locked = true;
    this.x = paddleX + paddleWidth / 2;
    this.y = this.canvas.height - GameConfig.PADDLE.HEIGHT - this.radius;
  }

  update(paddle) {
    if (this.locked) {
      this.x = paddle.x + paddle.width / 2;
      this.y = this.canvas.height - GameConfig.PADDLE.HEIGHT - this.radius;
      return;
    }

    // Apply Friction
    this.dy -=
      this.dy > GameConfig.BALL.MIN_SPEED ? GameConfig.BALL.FRICTION : 0;

    // Handle wall collision
    if (
      this.x + this.dx > this.canvas.width - this.radius ||
      this.x + this.dx < this.radius
    ) {
      this.dx = -this.dx;
      this.changeColor();
    }

    if (this.y + this.yDir * this.dy < this.radius) {
      this.yDir = -this.yDir;
      this.changeColor();
    }

    // Update position
    this.x += this.dx;
    this.y += this.yDir * this.dy;
  }

  changeColor() {
    const colors = [
      "03608e",
      "0383c1",
      "02a5f4",
      "34a0a4",
      "006078",
      "03979e",
      "488fda",
      "0e7c86",
      "023e8a",
      "0077b6",
      "0096c7",
      "00b4d8",
      "48cae4",
      "005f73",
      "0a9396",
    ];
    this.color = "#" + colors[Math.floor(Math.random() * colors.length)];
  }
}

class Paddle extends GameObject {
  constructor(canvas) {
    super(
      (canvas.width - GameConfig.PADDLE.WIDTH) / 2,
      canvas.height - GameConfig.PADDLE.HEIGHT,
      GameConfig.PADDLE.WIDTH,
      GameConfig.PADDLE.HEIGHT
    );

    this.canvas = canvas;
    this.speed = GameConfig.PADDLE.SPEED;
    this.lastX = this.x;
    this.velocityX = 0;
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.roundRect(
      this.x,
      this.y,
      this.width,
      this.height,
      GameConfig.PADDLE.BORDER_RADIUS
    );
    ctx.fillStyle = GameConfig.PADDLE.COLOR;
    ctx.fill();
    ctx.closePath();
  }

  move(direction) {
    const newX = this.x + direction * this.speed;
    this.x = Math.max(0, Math.min(newX, this.canvas.width - this.width));
  }

  updateVelocity() {
    this.velocityX = this.x - this.lastX;
    this.lastX = this.x;
  }

  handleCollision(ball) {
    const ballLeft = ball.x - ball.radius / 2;
    const ballRight = ball.x + ball.radius / 2;

    if (ballRight > this.x && ballLeft < this.x + this.width) {
      const contactPoint = Math.max(ballLeft, Math.min(ball.x, ballRight));
      const hitPosition =
        (contactPoint - (this.x + this.width / 2)) / (this.width / 2);

      // Calculate new ball velocity
      const maxAngle = Math.PI / 3;
      const angle = hitPosition * maxAngle;
      const currentSpeed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
      const paddleInfluence = this.velocityX * 0.2;

      let newSpeed = currentSpeed + Math.abs(paddleInfluence);
      newSpeed = Math.max(
        GameConfig.BALL.MIN_SPEED,
        Math.min(GameConfig.BALL.MAX_SPEED, newSpeed)
      );

      ball.dx = newSpeed * Math.sin(angle) + paddleInfluence;
      ball.yDir = -1;
      ball.dy = newSpeed * Math.cos(angle);
      ball.dx = Math.max(
        Math.min(ball.dx, GameConfig.BALL.MAX_SPEED),
        -GameConfig.BALL.MAX_SPEED
      );

      ball.y = this.y - ball.radius;
      ball.changeColor();
      return true;
    }
    return false;
  }
}

class Brick extends GameObject {
  constructor(x, y, color) {
    super(x, y, GameConfig.BRICK.WIDTH, GameConfig.BRICK.HEIGHT);
    this.color = color;
    this.status = 1;
  }

  draw(ctx) {
    if (this.status === 1) {
      ctx.beginPath();
      ctx.rect(this.x, this.y, this.width, this.height);
      ctx.fillStyle = `#${this.color}`;
      ctx.fill();
      ctx.closePath();
    }
  }

  handleCollision(ball) {
    if (
      this.status === 1 &&
      ball.x + ball.radius > this.x &&
      ball.x - ball.radius < this.x + this.width &&
      ball.y + ball.radius > this.y &&
      ball.y - ball.radius < this.y + this.height
    ) {
      ball.yDir = -ball.yDir;
      this.status = 0;
      ball.changeColor();
      return true;
    }
    return false;
  }
}

class Game {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext("2d");

    this.score = 0;
    this.lives = 3;
    this.gameState = "idle";

    this.ball = new Ball(this.canvas);
    this.paddle = new Paddle(this.canvas);
    this.bricks = this.createBricks();

    this.setupControls();
  }

  createBricks() {
    const bricks = [];
    for (let c = 0; c < GameConfig.BRICK.COLUMN_COUNT; c++) {
      for (let r = 0; r < GameConfig.BRICK.ROW_COUNT; r++) {
        const brickX =
          c * (GameConfig.BRICK.WIDTH + GameConfig.BRICK.PADDING) +
          GameConfig.BRICK.OFFSET_LEFT;
        const brickY =
          r * (GameConfig.BRICK.HEIGHT + GameConfig.BRICK.PADDING) +
          GameConfig.BRICK.OFFSET_TOP;
        bricks.push(
          new Brick(
            brickX,
            brickY,
            GameConfig.BRICK.COLORS[r % GameConfig.BRICK.COLORS.length]
          )
        );
      }
    }
    return bricks;
  }

  setupControls() {
    const keyState = {
      right: false,
      left: false,
    };

    document.addEventListener("keydown", (e) => {
      if (e.key === "Right" || e.key === "ArrowRight") {
        keyState.right = true;
      } else if (e.key === "Left" || e.key === "ArrowLeft") {
        keyState.left = true;
      } else if (e.key === " " && this.ball.locked) {
        this.ball.launch();
      }
    });

    document.addEventListener("keyup", (e) => {
      if (e.key === "Right" || e.key === "ArrowRight") {
        keyState.right = false;
      } else if (e.key === "Left" || e.key === "ArrowLeft") {
        keyState.left = false;
      }
    });

    this.keyState = keyState;
  }

  update() {
    if (this.keyState.right) {
      this.paddle.move(1);
    } else if (this.keyState.left) {
      this.paddle.move(-1);
    }

    this.paddle.updateVelocity();
    this.ball.update(this.paddle);

    if (
      !this.ball.locked &&
      this.ball.y + this.ball.yDir * this.ball.dy >
        this.canvas.height - this.ball.radius - this.paddle.height
    ) {
      if (!this.paddle.handleCollision(this.ball)) {
        this.lives--;
        if (!this.lives) {
          this.gameState = "lost";
        } else {
          this.ball.reset(this.paddle.x, this.paddle.width);
        }
      }
    }

    // Check for brick collision
    let bricksRemaining = 0;
    for (const brick of this.bricks) {
      if (brick.status === 1) {
        if (brick.handleCollision(this.ball)) {
          this.score++;
        }
        bricksRemaining++;
      }
    }

    if (bricksRemaining === 0) {
      this.gameState = "won";
    }
  }

  draw() {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw game objects
    this.bricks.forEach((brick) => brick.draw(this.ctx));
    this.ball.draw(this.ctx);
    this.paddle.draw(this.ctx);

    // Draw UI
    this.drawScore();
    this.drawLives();
  }

  drawScore() {
    this.ctx.font = "16px Arial";
    this.ctx.fillStyle = "#0095DD";
    this.ctx.fillText(`Score: ${this.score}`, 8, 20);
  }

  drawLives() {
    this.ctx.font = "16px Arial";
    this.ctx.fillStyle = "#0095DD";
    this.ctx.fillText(`Lives: ${this.lives}`, this.canvas.width - 65, 20);
  }

  gameLoop() {
    if (this.gameState === "playing") {
      this.update();
      this.draw();
      requestAnimationFrame(() => this.gameLoop());
    } else if (this.gameState === "won" || this.gameState === "lost") {
      this.showEndMessage(); // Can be end screen later, and allow user to restart
    }
  }

  showEndMessage() {
    setTimeout(() => {
      alert(
        this.gameState === "won" ? "Congratulations! You won!" : "Game Over!"
      );
    });
    setTimeout(() => {
      this.reset();
    }, 500);
  }

  reset() {
    this.score = 0;
    this.lives = 3;
    this.gameState = "idle";
    this.ball.reset(this.paddle.x, this.paddle.width);
    this.bricks = this.createBricks();
    this.start();
  }

  start() {
    this.gameState = "playing";
    this.gameLoop();
  }
}

// Initialize and start the game
const game = new Game("myCanvas");
game.start();
