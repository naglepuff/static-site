class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  rotate(angle) {
    const s = Math.sin(angle);
    const c = Math.cos(angle);
    const xNew = this.x * c - this.y * s;
    const yNew = this.x * s + this.y * c;
    return new Point(xNew, yNew);
  }

  translate(dx, dy) {
    return new Point(this.x + dx, this.y + dy);
  }
}

export { Point };
