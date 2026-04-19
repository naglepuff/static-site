import { Point } from "./point.js";
import { LARGE_ASTEROID_RADIUS_CLAMP, TAU } from "./constants.js";

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

class Asteroid {
  constructor(
    center,
    maxRadius,
    canvas,
    context,
    flightAngle,
    flightSpeed,
    rotationSpeed,
  ) {
    this.center = center; // Point
    this.maxRadius = maxRadius;
    this.context = context;
    this.canvas = canvas;
    this.flightAngle = flightAngle;
    this.flightSpeed = flightSpeed;
    this.rotationSpeed = rotationSpeed;
    this.points = [];

    this._generatePoints(getRandomInt(10, 20));
    this.angle = 0;
  }

  _generatePoints(numPoints) {
    for (let i = 0; i < numPoints; i++) {
      const angle = i * (TAU / numPoints);
      const length = Math.floor(
        this.maxRadius *
          (Math.random() * LARGE_ASTEROID_RADIUS_CLAMP +
            LARGE_ASTEROID_RADIUS_CLAMP),
      );
      const point = new Point(0, length).rotate(angle);
      this.points.push(point);
    }
  }

  draw() {
    this.context.beginPath();
    const startingPoint = this.points[0]
      .rotate(this.angle)
      .translate(this.center.x, this.center.y);
    this.context.moveTo(startingPoint.x, startingPoint.y);
    for (let i = 1; i < this.points.length; i++) {
      const realPoint = this.points[i]
        .rotate(this.angle)
        .translate(this.center.x, this.center.y);
      this.context.lineTo(realPoint.x, realPoint.y);
    }
    this.context.lineTo(startingPoint.x, startingPoint.y);
    this.context.stroke();
  }

  update() {
    const dX = Math.cos(this.flightAngle) * this.flightSpeed;
    const dY = Math.sin(this.flightAngle) * this.flightSpeed;
    this.angle += this.rotationSpeed;
    if (this.angle > TAU) {
      this.angle -= TAU;
    }

    this.center = this.center.translate(dX, dY);
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
}

export { Asteroid };
