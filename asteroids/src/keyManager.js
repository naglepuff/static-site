class KeyManager {
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

export { KeyManager };
