import Ball from "./objects/Ball.js";
import Paddle from "./objects/Paddle.js";
import ScoreManager from "./managers/ScoreManager.js";
import LevelManager from "./managers/LevelManager.js";

class Game {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext("2d", { alpha: false });

    this.gameState = "idle";
    this.lastTime = 0;
    this.accumulator = 0;
    this.step = 1 / 120;

    this.ball = new Ball(this.canvas);
    this.paddle = new Paddle(this.canvas);
    this.scoreManager = new ScoreManager(
      document.getElementById("scoreDisplay"),
      document.getElementById("livesDisplay")
    );
    this.levelManager = new LevelManager(
      document.getElementById("levelDisplay")
    );

    this.setupControls();
    this.initGame();

    // Touch control variables
    this.lastTapTime = 0;
    this.touchStartX = 0;
    this.touchHolding = false;
  }

  async initGame() {
    const levelsLoaded = await this.levelManager.loadLevels();
    if (levelsLoaded) {
      this.levelManager.initLevel(this.levelManager.currentLevel);
      this.start();
    }
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
    this.setupTouchControls();
  }

  setupTouchControls() {
    // Touch start event
    this.canvas.addEventListener("touchstart", (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const canvasRect = this.canvas.getBoundingClientRect();
      const touchX = touch.clientX - canvasRect.left;

      this.touchStartX = touchX;
      this.touchHolding = true;

      // Check for double tap to launch ball
      const currentTime = new Date().getTime();
      const tapLength = currentTime - this.lastTapTime;
      if (tapLength < 300 && tapLength > 0 && this.ball.locked) {
        this.ball.launch();
      }
      this.lastTapTime = currentTime;

      // Set paddle movement based on touch position
      if (touchX > this.canvas.width / 2) {
        this.keyState.right = true;
        this.keyState.left = false;
      } else {
        this.keyState.left = true;
        this.keyState.right = false;
      }
    });

    // Touch move event
    this.canvas.addEventListener("touchmove", (e) => {
      e.preventDefault();
      if (!this.touchHolding) return;

      const touch = e.touches[0];
      const canvasRect = this.canvas.getBoundingClientRect();
      const touchX = touch.clientX - canvasRect.left;

      // Update paddle movement based on current touch position
      if (touchX > this.canvas.width / 2) {
        this.keyState.right = true;
        this.keyState.left = false;
      } else {
        this.keyState.left = true;
        this.keyState.right = false;
      }
    });

    // Touch end event
    this.canvas.addEventListener("touchend", (e) => {
      e.preventDefault();
      this.touchHolding = false;
      this.keyState.right = false;
      this.keyState.left = false;
    });

    // Touch cancel event
    this.canvas.addEventListener("touchcancel", (e) => {
      e.preventDefault();
      this.touchHolding = false;
      this.keyState.right = false;
      this.keyState.left = false;
    });
  }

  update(deltaTime) {
    this.handlePaddleMovement(deltaTime);
    this.ball.update(this.paddle, deltaTime);
    this.checkBallBottomCollision(deltaTime);
    this.checkBrickCollisions();

    if (this.levelManager.bricksRemaining === 0) {
      this.advanceToNextLevel();
    }
  }

  handlePaddleMovement(deltaTime) {
    if (this.keyState.right) {
      this.paddle.move(1, deltaTime);
    } else if (this.keyState.left) {
      this.paddle.move(-1, deltaTime);
    }
    this.paddle.updateVelocity(deltaTime);
  }

  checkBallBottomCollision(deltaTime) {
    if (
      !this.ball.locked &&
      this.ball.y + this.ball.yDir * this.ball.dy * deltaTime >
        this.canvas.height - this.ball.radius - this.paddle.height
    ) {
      if (!this.paddle.handleCollision(this.ball)) {
        const remainingLives = this.scoreManager.decreaseLives();
        if (remainingLives <= 0) {
          this.gameState = "lost";
        }
        this.ball.reset(this.paddle.x, this.paddle.width);
      }
    }
  }

  checkBrickCollisions() {
    for (const brick of this.levelManager.bricks) {
      if (brick.handleCollision(this.ball)) {
        this.scoreManager.increaseScore();
        this.levelManager.decrementBrickCount();
      }
    }
  }

  advanceToNextLevel() {
    if (this.gameState !== "playing") return;
    const hasNextLevel = this.levelManager.nextLevel();
    if (!hasNextLevel) {
      this.gameState = "won";
      return;
    }

    this.scoreManager.lives = 3;
    this.ball.reset(this.paddle.x, this.paddle.width);
  }

  draw() {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.fillStyle = "#050321";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw game objects
    this.levelManager.bricks.forEach((brick) => brick.draw(this.ctx));
    this.ball.draw(this.ctx);
    this.paddle.draw(this.ctx);

    // Draw UI
    this.scoreManager.updateDisplay();
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
      this.showEndMessage();
    }
  }

  showEndMessage() {
    setTimeout(() => {
      if (this.gameState === "won") {
        alert("Congratulations! You completed all levels!");
      } else if (this.gameState === "lost") {
        alert("Game Over!");
      }
    }, 0);

    setTimeout(() => {
      this.reset();
    }, 100);
  }

  reset() {
    this.scoreManager.reset();
    this.gameState = "idle";
    this.paddle.reset();
    this.ball.reset(this.paddle.x, this.paddle.width);
    this.levelManager.reset();
    this.start();
  }

  start() {
    this.gameState = "playing";
    this.lastTime = performance.now();
    this.gameLoop(this.lastTime);
  }
}

export default Game;
