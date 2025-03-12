// Game configuration settings
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

export default GameConfig;
