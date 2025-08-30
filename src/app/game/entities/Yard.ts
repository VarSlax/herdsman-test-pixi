import { Graphics, Point, Rectangle } from "pixi.js";

export class Yard extends Graphics {
  private static readonly COLOR = 0xffff00; // Желтый цвет
  private static readonly ALPHA = 0.7;

  private bounds: Rectangle;

  constructor(x: number, y: number, width: number, height: number) {
    super();
    this.bounds = new Rectangle(x - width / 2, y - height / 2, width, height);
    this.position.set(x, y);
    this.drawYard(width, height);
  }

  private drawYard(width: number, height: number): void {
    this.clear();
    this.rect(-width / 2, -height / 2, width, height);
    this.fill({ color: Yard.COLOR, alpha: Yard.ALPHA });
    this.stroke({ color: 0xcccc00, width: 3 });
  }

  public containsPoint(point: Point): boolean {
    return this.bounds.contains(point.x, point.y);
  }

  public getBounds(): Rectangle {
    return this.bounds.clone();
  }

  public getCenter(): Point {
    return new Point(this.bounds.x + this.bounds.width / 2, this.bounds.y + this.bounds.height / 2);
  }
}