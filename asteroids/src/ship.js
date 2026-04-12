import { Point } from "./point.js";

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
  }

  draw() {
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
      if (this.rotation > 2 * Math.PI) {
        this.rotation -= 2 * Math.PI;
      }
    }
    if (this.keyManager.ccw) {
      this.rotation -= Ship.dA;
      if (this.rotation < 0) {
        this.rotation += 2 * Math.PI;
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
}

export { Ship };
