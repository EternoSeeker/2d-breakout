import GameObject from "./GameObject.js";
import GameConfig from "../GameConfig.js";
import CollisionManager from "../managers/CollisionManager.js";

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
    // Same as original code
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

export default Paddle;
