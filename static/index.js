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
    static dA = 0.05;
    static dV =  0.01;

    constructor(center, rotation, height, width, keyManager) {
        this.center = center; // Point
        this.rotation = rotation; // Angle in radians
        this.height = height; // number
        this.width = width; // number
        this.keyManager = keyManager; // AsteroidsKeyManager
        this.dX = 0;
        this.dY = 0;
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
            this.center.x += CANVAS_WIDTH;
        }
        if (this.center.x > CANVAS_WIDTH) {
            this.center.x -= CANVAS_WIDTH;
        }
        if (this.center.y < 0) {
            this.center.y += CANVAS_HEIGHT;
        }
        if (this.center.y > CANVAS_HEIGHT) {
            this.center.y -= CANVAS_HEIGHT;
        }
    }
}

class AsteroidsKeyManager {
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
}
const keyManager = new AsteroidsKeyManager();


const ship = new Ship(
    new Point(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2), 
    0, 
    ROCKET_HEIGHT, 
    ROCKET_WIDTH, 
    keyManager,
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
