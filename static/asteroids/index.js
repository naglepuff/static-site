(() => {
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

  // src/constants.js
  var CANVAS_HEIGHT = 500;
  var CANVAS_WIDTH = 700;
  var ROCKET_HEIGHT = 15;
  var ROCKET_WIDTH = 10;
  var BULLET_RADIUS = 2;
  var BULLET_IMPULSE = 2.5;
  var TAU = 2 * Math.PI;

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
        this.live = false;
      }
    }
  };

  // src/ship.js
  var Ship = class _Ship {
    static dA = 0.05;
    static dV = 0.01;
    constructor(center, rotation, height, width, bullets, keyManager2, canvas2, context) {
      this.center = center;
      this.rotation = rotation;
      this.height = height;
      this.width = width;
      this.bullets = bullets;
      this.keyManager = keyManager2;
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
        console.log(this.bullets);
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
    _isCollidingWithAsteroid(asteroid) {
      let intersections = 0;
      const asteroidShapePoints = asteroid.points.map((point) => {
        return point.rotate(asteroid.angle).translate(asteroid.center.x, asteroid.center.y);
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
          if (this.center.y === minY) {
            return this.center.x < maxX && this.center.x > minX;
          }
        }
        if (dX === 0) {
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
    isCollidingWithAsteroids(asteroids2) {
      const detections = asteroids2.map(
        (asteroid) => this._isCollidingWithAsteroid(asteroid)
      );
      this.colliding = detections.some((val) => !!val);
      return this.colliding;
    }
  };

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

  // src/index.js
  var canvas = document.getElementById("canvas");
  canvas.height = CANVAS_HEIGHT;
  canvas.width = CANVAS_WIDTH;
  var ctx = canvas.getContext("2d");
  var labelAngle = document.getElementById("label--angle");
  var labelXVelocity = document.getElementById("label--vx");
  var labelYVelocity = document.getElementById("label--vy");
  var labelColliding = document.getElementById("label--collision");
  var labelAsteroidCount = document.getElementById("label--asteroid-count");
  var labelBulletCount = document.getElementById("label--bullet-count");
  var labelGameMessage = document.getElementById("label--game-message");
  var keyManager = new KeyManager();
  var shipBullets = [];
  var ship = new Ship(
    new Point(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2),
    0,
    ROCKET_HEIGHT,
    ROCKET_WIDTH,
    shipBullets,
    keyManager,
    canvas,
    ctx
  );
  function updateLabels() {
    labelAngle.innerHTML = `Angle: ${ship.rotation.toFixed(2)}`;
    labelXVelocity.innerHTML = `V_x: ${ship.dX.toFixed(2)}`;
    labelYVelocity.innerHTML = `V_y: ${ship.dY.toFixed(2)}`;
    labelColliding.innerHTML = `Colliding: ${ship.colliding ? "colliding" : "safe"}`;
    labelAsteroidCount.innerHTML = `Asteroid count: ${asteroids.length}`;
    labelBulletCount.innerHTML = `Bullet count: ${shipBullets.length}`;
  }
  function setGameMessage(message) {
    labelGameMessage.innerHTML = message;
  }
  var asteroids = [];
  var lastTime = performance.now();
  function loop(currentTime) {
    const dt = currentTime - lastTime;
    lastTime = currentTime;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ship.update(dt);
    ship.draw();
    shipBullets.forEach((bullet) => {
      if (bullet.live) {
        bullet.update();
        bullet.draw();
      }
    });
    if (shipBullets.length > 10) {
      console.log("cleaning up bullets");
      for (let i = shipBullets.length - 1; i >= 0; i--) {
        if (!shipBullets[i].live) {
          console.log(`cleaning up bullet ${i}`);
          shipBullets.splice(i, 1);
        }
      }
    }
    asteroids.forEach((asteroid) => {
      asteroid.update(dt);
      asteroid.draw();
    });
    const collisionDetected = ship.isCollidingWithAsteroids(asteroids);
    if (collisionDetected) {
      ship.alive = false;
      setGameMessage("Game Over!");
    }
    updateLabels();
    requestAnimationFrame(loop);
  }
  loop(lastTime);
})();
