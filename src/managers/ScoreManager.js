class ScoreManager {
  constructor() {
    this.score = 0;
    this.lives = 3;
  }

  increaseScore() {
    this.score++;
    return this.score;
  }

  decreaseLives() {
    this.lives--;
    return this.lives;
  }

  reset() {
    this.score = 0;
    this.lives = 3;
  }

  draw(ctx, canvasWidth) {
    this.drawScore(ctx);
    this.drawLives(ctx, canvasWidth);
  }

  drawScore(ctx) {
    ctx.font = "bold 1.05rem Jura";
    ctx.fillStyle = "#1A173A";
    ctx.fillText(`Score: ${this.score}`, 9, 20);
  }

  drawLives(ctx, canvasWidth) {
    ctx.font = "bold 1.05rem Jura";
    ctx.fillStyle = "#1A173A";
    ctx.fillText(`Lives: ${this.lives}`, canvasWidth - 72, 20);
  }
}

export default ScoreManager;
