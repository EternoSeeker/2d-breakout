import GameObject from "./GameObject.js";
import GameConfig from "../GameConfig.js";

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
    // Same as original code
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

    this.applyFriction(deltaTime);
    this.updatePosition(deltaTime);
    this.checkWallCollision(deltaTime);
  }

  applyFriction(deltaTime) {
    const speed = Math.sqrt(this.dx * this.dx + this.dy * this.dy);
    if (speed > GameConfig.BALL.MIN_SPEED) {
      const scale = Math.max(
        (speed - GameConfig.BALL.FRICTION * deltaTime) / speed,
        0
      );
      this.dx *= scale;
      this.dy *= scale;
    }
  }

  updatePosition(deltaTime) {
    // update position using delta time
    this.actualX += this.dx * deltaTime;
    this.actualY += this.yDir * this.dy * deltaTime;

    // Update integer positions for rendering
    this.x = Math.round(this.actualX);
    this.y = Math.round(this.actualY);
  }

  checkWallCollision(deltaTime) {
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

export default Ball;
