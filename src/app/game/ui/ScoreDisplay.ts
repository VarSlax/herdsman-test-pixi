import { Container, Text, TextStyle } from "pixi.js";

export class ScoreDisplay extends Container {
  private scoreText: Text;
  private currentScore = 0;

  constructor() {
    super();
    this.createScoreDisplay();
  }

  private createScoreDisplay(): void {
    const style = new TextStyle({
      fontFamily: "Arial",
      fontSize: 24,
      fontWeight: "bold",
      fill: 0xffffff,
      stroke: { color: 0x000000, width: 2 },
      dropShadow: {
        color: 0x000000,
        blur: 4,
        angle: Math.PI / 6,
        distance: 2,
      },
    });

    this.scoreText = new Text({
      text: "Счет: 0",
      style,
    });

    this.addChild(this.scoreText);
  }

  public updateScore(score: number): void {
    this.currentScore = score;
    this.scoreText.text = `Счет: ${score}`;
  }

  public getScore(): number {
    return this.currentScore;
  }

  public setPosition(x: number, y: number): void {
    this.position.set(x, y);
  }
}
