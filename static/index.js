const CANVAS_HEIGHT = 500;
const CANVAS_WIDTH = 700;
const ROCKET_HEIGHT = 18;
const ROCKET_WIDTH = 12;

class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    rotate(angle) {
        const s = Math.sin(angle)
        const c = Math.cos(angle);
        const xNew = this.x * c - this.y * s;
        const yNew = this.x * s + this.y * c;
        return new Point(xNew, yNew);
    }

   translate(dx, dy) {
        return new Point(this.x + dx, this.y + dy);
    } 
}


class Ship {
    constructor(center, rotation, height, width) {
        this.center = center; // Point
        this.rotation = rotation; // Angle in radians
        this.height = height; // number
        this.width = width; // number
    }

    draw(ctx) {
        const tip = new Point(0, -1 * this.height / 3)
            .rotate(this.rotation)
            .translate(this.center.x, this.center.y);
        const lowerLeft = new Point((-2 * this.width / 3), this.height)
            .rotate(this.rotation)
            .translate(this.center.x, this.center.y);
        const middle = new Point(0, (2 * this.height / 3))
            .rotate(this.rotation)
            .translate(this.center.x, this.center.y);
        const lowerRight = new Point((2 * this.width / 3), this.height)
            .rotate(this.rotation)
            .translate(this.center.x, this.center.y);

        ctx.beginPath();
        ctx.moveTo(tip.x, tip.y);
        ctx.lineTo(lowerLeft.x, lowerLeft.y);
        ctx.lineTo(middle.x, middle.y);
        ctx.lineTo(lowerRight.x, lowerRight.y);
        ctx.fill();
    }
}

const canvas = document.getElementById("canvas");
canvas.height = CANVAS_HEIGHT;
canvas.width = CANVAS_WIDTH;

const ctx = canvas.getContext("2d");

// Labels for debugging
const labelAngle = document.getElementById("label--angle");
const labelXVelocity = document.getElementById("label--vx");
const labelYVelocity = document.getElementById("label--vy");

const startingPoint = new Point(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
const startingAngle = Math.PI; // 0 radians?
let angle = startingAngle;

const ship = new Ship(startingPoint, angle, ROCKET_HEIGHT, ROCKET_WIDTH);

function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ship.draw(ctx);
    angle += 0.01;
    if (angle > 2 * Math.PI) angle -= (2 * Math.PI);
    ship.rotation = angle;
    requestAnimationFrame(loop);
}

loop();
