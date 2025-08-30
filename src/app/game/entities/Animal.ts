import { Graphics, Point } from "pixi.js";
import { randomFloat } from "../../../engine/utils/random";

export enum AnimalState {
  IDLE = "idle",
  FOLLOWING = "following",
  PATROLLING = "patrolling",
  IN_YARD = "in_yard",
}

export class Animal extends Graphics {
  private static readonly RADIUS = 10;
  private static readonly COLOR = 0xffffff;
  private static readonly FOLLOW_SPEED = 150;
  private static readonly PATROL_SPEED = 50;
  private static readonly FOLLOW_DISTANCE = 30;

  private state: AnimalState = AnimalState.IDLE;
  private followTarget: Point | null = null;
  private patrolDirection: Point = new Point(1, 0);
  private patrolTimer = 0;
  private patrolChangeInterval: number;

  constructor(x: number, y: number) {
    super();
    this.position.set(x, y);
    this.patrolChangeInterval = randomFloat(2, 5);
    this.drawAnimal();
    this.generateRandomPatrolDirection();
  }

  private drawAnimal(): void {
    this.clear();
    this.circle(0, 0, Animal.RADIUS);
    this.fill(Animal.COLOR);
    this.stroke({ color: 0x000000, width: 1 });
  }

  private generateRandomPatrolDirection(): void {
    const angle = randomFloat(0, Math.PI * 2);
    this.patrolDirection.set(Math.cos(angle), Math.sin(angle));
  }

  public update(
    deltaTime: number,
    gameFieldBounds: { width: number; height: number },
  ): void {
    switch (this.state) {
      case AnimalState.PATROLLING:
        this.updatePatrol(deltaTime, gameFieldBounds);
        break;
      case AnimalState.FOLLOWING:
        this.updateFollowing(deltaTime);
        break;
    }
  }

  private updatePatrol(
    deltaTime: number,
    bounds: { width: number; height: number },
  ): void {
    this.patrolTimer += deltaTime;

    if (this.patrolTimer >= this.patrolChangeInterval) {
      this.generateRandomPatrolDirection();
      this.patrolTimer = 0;
      this.patrolChangeInterval = randomFloat(2, 5);
    }

    const speed = Animal.PATROL_SPEED * deltaTime;
    const newX = this.x + this.patrolDirection.x * speed;
    const newY = this.y + this.patrolDirection.y * speed;

    // Check bounds and reflect direction
    if (
      newX <= -bounds.width / 2 + Animal.RADIUS ||
      newX >= bounds.width / 2 - Animal.RADIUS
    ) {
      this.patrolDirection.x *= -1;
    }
    if (
      newY <= -bounds.height / 2 + Animal.RADIUS ||
      newY >= bounds.height / 2 - Animal.RADIUS
    ) {
      this.patrolDirection.y *= -1;
    }

    this.x = Math.max(
      -bounds.width / 2 + Animal.RADIUS,
      Math.min(bounds.width / 2 - Animal.RADIUS, newX),
    );
    this.y = Math.max(
      -bounds.height / 2 + Animal.RADIUS,
      Math.min(bounds.height / 2 - Animal.RADIUS, newY),
    );
  }

  private updateFollowing(deltaTime: number): void {
    if (!this.followTarget) return;

    const dx = this.followTarget.x - this.x;
    const dy = this.followTarget.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > Animal.FOLLOW_DISTANCE) {
      const speed = Animal.FOLLOW_SPEED * deltaTime;
      const moveX = (dx / distance) * speed;
      const moveY = (dy / distance) * speed;

      this.x += moveX;
      this.y += moveY;
    }
  }

  public startFollowing(target: Point): void {
    this.state = AnimalState.FOLLOWING;
    this.followTarget = target;
  }

  public stopFollowing(): void {
    this.state = AnimalState.IDLE;
    this.followTarget = null;
  }

  public startPatrolling(): void {
    this.state = AnimalState.PATROLLING;
    this.generateRandomPatrolDirection();
  }

  public enterYard(): void {
    this.state = AnimalState.IN_YARD;
    this.followTarget = null;
  }

  public getState(): AnimalState {
    return this.state;
  }

  public getPosition(): Point {
    return new Point(this.x, this.y);
  }

  public getRadius(): number {
    return Animal.RADIUS;
  }

  public setFollowTarget(target: Point): void {
    this.followTarget = target;
  }
}
