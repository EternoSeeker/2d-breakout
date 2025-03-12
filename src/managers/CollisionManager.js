class CollisionManager {
  static checkBallPaddleCollision(ball, paddle) {
    const ballLeft = ball.x - ball.radius;
    const ballRight = ball.x + ball.radius;

    if (ballRight > paddle.x && ballLeft < paddle.x + paddle.width) {
      const contactPoint = Math.max(ballLeft, Math.min(ball.x, ballRight));
      const hitPosition =
        (contactPoint - (paddle.x + paddle.width / 2)) / (paddle.width / 2);

      return {
        collision: true,
        hitPosition,
      };
    }

    return { collision: false };
  }

  static checkBallBrickCollision(ball, brick) {
    if (brick.strength <= 0) return { collision: false };

    // Optimized collision check with early exit
    const ballLeft = ball.actualX - ball.radius;
    const ballRight = ball.actualX + ball.radius;
    const ballTop = ball.actualY - ball.radius;
    const ballBottom = ball.actualY + ball.radius;

    if (
      ballRight < brick.x ||
      ballLeft > brick.x + brick.width ||
      ballBottom < brick.y ||
      ballTop > brick.y + brick.height
    ) {
      return { collision: false };
    }

    // Precise circle collision check
    const closestX = Math.max(brick.x, Math.min(ball.x, brick.x + brick.width));
    const closestY = Math.max(
      brick.y,
      Math.min(ball.y, brick.y + brick.height)
    );
    const distanceX = ball.x - closestX;
    const distanceY = ball.y - closestY;
    const distanceSquared = distanceX * distanceX + distanceY * distanceY;

    if (distanceSquared < ball.radius * ball.radius) {
      return {
        collision: true,
        side: Math.abs(distanceX) > Math.abs(distanceY),
        distanceX,
        distanceY,
        closestX,
        closestY,
      };
    }

    return { collision: false };
  }

  static checkBallWallCollision(ball, canvas) {
    const leftWall = ball.x + ball.dx < ball.radius;
    const rightWall = ball.x + ball.dx > canvas.width - ball.radius;
    const topWall = ball.y + ball.yDir * ball.dy < ball.radius;
    const bottomWall =
      ball.y + ball.yDir * ball.dy > canvas.height - ball.radius;

    return {
      leftWall,
      rightWall,
      topWall,
      bottomWall,
    };
  }
}

export default CollisionManager;
