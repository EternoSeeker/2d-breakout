const GameConfig = {
  PADDLE: {
    HEIGHT: 16,
    WIDTH: 86,
    BORDER_RADIUS: 7,
    SPEED: 500,
    COLOR: "#00538f",
  },
  BALL: {
    RADIUS: 9.5,
    MIN_SPEED: 275,
    MAX_SPEED: 500,
    FRICTION: 10,
  },
  BRICK: {
    ROW_COUNT: 4,
    COLUMN_COUNT: 8,
    WIDTH: 60,
    HEIGHT: 18,
    PADDING: 10,
    OFFSET_TOP: 40,
    OFFSET_LEFT: 20,
    COLORS: { 1: "0095dd", 2: "1b63ab", 3: "37327a", 4: "520048" },
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
    //this.xDir = 1;
    this.color = "#0095DD";
    this.locked = true;

    this.actualX = this.x;
    this.actualY = this.y;
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

  update(paddle, deltaTime) {
    if (this.locked) {
      this.x = paddle.x + paddle.width / 2;
      this.y = this.canvas.height - GameConfig.PADDLE.HEIGHT - this.radius;
      // this.actualX = this.x;
      // this.actualY = this.y;
      return;
    }

    // Apply Friction
    this.dy -=
      (this.dy > GameConfig.BALL.MIN_SPEED ? GameConfig.BALL.FRICTION : 0) *
      deltaTime;

    // update position using delta time
    this.x += this.dx * deltaTime;
    this.y += this.yDir * this.dy * deltaTime;

    // // Update integer positions for rendering
    // this.x = Math.round(this.actualX);
    // this.y = Math.round(this.actualY);

    // Handle wall collision
    if (
      this.x + this.dx * deltaTime > this.canvas.width - this.radius ||
      this.x + this.dx * deltaTime < this.radius
    ) {
      this.dx = -this.dx;
      this.changeColor();
    }

    if (this.y + this.yDir * this.dy * deltaTime < this.radius) {
      this.yDir = -this.yDir;
      this.changeColor();
    }
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

  move(direction, deltaTime) {
    const newX = this.x + direction * this.speed * deltaTime;
    this.x = Math.max(0, Math.min(newX, this.canvas.width - this.width));
  }

  updateVelocity(deltaTime) {
    this.velocityX = (this.x - this.lastX) / deltaTime;
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
  constructor(x, y, strength) {
    super(x, y, GameConfig.BRICK.WIDTH, GameConfig.BRICK.HEIGHT);
    this.color = GameConfig.BRICK.COLORS[strength];
    this.strength = strength;
  }

  draw(ctx) {
    if (this.strength > 0) {
      ctx.beginPath();
      ctx.rect(this.x, this.y, this.width, this.height);
      ctx.fillStyle = `#${GameConfig.BRICK.COLORS[this.strength]}`;
      ctx.fill();
      ctx.closePath();
    }
  }

  handleCollision(ball) {
    if (this.strength <= 0) return false;
    // Early exit optimization - rough AABB check first
    if (
      ball.x + ball.radius < this.x ||
      ball.x - ball.radius > this.x + this.width ||
      ball.y + ball.radius < this.y ||
      ball.y - ball.radius > this.y + this.height
    ) {
      return false;
    }
    // Precise circle collision check
    const closestX = Math.max(this.x, Math.min(ball.x, this.x + this.width));
    const closestY = Math.max(this.y, Math.min(ball.y, this.y + this.height));
    const distanceX = ball.x - closestX;
    const distanceY = ball.y - closestY;
    const distanceSquared = distanceX * distanceX + distanceY * distanceY;

    if (distanceSquared < ball.radius * ball.radius) {
      // More accurate collision response
      if (Math.abs(distanceX) > Math.abs(distanceY)) {
        // Side collision - reflect x velocity
        ball.dx = -ball.dx;
        // Push ball out of brick
        ball.x = closestX + (distanceX > 0 ? ball.radius : -ball.radius);
      } else {
        // Top/bottom collision - reflect y velocity
        ball.yDir = -ball.yDir;
        // Push ball out of brick
        ball.y = closestY + (distanceY > 0 ? ball.radius : -ball.radius);
      }

      this.strength--;
      ball.changeColor();
      return this.strength === 0;
    }
    // return false;
  }
}

class Game {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext("2d");
    this.bricksRemaining =
      GameConfig.BRICK.ROW_COUNT * GameConfig.BRICK.COLUMN_COUNT;

    this.score = 0;
    this.lives = 3;
    this.gameState = "idle";
    this.lastTime = 0;
    this.targetFPS = 60;
    this.timeStep = 1000 / this.targetFPS;

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
        bricks.push(new Brick(brickX, brickY, GameConfig.BRICK.ROW_COUNT - r));
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

  update(deltaTime) {
    if (this.keyState.right) {
      this.paddle.move(1, deltaTime);
    } else if (this.keyState.left) {
      this.paddle.move(-1, deltaTime);
    }

    this.paddle.updateVelocity(deltaTime);
    this.ball.update(this.paddle, deltaTime);

    if (
      !this.ball.locked &&
      this.ball.y + this.ball.yDir * this.ball.dy * deltaTime >
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

    for (const brick of this.bricks) {
      if (brick.handleCollision(this.ball)) {
        this.score++;
        this.bricksRemaining--;
      }
    }

    if (this.bricksRemaining === 0) {
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

  gameLoop(currentTime) {
    if (this.gameState === "playing") {
      if (!this.lastTime) {
        this.lastTime = currentTime;
      }

      let deltaTime = (currentTime - this.lastTime) / 1000;

      deltaTime = Math.min(deltaTime, 0.1); // Cap the maximum delta time to 100ms

      this.update(deltaTime);
      this.draw();
      this.lastTime = currentTime;
      requestAnimationFrame((time) => this.gameLoop(time));
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
    this.bricksRemaining =
      GameConfig.BRICK.ROW_COUNT * GameConfig.BRICK.COLUMN_COUNT;
    this.score = 0;
    this.lives = 3;
    this.gameState = "idle";
    this.ball.reset(this.paddle.x, this.paddle.width);
    this.bricks = this.createBricks();
    this.start();
  }

  start() {
    this.gameState = "playing";
    this.lastTime = performance.now();
    this.gameLoop(this.lastTime);
  }
}

// Initialize and start the game
const game = new Game("myCanvas");
game.start();
