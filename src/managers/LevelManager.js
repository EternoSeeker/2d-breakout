import Brick from "../objects/Brick.js";
import GameConfig from "../GameConfig.js";

class LevelManager {
  constructor(levelDisplay) {
    this.levels = [];
    this.currentLevel = 0;
    this.bricksRemaining = 0;
    this.bricks = [];
    this.levelDisplay = levelDisplay;
  }

  async loadLevels() {
    try {
      const response = await fetch("data/levels.json");
      this.levels = await response.json();
      return true;
    } catch (error) {
      console.error("Error loading levels", error);
      return false;
    }
  }

  initLevel(levelIndex) {
    if (this.levels.length === 0) {
      this.bricks = this.createDefaultBricks();
      this.updateBrickCount();
      return;
    }

    // Reset bricks for new level
    this.bricks = [];

    // Get level data
    const level = this.levels[levelIndex];
    if (!level) return false;

    // Update level display
    if (this.levelDisplay) {
      this.levelDisplay.textContent = level.name || `Level ${levelIndex + 1}`;
    }

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
    return true;
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

  decrementBrickCount() {
    this.bricksRemaining--;
    return this.bricksRemaining;
  }

  nextLevel() {
    this.currentLevel++;
    if (this.currentLevel >= this.levels.length) {
      return false; // No more levels
    }

    // Initialize next level
    return this.initLevel(this.currentLevel);
  }

  reset() {
    this.currentLevel = 0;
    return this.initLevel(this.currentLevel);
  }
}

export default LevelManager;
