const GameConfig = {
  PADDLE: {
    HEIGHT: 16,
    WIDTH: 88,
    BORDER_RADIUS: 7,
    SPEED: 500,
    COLOR: "#00538f",
  },
  BALL: {
    RADIUS: 9,
    MIN_SPEED: 300,
    MAX_SPEED: 475,
    FRICTION: 10,
    COLOR: "#D19E3F",
  },
  BRICK: {
    ROW_COUNT: 4,
    COLUMN_COUNT: 7,
    WIDTH: 75,
    HEIGHT: 18,
    PADDING: 5,
    OFFSET_TOP: 40,
    OFFSET_LEFT: 25,
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
  constructor(canvas, x = null, y = null, dx = null, dy = null) {
    super(
      x || canvas.width / 2,
      y || canvas.height - GameConfig.PADDLE.HEIGHT - GameConfig.BALL.RADIUS,
      GameConfig.BALL.RADIUS * 2,
      GameConfig.BALL.RADIUS * 2
    );

    this.canvas = canvas;
    this.radius = GameConfig.BALL.RADIUS;
    this.dx = GameConfig.BALL.MIN_SPEED;
    this.dy = GameConfig.BALL.MIN_SPEED;
    this.yDir = -1;
    this.color = GameConfig.BALL.COLOR;
    this.locked = true;

    this.actualX = this.x;
    this.actualY = this.y;
  }

  draw(ctx) {
    const gradient = ctx.createRadialGradient(
      this.x - this.radius / 4, 
      this.y - this.radius / 4, 
      this.radius / 10,
      this.x, 
      this.y, 
      this.radius
    );
    
    gradient.addColorStop(0.3, "#d7ac5b");
    gradient.addColorStop(0.8, this.color); 
    gradient.addColorStop(1, "#a47928aa"); 
    
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
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
      this.actualX = this.x;
      this.actualY = this.y;
      return;
    }

    const speed = Math.sqrt(this.dx * this.dx + this.dy * this.dy);
    if (speed > GameConfig.BALL.MIN_SPEED) {
      const scale = Math.max(
        (speed - GameConfig.BALL.FRICTION * deltaTime) / speed,
        0
      );
      this.dx *= scale;
      this.dy *= scale;
    }

    // update position using delta time
    this.actualX += this.dx * deltaTime;
    this.actualY += this.yDir * this.dy * deltaTime;

    // Update integer positions for rendering
    this.x = Math.round(this.actualX);
    this.y = Math.round(this.actualY);

    // Handle wall collision
    if (
      this.x + this.dx * deltaTime > this.canvas.width - this.radius ||
      this.x + this.dx * deltaTime < this.radius
    ) {
      this.dx = -this.dx;
    }

    if (this.y + this.yDir * this.dy * deltaTime < this.radius) {
      this.yDir = -this.yDir;
    }
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
    this.color = GameConfig.PADDLE.COLOR;
  }

  draw(ctx) {
    const renderX = Math.round(this.x);
    const renderY = Math.round(this.y);
    const gradient = ctx.createLinearGradient(
      this.x,
      this.y,
      this.x,
      this.y + this.height
    );
    gradient.addColorStop(0, "#3388CC"); 
    gradient.addColorStop(0.7, this.color);
    gradient.addColorStop(1, this.color); 

    ctx.beginPath();
    ctx.roundRect(
      renderX,
      renderY,
      this.width,
      this.height,
      GameConfig.PADDLE.BORDER_RADIUS
    );
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.closePath();
  }

  move(direction, deltaTime) {
    const moveAmount = direction * this.speed * deltaTime;
    const newX = this.x + moveAmount;
    this.x = Math.max(0, Math.min(newX, this.canvas.width - this.width));

    // Smooth sub-pixel positioning
    this.actualX = this.x;
    this.actualY = this.y;
  }

  updateVelocity(deltaTime) {
    this.velocityX = (this.x - this.lastX) / deltaTime;
    this.lastX = this.x;
  }

  handleCollision(ball) {
    const ballLeft = ball.x - ball.radius;
    const ballRight = ball.x + ball.radius;

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
      return true;
    }
    return false;
  }

  reset() {
    this.x = (this.canvas.width - this.width) / 2;
    this.lastX = this.x;
    this.velocityX = 0;
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
      const baseColor = `#${GameConfig.BRICK.COLORS[this.strength]}`;

      const gradient = ctx.createLinearGradient(
        this.x,
        this.y,
        this.x,
        this.y + this.height
      );
      gradient.addColorStop(0, baseColor);
      gradient.addColorStop(0.8, baseColor); 
      gradient.addColorStop(1, "#607e94"); 

      ctx.beginPath();
      ctx.rect(this.x, this.y, this.width, this.height);
      ctx.fillStyle = gradient;
      ctx.fill();
      ctx.closePath();
    }
  }

  handleCollision(ball) {
    if (this.strength <= 0) return false;

    // Optimized collision check with early exit
    const ballLeft = ball.actualX - ball.radius;
    const ballRight = ball.actualX + ball.radius;
    const ballTop = ball.actualY - ball.radius;
    const ballBottom = ball.actualY + ball.radius;

    if (
      ballRight < this.x ||
      ballLeft > this.x + this.width ||
      ballBottom < this.y ||
      ballTop > this.y + this.height
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
      return this.strength === 0;
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
    this.lastTime = 0;
    this.accumulator = 0;
    this.step = 1 / 60;

    this.currentLevel = 0;
    this.levels = [];
    this.loadLevels();

    this.ball = new Ball(this.canvas);
    this.paddle = new Paddle(this.canvas);
    this.bricks = [];

    this.setupControls();
    this.setupLevelDisplay();
  }

  async loadLevels() {
    try {
      const response = await fetch("./levels.json");
      this.levels = await response.json();
      this.initLevel(this.currentLevel);
    } catch (error) {
      console.error("Error loading levels", error);
      // Fall back to default level
      this.bricks = this.createDefaultBricks();
      this.updateBrickCount();
    }
  }

  setupLevelDisplay() {
    this.levelDisplay = document.getElementById("levelDisplay");
  }

  initLevel(levelIndex) {
    if (this.levels.length === 0) return;

    // Reset game state for new level
    this.bricks = [];
    this.ball.reset(this.paddle.x, this.paddle.width);

    // Get level data
    const level = this.levels[levelIndex];
    if (!level) return;

    // Update level display
    this.levelDisplay.textContent = level.name || `Level ${levelIndex + 1}`;

    // Create bricks
    const layout = level.layout;
    for (let r = 0; r < layout.length; r++) {
      const row = layout[r];
      for (let c = 0; c < row.length; c++) {
        const strength = parseInt(row[c]);
        if (strength > 0) {
          const brickX =
            c * (GameConfig.BRICK.WIDTH + GameConfig.BRICK.PADDING) +
            GameConfig.BRICK.OFFSET_LEFT;
          const brickY =
            r * (GameConfig.BRICK.HEIGHT + GameConfig.BRICK.PADDING) +
            GameConfig.BRICK.OFFSET_TOP;
          this.bricks.push(new Brick(brickX, brickY, strength));
        }
      }
    }
    this.updateBrickCount();
  }

  createDefaultBricks() {
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

  updateBrickCount() {
    this.bricksRemaining = this.bricks.filter(
      (brick) => brick.strength > 0
    ).length;
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
        }
        this.ball.reset(this.paddle.x, this.paddle.width);
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
      this.nextLevel();
      this.lives = 3;
    }
  }

  nextLevel() {
    this.currentLevel++;
    if (this.currentLevel >= this.levels.length) {
      // Game won
      this.gameState = "won";
      return;
    }

    // Initialize next level
    this.initLevel(this.currentLevel);
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
    this.ctx.font = "bold 1.05rem Jura";
    this.ctx.fillStyle = "#1A173A";
    this.ctx.fillText(`Score: ${this.score}`, 9, 20);
  }

  drawLives() {
    this.ctx.font = "bold 1.05rem Jura";
    this.ctx.fillStyle = "#1A173A";
    this.ctx.fillText(`Lives: ${this.lives}`, this.canvas.width - 72, 20);
  }

  gameLoop(currentTime) {
    if (this.gameState === "playing") {
      if (!this.lastTime) {
        this.lastTime = currentTime;
      }

      let deltaTime = (currentTime - this.lastTime) / 1000;
      this.lastTime = currentTime;

      deltaTime = Math.min(deltaTime, 0.1); // Cap the maximum delta time to 100ms
      this.accumulator += deltaTime;
      while (this.accumulator >= this.step) {
        this.update(this.step);
        this.accumulator -= this.step;
      }

      this.draw();

      requestAnimationFrame((time) => this.gameLoop(time));
    } else if (this.gameState === "won" || this.gameState === "lost") {
      this.showEndMessage(); // Can be end screen later, and allow user to restart
    }
  }

  showEndMessage() {
    setTimeout(() => {
      if (this.gameState === "won") {
        alert("Congratulations! You completed all levels!");
      } else {
        alert("Game Over!");
      }
    }, 0);
    setTimeout(() => {
      this.reset();
    }, 100);
  }

  reset() {
    this.score = 0;
    this.lives = 3;
    this.gameState = "idle";
    this.currentLevel = 0;
    this.paddle.reset();
    this.ball.reset(this.paddle.x, this.paddle.width);
    this.initLevel(this.currentLevel);
    this.start();
  }

  start() {
    this.gameState = "playing";
    this.lastTime = performance.now();
    this.gameLoop(this.lastTime);
  }
}

// Initialize and start the game
document.addEventListener("DOMContentLoaded", () => {
  const game = new Game("myCanvas");
  game.start();
});
