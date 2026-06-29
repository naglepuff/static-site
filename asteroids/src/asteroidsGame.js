import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  LARGE_ASTEROID_FLIGHT_SPEED,
  LARGE_ASTEROID_ROTATION_MODIFIER,
  LARGE_ASTEROID_SIZE,
  MIN_ASTEROID_SPAWN_DISTANCE,
  ROCKET_HEIGHT,
  ROCKET_WIDTH,
  TAU,
} from "./constants";
import { KeyManager } from "./keyManager";
import { Point } from "./point";
import { Ship } from "./ship";
import { Asteroid } from "./asteroid";

class AsteroidsGame {
  constructor(canvas) {
    this.canvas = canvas;
    canvas.height = CANVAS_HEIGHT;
    canvas.width = CANVAS_WIDTH;

    this.context = canvas.getContext("2d");
    this.keyManager = new KeyManager();

    this.shipBullets = [];
    this.ship = new Ship(
      new Point(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2),
      0,
      ROCKET_HEIGHT,
      ROCKET_WIDTH,
      this.shipBullets,
      this.keyManager,
      this.canvas,
      this.context,
    );

    this.asteroids = [];

    this.level = 0;
    this.score = 0;
  }

  generateAsteroid(isLargeAsteroid) {
    const distance =
      Math.floor(
        Math.random() * (CANVAS_WIDTH / 2 - MIN_ASTEROID_SPAWN_DISTANCE),
      ) + MIN_ASTEROID_SPAWN_DISTANCE;
    const positionAngle = Math.random() * TAU;
    const center = new Point(0, distance)
      .rotate(positionAngle)
      .translate(this.ship.center.x, this.ship.center.y);
    const flightAngle = Math.random() * TAU;

    const modifier = isLargeAsteroid ? LARGE_ASTEROID_ROTATION_MODIFIER : null;
    const rotationSpeed = Math.random() * modifier;
    const size = isLargeAsteroid ? LARGE_ASTEROID_SIZE : null;
    const flightSpeed = isLargeAsteroid ? LARGE_ASTEROID_FLIGHT_SPEED : null;

    return new Asteroid(
      center,
      size,
      this.canvas,
      this.context,
      flightAngle,
      flightSpeed,
      rotationSpeed,
    );
  }

  getAsteroidCountForLevel() {
    return Math.min(Math.max(2, this.level), 5);
  }

  spawnWave() {
    const asteroidCount = this.getAsteroidCountForLevel();
    for (let i = 0; i < asteroidCount; i++) {
      this.asteroids.push(this.generateAsteroid(true));
    }
  }

  beginGame() {
    this.lastTime = performance.now();
    this.spawnWave();
    this.gameLoop(this.lastTime);
  }

  gameLoop(currentTime) {
    const dt = currentTime - this.lastTime;
    this.lastTime = currentTime;

    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.ship.update(dt);
    this.ship.draw();

    this.shipBullets.forEach((bullet) => {
      if (bullet.live) {
        bullet.update();
        bullet.draw();
      }
    });
    if (this.shipBullets.length > 10) {
      for (let i = this.shipBullets.length - 1; i >= 0; i--) {
        if (!this.shipBullets[i].live) {
          this.shipBullets.splice(i, 1);
        }
      }
    }

    this.asteroids.forEach((asteroid) => {
      if (asteroid.active) {
        asteroid.update(dt);

        const collidingBullet = asteroid.checkForCollisions(this.shipBullets);
        if (collidingBullet) {
          asteroid.destroy();
          collidingBullet.destroy();
        }

        asteroid.draw();
      }
    });
    for (let i = this.asteroids.length - 1; i >= 0; i--) {
      if (!this.asteroids[i].active) {
        this.asteroids.splice(i, 1);
      }
    }
    if (this.asteroids.length === 0) {
      this.level += 1;
      this.spawnWave();
    }

    const collisionDetected = this.ship.isCollidingWithAsteroids(
      this.asteroids,
    );
    if (collisionDetected) {
      this.ship.alive = false;
    }

    if (this.ship.alive) {
      requestAnimationFrame((t) => this.gameLoop(t));
    }
  }
}

export { AsteroidsGame };
