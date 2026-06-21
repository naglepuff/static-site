import { Point } from "./point.js";
import { Bullet } from "./bullet.js";
import { BULLET_IMPULSE, TAU } from "./constants.js";
import { isCollidingWithAsteroid } from "./utils.js";

class Ship {
  static dA = 0.05;
  static dV = 0.01;

  constructor(
    center,
    rotation,
    height,
    width,
    bullets,
    keyManager,
    canvas,
    context,
  ) {
    this.center = center; // Point
    this.rotation = rotation; // Angle in radians
    this.height = height; // number
    this.width = width; // number
    this.bullets = bullets; // Bullet[]
    this.keyManager = keyManager; // AsteroidsKeyManager
    this.dX = 0;
    this.dY = 0;
    this.canvas = canvas; // HTML Canvas
    this.context = context; // Canvas's 2D context
    this.colliding = false;
    this.shootCooldown = 0;
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

  _updatePosition() {
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

  _shoot(dt) {
    this.shootCooldown -= dt;
    if (this.shootCooldown <= 0 && this.keyManager.shoot) {
      const tip = new Point(0, (-1 * this.height) / 3)
        .rotate(this.rotation)
        .translate(this.center.x, this.center.y);
      const speed = Math.sqrt(this.dX ** 2 + this.dY ** 2);
      const bullet = new Bullet(
        tip,
        this.rotation + TAU * 0.75,
        speed + BULLET_IMPULSE,
        this.context,
        this.canvas,
      );
      this.bullets.push(bullet);
      this.shootCooldown = 500; // ms
    }
  }

  update(dt) {
    if (!this.keyManager) {
      return;
    }
    this._updatePosition();
    this._shoot(dt);
  }

  isCollidingWithAsteroids(asteroids) {
    const detections = asteroids.map(
      (asteroid) =>
        asteroid.active && isCollidingWithAsteroid(this.center, asteroid),
    );
    // WARNING: side effect
    this.colliding = detections.some((val) => !!val);
    return this.colliding;
  }
}

export { Ship };
