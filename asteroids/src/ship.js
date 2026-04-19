import { Point } from "./point.js";
import { TAU } from "./constants.js";

class Ship {
  static dA = 0.05;
  static dV = 0.01;

  constructor(center, rotation, height, width, keyManager, canvas, context) {
    this.center = center; // Point
    this.rotation = rotation; // Angle in radians
    this.height = height; // number
    this.width = width; // number
    this.keyManager = keyManager; // AsteroidsKeyManager
    this.dX = 0;
    this.dY = 0;
    this.canvas = canvas; // HTML Canvas
    this.context = context; // Canvas's 2D context
    this.colliding = false;
    this.alive = true;
  }

  draw() {
    if (!this.alive) {
      return;
    }
    const tip = new Point(0, (-1 * this.height) / 3)
      .rotate(this.rotation)
      .translate(this.center.x, this.center.y);
    const lowerLeft = new Point((-2 * this.width) / 3, this.height)
      .rotate(this.rotation)
      .translate(this.center.x, this.center.y);
    const middle = new Point(0, (2 * this.height) / 3)
      .rotate(this.rotation)
      .translate(this.center.x, this.center.y);
    const lowerRight = new Point((2 * this.width) / 3, this.height)
      .rotate(this.rotation)
      .translate(this.center.x, this.center.y);

    this.context.beginPath();
    this.context.moveTo(tip.x, tip.y);
    this.context.lineTo(lowerLeft.x, lowerLeft.y);
    this.context.lineTo(middle.x, middle.y);
    this.context.lineTo(lowerRight.x, lowerRight.y);
    this.context.fill();
  }

  update() {
    if (!this.keyManager) {
      return;
    }
    if (this.keyManager.cw) {
      this.rotation += Ship.dA;
      if (this.rotation > TAU) {
        this.rotation -= TAU;
      }
    }
    if (this.keyManager.ccw) {
      this.rotation -= Ship.dA;
      if (this.rotation < 0) {
        this.rotation += TAU;
      }
    }
    if (this.keyManager.acc) {
      this.dY -= Math.cos(this.rotation) * Ship.dV;
      this.dX += Math.sin(this.rotation) * Ship.dV;
    }
    // Update position based on velocity and rotation
    this.center = this.center.translate(this.dX, this.dY);
    if (this.center.x < 0) {
      this.center.x += this.canvas.width;
    }
    if (this.center.x > this.canvas.width) {
      this.center.x -= this.canvas.width;
    }
    if (this.center.y < 0) {
      this.center.y += this.canvas.height;
    }
    if (this.center.y > this.canvas.height) {
      this.center.y -= this.canvas.height;
    }
  }

  _isCollidingWithAsteroid(asteroid) {
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

    // 2. For each segment, determine if the ray this.center.y is in the range
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
        if (this.center.y === minY) {
          return this.center.x < maxX && this.center.x > minX;
        }
      }
      if (dX === 0) {
        // Vertical line. If we're on the line, it's a collision
        if (this.center.x === minX) {
          return this.center.y < maxY && this.center.x > minY;
        }
      }
      if (this.center.y >= maxY || this.center.y <= minY) {
        continue;
      }
      if (this.center.x >= maxX) {
        continue;
      }
      intersections++;
    }
    return intersections % 2 === 1;
  }

  isCollidingWithAsteroids(asteroids) {
    const detections = asteroids.map((asteroid) =>
      this._isCollidingWithAsteroid(asteroid),
    );
    // WARNING: side effect
    this.colliding = detections.some((val) => !!val);
    return this.colliding;
  }
}

export { Ship };
