function isCollidingWithAsteroid(point, asteroid) {
  let intersections = 0;

  // 1. Get segments of asteroid
  const asteroidShapePoints = asteroid.points.map((point) => {
    return point
      .rotate(asteroid.angle)
      .translate(asteroid.center.x, asteroid.center.y);
  });
  const asteroidSegments = [];
  for (let i = 0; i < asteroidShapePoints.length; i++) {
    asteroidSegments.push([
      asteroidShapePoints[i],
      asteroidShapePoints[(i + 1) % asteroidShapePoints.length],
    ]);
  }

  // 2. For each segment, determine if the ray point.y is in the range
  for (let i = 0; i < asteroidSegments.length; i++) {
    const segment = asteroidSegments[i];
    const dY = segment[0].y - segment[1].y;
    const dX = segment[0].x - segment[1].x;

    const maxY = Math.max(segment[0].y, segment[1].y);
    const minY = Math.min(segment[0].y, segment[1].y);

    const maxX = Math.max(segment[0].x, segment[1].x);
    const minX = Math.min(segment[0].x, segment[1].x);

    if (dY === 0) {
      // Flat Line. If the center of the ship hits a horizontal line,
      // it counts as a collition.
      if (point.y === minY) {
        return point.x < maxX && point.x > minX;
      }
    }
    if (dX === 0) {
      // Vertical line. If we're on the line, it's a collision
      if (point.x === minX) {
        return point.y < maxY && point.x > minY;
      }
    }
    if (point.y >= maxY || point.y <= minY) {
      continue;
    }
    if (point.x >= maxX) {
      continue;
    }
    intersections++;
  }
  return intersections % 2 === 1;
}

export { isCollidingWithAsteroid };
