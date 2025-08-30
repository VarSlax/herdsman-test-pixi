import { FancyButton } from "@pixi/ui";
import { animate } from "motion";
import type { AnimationPlaybackControls } from "motion/react";
import type { Ticker } from "pixi.js";
import { Container } from "pixi.js";

import { engine } from "../getEngine";
import { PausePopup } from "../popups/PausePopup";
import { SettingsPopup } from "../popups/SettingsPopup";
import { GameManager } from "../game/managers/GameManager";
import { ScoreDisplay } from "../game/ui/ScoreDisplay";

/** Экран игры Herdsman */
export class HerdsmanGameScreen extends Container {
  /** Assets bundles required by this screen */
  public static assetBundles = ["main"];

  public mainContainer: Container;
  private pauseButton: FancyButton;
  private settingsButton: FancyButton;
  private gameManager: GameManager;
  private scoreDisplay: ScoreDisplay;
  private paused = false;

  constructor() {
    super();

    this.mainContainer = new Container();
    this.addChild(this.mainContainer);

    // Создаем UI элементы
    this.createUI();

    // Создаем игровой менеджер
    this.gameManager = new GameManager(this.mainContainer, 800, 600);

    // Создаем отображение счета
    this.scoreDisplay = new ScoreDisplay();
    this.addChild(this.scoreDisplay);

    // Подключаем обработчик изменения счета
    this.gameManager.setScoreChangeHandler((score: number) => {
      this.scoreDisplay.updateScore(score);
    });
  }

  private createUI(): void {
    const buttonAnimations = {
      hover: {
        props: {
          scale: { x: 1.1, y: 1.1 },
        },
        duration: 100,
      },
      pressed: {
        props: {
          scale: { x: 0.9, y: 0.9 },
        },
        duration: 100,
      },
    };

    this.pauseButton = new FancyButton({
      defaultView: "icon-pause.png",
      anchor: 0.5,
      animations: buttonAnimations,
    });
    this.pauseButton.onPress.connect(() =>
      engine().navigation.presentPopup(PausePopup),
    );
    this.addChild(this.pauseButton);

    this.settingsButton = new FancyButton({
      defaultView: "icon-settings.png",
      anchor: 0.5,
      animations: buttonAnimations,
    });
    this.settingsButton.onPress.connect(() =>
      engine().navigation.presentPopup(SettingsPopup),
    );
    this.addChild(this.settingsButton);
  }

  /** Prepare the screen just before showing */
  public prepare() {}

  /** Update the screen */
  public update(time: Ticker) {
    if (this.paused) return;

    // Обновляем игровую логику
    this.gameManager.update(time.deltaTime / 60); // Конвертируем в секунды
  }

  /** Pause gameplay - automatically fired when a popup is presented */
  public async pause() {
    this.mainContainer.interactiveChildren = false;
    this.paused = true;
  }

  /** Resume gameplay */
  public async resume() {
    this.mainContainer.interactiveChildren = true;
    this.paused = false;
  }

  /** Fully reset */
  public reset() {}

  /** Resize the screen, fired whenever window size changes */
  public resize(width: number, height: number) {
    const centerX = width * 0.5;
    const centerY = height * 0.5;

    this.mainContainer.x = centerX;
    this.mainContainer.y = centerY;

    // Позиционируем UI элементы
    this.pauseButton.x = 30;
    this.pauseButton.y = 30;
    this.settingsButton.x = width - 30;
    this.settingsButton.y = 30;

    // Позиционируем счет в верхнем центре
    this.scoreDisplay.setPosition(centerX, 30);

    // Обновляем размеры игрового поля
    this.gameManager.resize(Math.min(width - 100, 1000), Math.min(height - 100, 700));
  }

  /** Show screen with animations */
  public async show(): Promise<void> {
    const elementsToAnimate = [
      this.pauseButton,
      this.settingsButton,
      this.scoreDisplay,
    ];

    let finalPromise!: AnimationPlaybackControls;
    for (const element of elementsToAnimate) {
      element.alpha = 0;
      finalPromise = animate(
        element,
        { alpha: 1 },
        { duration: 0.3, delay: 0.75, ease: "backOut" },
      );
    }

    await finalPromise;
  }

  /** Hide screen with animations */
  public async hide() {}

  /** Auto pause the app when window go out of focus */
  public blur() {
    if (!engine().navigation.currentPopup) {
      engine().navigation.presentPopup(PausePopup);
    }
  }
}