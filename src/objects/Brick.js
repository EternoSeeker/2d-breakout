import GameObject from "./GameObject.js";
import GameConfig from "../GameConfig.js";

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
      gradient.addColorStop(1, "#4c6476");

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

export default Brick;
