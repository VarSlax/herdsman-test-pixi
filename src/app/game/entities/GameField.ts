import { Graphics, FederatedPointerEvent } from "pixi.js";

export class GameField extends Graphics {
  private static readonly COLOR = 0x00aa00;
  private static readonly ALPHA = 0.8;

  private fieldWidth: number;
  private fieldHeight: number;
  private onFieldClick: ((x: number, y: number) => void) | null = null;

  constructor(width: number, height: number) {
    super();
    this.fieldWidth = width;
    this.fieldHeight = height;
    this.drawField();
    this.setupInteractivity();
  }

  private drawField(): void {
    this.clear();
    this.rect(
      -this.fieldWidth / 2,
      -this.fieldHeight / 2,
      this.fieldWidth,
      this.fieldHeight,
    );
    this.fill({ color: GameField.COLOR, alpha: GameField.ALPHA });
    this.stroke({ color: 0x006600, width: 2 });
  }

  private setupInteractivity(): void {
    this.eventMode = "static";
    this.cursor = "pointer";
    this.on("pointerdown", this.handleClick.bind(this));
  }

  private handleClick(event: FederatedPointerEvent): void {
    if (this.onFieldClick) {
      const localPos = this.toLocal(event.global);
      this.onFieldClick(localPos.x, localPos.y);
    }
  }

  public setClickHandler(handler: (x: number, y: number) => void): void {
    this.onFieldClick = handler;
  }

  public resize(width: number, height: number): void {
    this.fieldWidth = width;
    this.fieldHeight = height;
    this.drawField();
  }

  public getFieldBounds(): { width: number; height: number } {
    return { width: this.fieldWidth, height: this.fieldHeight };
  }

  public isPointInField(x: number, y: number): boolean {
    return (
      x >= -this.fieldWidth / 2 &&
      x <= this.fieldWidth / 2 &&
      y >= -this.fieldHeight / 2 &&
      y <= this.fieldHeight / 2
    );
  }
}
