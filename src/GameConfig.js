// Game configuration settings
const GameConfig = {
  PADDLE: {
    HEIGHT: 16,
    WIDTH: 88,
    BORDER_RADIUS: 7,
    SPEED: 500,
    COLOR: "#D9E8F7",
  },
  BALL: {
    RADIUS: 9,
    MIN_SPEED: 300,
    MAX_SPEED: 475,
    FRICTION: 10,
    COLOR: "#FFBB3C",
  },
  BRICK: {
    ROW_COUNT: 4,
    COLUMN_COUNT: 7,
    WIDTH: 75,
    HEIGHT: 18,
    PADDING: 5,
    OFFSET_TOP: 30,
    OFFSET_LEFT: 25,
    COLORS : {1 : "26FC9C", 2: "26FCFC", 3: "5881FC", 4:"B126FC", 5:"FC266A"}
    //COLORS: { 1: "0095dd", 2: "1b63ab", 3: "37327a", 4: "520048" FF2C56},
  },
};

export default GameConfig;
