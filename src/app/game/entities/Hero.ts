import { Graphics, Point } from "pixi.js";
import { animate } from "motion";

export class Hero extends Graphics {
  private static readonly RADIUS = 15;
  private static readonly COLOR = 0xff0000; // Красный цвет
  private static readonly SPEED = 200; // пикселей в секунду

  private targetPosition: Point | null = null;
  private isMoving = false;

  constructor() {
    super();
    this.drawHero();
  }

  private drawHero(): void {
    this.clear();
    this.circle(0, 0, Hero.RADIUS);
    this.fill(Hero.COLOR);
  }

  public moveTo(targetX: number, targetY: number): Promise<void> {
    if (this.isMoving) {
      return Promise.resolve();
    }

    this.targetPosition = new Point(targetX, targetY);
    this.isMoving = true;

    const distance = Math.sqrt(
      Math.pow(targetX - this.x, 2) + Math.pow(targetY - this.y, 2)
    );
    const duration = distance / Hero.SPEED;

    return animate(
      this,
      { x: targetX, y: targetY },
      { duration, ease: "linear" }
    ).then(() => {
      this.isMoving = false;
      this.targetPosition = null;
    });
  }

  public getPosition(): Point {
    return new Point(this.x, this.y);
  }

  public getRadius(): number {
    return Hero.RADIUS;
  }

  public getIsMoving(): boolean {
    return this.isMoving;
  }

  public getCurrentTarget(): Point | null {
    return this.targetPosition;
  }
}