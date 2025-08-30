import { Container, Point } from "pixi.js";
import { Hero } from "../entities/Hero";
import { Animal, AnimalState } from "../entities/Animal";
import { Yard } from "../entities/Yard";
import { GameField } from "../entities/GameField";
import { randomFloat, randomInt } from "../../../engine/utils/random";

export class GameManager {
  private static readonly MAX_ANIMALS_IN_GROUP = 5;
  private static readonly ANIMAL_FOLLOW_DISTANCE = 40;
  private static readonly INITIAL_ANIMAL_COUNT = 8;
  private static readonly SPAWN_INTERVAL = 10; // секунд

  private gameContainer: Container;
  private gameField: GameField;
  private hero: Hero;
  private yard: Yard;
  private animals: Animal[] = [];
  private followingAnimals: Animal[] = [];
  private score = 0;
  private spawnTimer = 0;

  private onScoreChange: ((score: number) => void) | null = null;

  constructor(container: Container, fieldWidth: number, fieldHeight: number) {
    this.gameContainer = container;

    // Создаем игровое поле
    this.gameField = new GameField(fieldWidth, fieldHeight);
    this.gameContainer.addChild(this.gameField);

    // Создаем загон в правом верхнем углу
    const yardWidth = 120;
    const yardHeight = 120;
    const yardX = fieldWidth / 2 - yardWidth / 2 - 20;
    const yardY = -fieldHeight / 2 + yardHeight / 2 + 20;
    this.yard = new Yard(yardX, yardY, yardWidth, yardHeight);
    this.gameContainer.addChild(this.yard);

    // Создаем героя в центре поля
    this.hero = new Hero();
    this.hero.position.set(0, 0);
    this.gameContainer.addChild(this.hero);

    // Настраиваем обработчик кликов по полю
    this.gameField.setClickHandler(this.handleFieldClick.bind(this));

    // Создаем начальных животных
    this.spawnInitialAnimals();
  }

  private handleFieldClick(x: number, y: number): void {
    // Перемещаем героя к точке клика
    this.hero.moveTo(x, y);
  }

  private spawnInitialAnimals(): void {
    const fieldBounds = this.gameField.getFieldBounds();

    for (let i = 0; i < GameManager.INITIAL_ANIMAL_COUNT; i++) {
      this.spawnAnimal(fieldBounds);
    }
  }

  private spawnAnimal(fieldBounds: { width: number; height: number }): void {
    let x: number, y: number;
    let attempts = 0;
    const maxAttempts = 50;

    // Пытаемся найти позицию, которая не пересекается с загоном и героем
    do {
      x = randomFloat(-fieldBounds.width / 2 + 30, fieldBounds.width / 2 - 30);
      y = randomFloat(-fieldBounds.height / 2 + 30, fieldBounds.height / 2 - 30);
      attempts++;
    } while (
      attempts < maxAttempts &&
      (this.yard.containsPoint(new Point(x, y)) ||
       this.getDistance(new Point(x, y), this.hero.getPosition()) < 100)
    );

    const animal = new Animal(x, y);
    animal.startPatrolling();
    this.animals.push(animal);
    this.gameContainer.addChild(animal);
  }

  public update(deltaTime: number): void {
    const heroPos = this.hero.getPosition();
    const fieldBounds = this.gameField.getFieldBounds();

    // Обновляем спавн таймер
    this.spawnTimer += deltaTime;
    if (this.spawnTimer >= GameManager.SPAWN_INTERVAL) {
      this.spawnAnimal(fieldBounds);
      this.spawnTimer = 0;
    }

    // Обновляем животных
    for (let i = this.animals.length - 1; i >= 0; i--) {
      const animal = this.animals[i];
      animal.update(deltaTime, fieldBounds);

      // Проверяем, находится ли животное в загоне
      if (animal.getState() === AnimalState.FOLLOWING &&
          this.yard.containsPoint(animal.getPosition())) {
        this.deliverAnimalToYard(animal, i);
        continue;
      }

      // Проверяем, может ли животное начать следовать за героем
      if (animal.getState() === AnimalState.PATROLLING &&
          this.followingAnimals.length < GameManager.MAX_ANIMALS_IN_GROUP) {
        const distance = this.getDistance(animal.getPosition(), heroPos);
        if (distance <= GameManager.ANIMAL_FOLLOW_DISTANCE) {
          this.startAnimalFollowing(animal);
        }
      }

      // Обновляем цель следования для следующих животных
      if (animal.getState() === AnimalState.FOLLOWING) {
        this.updateFollowingTarget(animal);
      }
    }
  }

  private deliverAnimalToYard(animal: Animal, index: number): void {
    animal.enterYard();
    this.gameContainer.removeChild(animal);
    this.animals.splice(index, 1);

    // Удаляем из списка следующих животных
    const followIndex = this.followingAnimals.indexOf(animal);
    if (followIndex !== -1) {
      this.followingAnimals.splice(followIndex, 1);
    }

    // Увеличиваем счет
    this.score++;
    if (this.onScoreChange) {
      this.onScoreChange(this.score);
    }
  }

  private startAnimalFollowing(animal: Animal): void {
    animal.startFollowing(this.hero.getPosition());
    this.followingAnimals.push(animal);
  }

  private updateFollowingTarget(animal: Animal): void {
    const heroPos = this.hero.getPosition();
    const animalIndex = this.followingAnimals.indexOf(animal);

    if (animalIndex === 0) {
      // Первое животное следует за героем
      animal.setFollowTarget(heroPos);
    } else if (animalIndex > 0) {
      // Остальные животные следуют за предыдущим в цепочке
      const previousAnimal = this.followingAnimals[animalIndex - 1];
      animal.setFollowTarget(previousAnimal.getPosition());
    }
  }

  private getDistance(point1: Point, point2: Point): number {
    const dx = point1.x - point2.x;
    const dy = point1.y - point2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  public setScoreChangeHandler(handler: (score: number) => void): void {
    this.onScoreChange = handler;
  }

  public getScore(): number {
    return this.score;
  }

  public resize(width: number, height: number): void {
    this.gameField.resize(width, height);

    // Перемещаем загон в новую позицию
    const yardBounds = this.yard.getBounds();
    const newYardX = width / 2 - yardBounds.width / 2 - 20;
    const newYardY = -height / 2 + yardBounds.height / 2 + 20;
    this.yard.position.set(newYardX, newYardY);
  }
}