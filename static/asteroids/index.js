(() => {
  // src/constants.js
  var CANVAS_HEIGHT = 500;
  var CANVAS_WIDTH = 700;
  var ROCKET_HEIGHT = 15;
  var ROCKET_WIDTH = 10;
  var LARGE_ASTEROID_SIZE = 50;
  var LARGE_ASTEROID_FLIGHT_SPEED = 1;
  var LARGE_ASTEROID_ROTATION_MODIFIER = 5e-3;
  var MIN_ASTEROID_SPAWN_DISTANCE = 200;
  var LARGE_ASTEROID_RADIUS_CLAMP = 0.5;
  var BULLET_RADIUS = 2;
  var BULLET_IMPULSE = 2.5;
  var TAU = 2 * Math.PI;

  // src/keyManager.js
  var KeyManager = class {
    constructor() {
      this.cw = false;
      this.ccw = false;
      this.acc = false;
      this.shoot = false;
      this.setup();
    }
    setup() {
      document.addEventListener("keydown", (event) => {
        if (event.key === "ArrowRight") {
          this.cw = true;
        }
        if (event.key === "ArrowLeft") {
          this.ccw = true;
        }
        if (event.key === "ArrowUp") {
          this.acc = true;
        }
        if (event.key === "z") {
          this.shoot = true;
        }
      });
      document.addEventListener("keyup", (event) => {
        if (event.key === "ArrowRight") {
          this.cw = false;
        }
        if (event.key === "ArrowLeft") {
          this.ccw = false;
        }
        if (event.key === "ArrowUp") {
          this.acc = false;
        }
        if (event.key === "z") {
          this.shoot = false;
        }
      });
    }
  };

  // src/point.js
  var Point = class _Point {
    constructor(x, y) {
      this.x = x;
      this.y = y;
    }
    rotate(angle) {
      const s = Math.sin(angle);
      const c = Math.cos(angle);
      const xNew = this.x * c - this.y * s;
      const yNew = this.x * s + this.y * c;
      return new _Point(xNew, yNew);
    }
    translate(dx, dy) {
      return new _Point(this.x + dx, this.y + dy);
    }
  };

  // src/bullet.js
  var Bullet = class {
    constructor(center, flightAngle, flightSpeed, context, canvas2) {
      this.center = center;
      this.flightAngle = flightAngle;
      this.flightSpeed = flightSpeed;
      this.context = context;
      this.canvas = canvas2;
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
      if (this.center.x < 0 || this.center.x > this.canvas.width || this.center.y < 0 || this.center.y > this.canvas.height) {
        this.destroy();
      }
    }
    destroy() {
      this.live = false;
    }
  };

  // src/utils.js
  function isCollidingWithAsteroid(point, asteroid) {
    let intersections = 0;
    const asteroidShapePoints = asteroid.points.map((point2) => {
      return point2.rotate(asteroid.angle).translate(asteroid.center.x, asteroid.center.y);
    });
    const asteroidSegments = [];
    for (let i = 0; i < asteroidShapePoints.length; i++) {
      asteroidSegments.push([
        asteroidShapePoints[i],
        asteroidShapePoints[(i + 1) % asteroidShapePoints.length]
      ]);
    }
    for (let i = 0; i < asteroidSegments.length; i++) {
      const segment = asteroidSegments[i];
      const dY = segment[0].y - segment[1].y;
      const dX = segment[0].x - segment[1].x;
      const maxY = Math.max(segment[0].y, segment[1].y);
      const minY = Math.min(segment[0].y, segment[1].y);
      const maxX = Math.max(segment[0].x, segment[1].x);
      const minX = Math.min(segment[0].x, segment[1].x);
      if (dY === 0) {
        if (point.y === minY) {
          return point.x < maxX && point.x > minX;
        }
      }
      if (dX === 0) {
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

  // src/ship.js
  var Ship = class _Ship {
    static dA = 0.05;
    static dV = 0.01;
    constructor(center, rotation, height, width, bullets, keyManager, canvas2, context) {
      this.center = center;
      this.rotation = rotation;
      this.height = height;
      this.width = width;
      this.bullets = bullets;
      this.keyManager = keyManager;
      this.dX = 0;
      this.dY = 0;
      this.canvas = canvas2;
      this.context = context;
      this.colliding = false;
      this.shootCooldown = 0;
      this.alive = true;
    }
    draw() {
      if (!this.alive) {
        return;
      }
      const tip = new Point(0, -1 * this.height / 3).rotate(this.rotation).translate(this.center.x, this.center.y);
      const lowerLeft = new Point(-2 * this.width / 3, this.height).rotate(this.rotation).translate(this.center.x, this.center.y);
      const middle = new Point(0, 2 * this.height / 3).rotate(this.rotation).translate(this.center.x, this.center.y);
      const lowerRight = new Point(2 * this.width / 3, this.height).rotate(this.rotation).translate(this.center.x, this.center.y);
      this.context.beginPath();
      this.context.moveTo(tip.x, tip.y);
      this.context.lineTo(lowerLeft.x, lowerLeft.y);
      this.context.lineTo(middle.x, middle.y);
      this.context.lineTo(lowerRight.x, lowerRight.y);
      this.context.fill();
    }
    _updatePosition() {
      if (this.keyManager.cw) {
        this.rotation += _Ship.dA;
        if (this.rotation > TAU) {
          this.rotation -= TAU;
        }
      }
      if (this.keyManager.ccw) {
        this.rotation -= _Ship.dA;
        if (this.rotation < 0) {
          this.rotation += TAU;
        }
      }
      if (this.keyManager.acc) {
        this.dY -= Math.cos(this.rotation) * _Ship.dV;
        this.dX += Math.sin(this.rotation) * _Ship.dV;
      }
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
        const tip = new Point(0, -1 * this.height / 3).rotate(this.rotation).translate(this.center.x, this.center.y);
        const speed = Math.sqrt(this.dX ** 2 + this.dY ** 2);
        const bullet = new Bullet(
          tip,
          this.rotation + TAU * 0.75,
          speed + BULLET_IMPULSE,
          this.context,
          this.canvas
        );
        this.bullets.push(bullet);
        this.shootCooldown = 500;
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
        (asteroid) => asteroid.active && isCollidingWithAsteroid(this.center, asteroid)
      );
      this.colliding = detections.some((val) => !!val);
      return this.colliding;
    }
  };

  // src/asteroid.js
  function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
  }
  var Asteroid = class {
    constructor(center, maxRadius, canvas2, context, flightAngle, flightSpeed, rotationSpeed) {
      this.center = center;
      this.maxRadius = maxRadius;
      this.context = context;
      this.canvas = canvas2;
      this.flightAngle = flightAngle;
      this.flightSpeed = flightSpeed;
      this.rotationSpeed = rotationSpeed;
      this.points = [];
      this.active = true;
      this._generatePoints(getRandomInt(10, 20));
      this.angle = 0;
    }
    _generatePoints(numPoints) {
      for (let i = 0; i < numPoints; i++) {
        const angle = i * (TAU / numPoints);
        const length = Math.floor(
          this.maxRadius * (Math.random() * LARGE_ASTEROID_RADIUS_CLAMP + LARGE_ASTEROID_RADIUS_CLAMP)
        );
        const point = new Point(0, length).rotate(angle);
        this.points.push(point);
      }
    }
    draw() {
      this.context.beginPath();
      const startingPoint = this.points[0].rotate(this.angle).translate(this.center.x, this.center.y);
      this.context.moveTo(startingPoint.x, startingPoint.y);
      for (let i = 1; i < this.points.length; i++) {
        const realPoint = this.points[i].rotate(this.angle).translate(this.center.x, this.center.y);
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
    checkForCollisions(bullets) {
      for (let bullet of bullets) {
        if (!bullet.live) {
          continue;
        }
        const isColliding = isCollidingWithAsteroid(bullet.center, this);
        if (isColliding) {
          return bullet;
        }
      }
      return null;
    }
    destroy() {
      this.active = false;
    }
  };

  // src/asteroidsGame.js
  var AsteroidsGame = class {
    constructor(canvas2) {
      this.canvas = canvas2;
      canvas2.height = CANVAS_HEIGHT;
      canvas2.width = CANVAS_WIDTH;
      this.context = canvas2.getContext("2d");
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
        this.context
      );
      this.asteroids = [];
      this.level = 0;
      this.score = 0;
    }
    generateAsteroid(isLargeAsteroid) {
      const distance = Math.floor(
        Math.random() * (CANVAS_WIDTH / 2 - MIN_ASTEROID_SPAWN_DISTANCE)
      ) + MIN_ASTEROID_SPAWN_DISTANCE;
      const positionAngle = Math.random() * TAU;
      const center = new Point(0, distance).rotate(positionAngle).translate(this.ship.center.x, this.ship.center.y);
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
        rotationSpeed
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
        this.asteroids
      );
      if (collisionDetected) {
        this.ship.alive = false;
      }
      if (this.ship.alive) {
        requestAnimationFrame((t) => this.gameLoop(t));
      }
    }
  };

  // src/index.js
  var canvas = document.getElementById("canvas");
  var game = new AsteroidsGame(canvas);
  game.beginGame();
})();
