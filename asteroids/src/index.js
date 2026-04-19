import { Point } from "./point.js";
import { Ship } from "./ship.js";
import { Asteroid } from "./asteroid.js";
import { KeyManager } from "./keyManager.js";
import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  ROCKET_HEIGHT,
  ROCKET_WIDTH,
  LARGE_ASTEROID_FLIGHT_SPEED,
  LARGE_ASTEROID_SIZE,
  LARGE_ASTEROID_ROTATION_MODIFIER,
  MIN_ASTEROID_SPAWN_DISTANCE,
  TAU,
} from "./constants.js";

const canvas = document.getElementById("canvas");
canvas.height = CANVAS_HEIGHT;
canvas.width = CANVAS_WIDTH;
const ctx = canvas.getContext("2d");

// Labels for debugging
const labelAngle = document.getElementById("label--angle");
const labelXVelocity = document.getElementById("label--vx");
const labelYVelocity = document.getElementById("label--vy");
const labelColliding = document.getElementById("label--collision");
const labelAsteroidCount = document.getElementById("label--asteroid-count");
const labelGameMessage = document.getElementById("label--game-message");

const keyManager = new KeyManager();

const ship = new Ship(
  new Point(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2),
  0,
  ROCKET_HEIGHT,
  ROCKET_WIDTH,
  keyManager,
  canvas,
  ctx,
);

// const debugAsteroids = [
//   new Asteroid(
//     new Point(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2),
//     50,
//     canvas,
//     ctx,
//     0,
//     0,
//     0,
//   ),
//   new Asteroid(
//     new Point(CANVAS_WIDTH / 2 + 200, CANVAS_HEIGHT / 2),
//     50,
//     canvas,
//     ctx,
//     0,
//     0,
//     0,
//   ),
// ];

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

function spawnWave(canvas, context, ship, asteroidsList) {
  // TODO
  // Pick a certain distance around the ship, then pick random
  // angles. Draw asteroids centered around those points, going
  // in random directions.
}

const asteroids = [];

function generateAsteroid(canvas, context, around, distance) {
  const positionAngle = Math.random() * TAU;
  const center = new Point(0, distance)
    .rotate(positionAngle)
    .translate(around.x, around.y);
  const flightAngle = Math.random() * TAU;
  const rotationSpeed = Math.random() * LARGE_ASTEROID_ROTATION_MODIFIER;
  const size = LARGE_ASTEROID_SIZE;
  const flightSpeed = LARGE_ASTEROID_FLIGHT_SPEED;
  return new Asteroid(
    center,
    size,
    canvas,
    context,
    flightAngle,
    flightSpeed,
    rotationSpeed,
  );
}

function addAsteroid() {
  const distance =
    Math.floor(Math.random() * CANVAS_WIDTH - MIN_ASTEROID_SPAWN_DISTANCE) +
    MIN_ASTEROID_SPAWN_DISTANCE;
  asteroids.push(generateAsteroid(canvas, ctx, ship.center, distance));
}

function addAsteroidIfPlaying() {
  console.log("adding asteroid!");
  if (ship.alive) {
    addAsteroid();
  }
  setTimeout(addAsteroidIfPlaying, 10000);
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
