const GameConfig = {
  PADDLE: {
    HEIGHT: 16,
    WIDTH: 88,
    BORDER_RADIUS: 7,
    SPEED: 450,
    COLOR: "#D9E8F7",
  },
  BALL: {
    RADIUS: 9,
    MIN_SPEED: 325,
    MAX_SPEED: 425,
    FRICTION: 10,
    COLOR: "#FFBB3C",
  },
  BRICK: {
    ROW_COUNT: 4,
    COLUMN_COUNT: 7,
    WIDTH: 82,
    HEIGHT: 20,
    PADDING: 5,
    OFFSET_TOP: 30,
    OFFSET_LEFT: 50,
    COLORS : {1 : "26FC9C", 2: "26FCFC", 3: "5881FC", 4:"B126FC", 5:"FC266A"}
  },
};

export default GameConfig;
