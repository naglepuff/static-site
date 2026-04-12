import { Point } from "./point.js";
import { Ship } from "./ship.js";
import { KeyManager } from "./keyManager.js";

const CANVAS_HEIGHT = 500;
const CANVAS_WIDTH = 700;
const ROCKET_HEIGHT = 18;
const ROCKET_WIDTH = 12;

const canvas = document.getElementById("canvas");
canvas.height = CANVAS_HEIGHT;
canvas.width = CANVAS_WIDTH;
const ctx = canvas.getContext("2d");

// Labels for debugging
const labelAngle = document.getElementById("label--angle");
const labelXVelocity = document.getElementById("label--vx");
const labelYVelocity = document.getElementById("label--vy");

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

function updateLabels() {
  labelAngle.innerHTML = `Angle: ${ship.rotation.toFixed(2)}`;
  labelXVelocity.innerHTML = `V_x: ${ship.dX.toFixed(2)}`;
  labelYVelocity.innerHTML = `V_y: ${ship.dY.toFixed(2)}`;
}

function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ship.update();
  ship.draw(ctx);

  updateLabels();

  requestAnimationFrame(loop);
}
loop();
