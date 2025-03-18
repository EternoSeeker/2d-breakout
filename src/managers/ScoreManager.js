class ScoreManager {
  constructor(scoreElement, livesElement) {
    this.score = 0;
    this.lives = 3;
    this.scoreElement = scoreElement;
    this.livesElement = livesElement;
    this.heartIcons = Array.from(this.livesElement.querySelectorAll('.heart-icon'))
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
    if (this.livesElement && this.heartIcons.length > 0) {
      this.heartIcons.forEach((heart, index) => {
        if (index < this.lives) {
          heart.style.fontVariationSettings = "'FILL' 1";
          heart.style.opacity = '1';
        } else {
          heart.style.fontVariationSettings = "'FILL' 0";
          heart.style.opacity = '0.3';
        }
      });
    }
  }
}

export default ScoreManager;
