class ScoreManager {
  constructor(scoreElement, livesElement) {
    this.score = 0;
    this.lives = 3;
    this.scoreElement = scoreElement;
    this.livesElement = livesElement;
    this.updateDisplay();
  }

  increaseScore() {
    this.score++;
    this.updateDisplay();
    return this.score;
  }

  decreaseLives() {
    this.lives--;
    this.updateDisplay();
    return this.lives;
  }

  reset() {
    this.score = 0;
    this.lives = 3;
    this.updateDisplay();
  }

  updateDisplay() {
    if (this.scoreElement) {
      this.scoreElement.innerText = this.score;
    }
    if (this.livesElement) {
      this.livesElement.innerText = this.lives;
    }
  }
}

export default ScoreManager;
