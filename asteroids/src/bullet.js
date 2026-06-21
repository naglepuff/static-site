import { BULLET_RADIUS, TAU } from "./constants.js";

class Bullet {
  constructor(center, flightAngle, flightSpeed, context, canvas) {
    this.center = center;
    this.flightAngle = flightAngle;
    this.flightSpeed = flightSpeed;
    this.context = context;
    this.canvas = canvas;

    this.live = true;
  }

  draw() {
    this.context.beginPath();
    this.context.arc(this.center.x, this.center.y, BULLET_RADIUS, 0, TAU);
    this.context.fill();
  }

  update() {
    const dX = Math.cos(this.flightAngle) * this.flightSpeed;
    const dY = Math.sin(this.flightAngle) * this.flightSpeed;

    this.center = this.center.translate(dX, dY);
    if (
      this.center.x < 0 ||
      this.center.x > this.canvas.width ||
      this.center.y < 0 ||
      this.center.y > this.canvas.height
    ) {
      this.destroy();
    }
  }

  destroy() {
    this.live = false;
  }
}

export { Bullet };
