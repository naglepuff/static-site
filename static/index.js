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
  var LARGE_ASTEROID_SIZE = 50;
  var LARGE_ASTEROID_FLIGHT_SPEED = 1;
  var LARGE_ASTEROID_ROTATION_MODIFIER = 5e-3;
  var MIN_ASTEROID_SPAWN_DISTANCE = 200;
  var LARGE_ASTEROID_RADIUS_CLAMP = 0.5;
  var TAU = 2 * Math.PI;

  // src/ship.js
  var Ship = class _Ship {
    static dA = 0.05;
    static dV = 0.01;
    constructor(center, rotation, height, width, keyManager2, canvas2, context) {
      this.center = center;
      this.rotation = rotation;
      this.height = height;
      this.width = width;
      this.keyManager = keyManager2;
      this.dX = 0;
      this.dY = 0;
      this.canvas = canvas2;
      this.context = context;
      this.colliding = false;
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
    update() {
      if (!this.keyManager) {
        return;
      }
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
  var labelGameMessage = document.getElementById("label--game-message");
  var keyManager = new KeyManager();
  var ship = new Ship(
    new Point(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2),
    0,
    ROCKET_HEIGHT,
    ROCKET_WIDTH,
    keyManager,
    canvas,
    ctx
  );
  function generateAsteroid(canvas2, context, around, distance) {
    const positionAngle = Math.random() * TAU;
    const center = new Point(0, distance).rotate(positionAngle).translate(around.x, around.y);
    const flightAngle = Math.random() * TAU;
    const rotationSpeed = Math.random() * LARGE_ASTEROID_ROTATION_MODIFIER;
    const size = LARGE_ASTEROID_SIZE;
    const flightSpeed = LARGE_ASTEROID_FLIGHT_SPEED;
    return new Asteroid(
      center,
      size,
      canvas2,
      context,
      flightAngle,
      flightSpeed,
      rotationSpeed
    );
  }
  var asteroids = [generateAsteroid(canvas, ctx, ship.center, 300)];
  function updateLabels() {
    labelAngle.innerHTML = `Angle: ${ship.rotation.toFixed(2)}`;
    labelXVelocity.innerHTML = `V_x: ${ship.dX.toFixed(2)}`;
    labelYVelocity.innerHTML = `V_y: ${ship.dY.toFixed(2)}`;
    labelColliding.innerHTML = `Colliding: ${ship.colliding ? "colliding" : "safe"}`;
    labelAsteroidCount.innerHTML = `Asteroid count: ${asteroids.length}`;
  }
  function setGameMessage(message) {
    labelGameMessage.innerHTML = message;
  }
  function addAsteroid() {
    const distance = Math.floor(Math.random() * CANVAS_WIDTH - MIN_ASTEROID_SPAWN_DISTANCE) + MIN_ASTEROID_SPAWN_DISTANCE;
    asteroids.push(generateAsteroid(canvas, ctx, ship.center, distance));
  }
  function addAsteroidIfPlaying() {
    console.log("adding asteroid!");
    if (ship.alive) {
      addAsteroid();
    }
    setTimeout(addAsteroidIfPlaying, 1e4);
  }
  addAsteroidIfPlaying();
  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ship.update();
    ship.draw();
    asteroids.forEach((asteroid) => {
      asteroid.update();
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
  loop();
})();
