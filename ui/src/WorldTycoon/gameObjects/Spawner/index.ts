import { Assets, Graphics, Sprite } from "pixi.js";
import {
  BELT_WIDTH,
  BOARD_WIDTH,
  ITEM_RENDER_SIZE,
  SPAWNER_MARGIN,
  SPAWNER_SIZE,
} from "../constants";
import { Path } from "../Path";
import { Item } from "../Item";
import { Belt } from "../Belt";
import { getQuantityByLevel } from "../../utils/getQuantityByLevel";
import type { GameData } from "../../types";
import { spawnerTypes } from "../../gameInfo";

export class Spawner extends Path {
  type: string;

  spawnerLevel: number = 1;
  spawnTimer: number = 0;
  spawnInterval: number;
  itemType: string = "unknown";
  itemLevel: number = 1;
  spawnerOutputBelt: Belt;
  position: "left" | "right";

  constructor({
    type,
    y,
    position,
    gameData,
  }: {
    type: string;
    y: number;
    position: "left" | "right";
    gameData: GameData;
  }) {
    const spawnerPosition = {
      x:
        position === "left"
          ? BOARD_WIDTH / 2 - BELT_WIDTH - SPAWNER_SIZE / 2 - SPAWNER_MARGIN * 2
          : BOARD_WIDTH / 2 +
            BELT_WIDTH +
            SPAWNER_SIZE / 2 +
            SPAWNER_MARGIN * 2,
      y,
    };
    const beltStartPosition = {
      x:
        position === "left"
          ? BOARD_WIDTH / 2 - BELT_WIDTH - SPAWNER_MARGIN * 2
          : BOARD_WIDTH / 2 + BELT_WIDTH + SPAWNER_MARGIN * 2,
      y,
    };
    const beltEndPosition = {
      x: BOARD_WIDTH / 2,
      y,
    };
    const spawnerId = Math.floor(Math.random() * 1000);
    const id = `spawner-${type}-${position}-${spawnerId}`;

    super({
      id,
      start: spawnerPosition,
      end: beltStartPosition,
      speed: 0.1,
      width: SPAWNER_SIZE,
    });
    this.position = position;
    this.type = type;

    this.view.removeChildren();
    this.render();
    this.spawnerOutputBelt = new Belt({
      id: `belt-${id}-output`,
      start: beltStartPosition,
      end: beltEndPosition,
      gameData,
    });
    const spawnerInfo = spawnerTypes.find(
      (spawnerType) => spawnerType.id === type,
    );
    if (!spawnerInfo) {
      throw new Error(
        "Cannot initialize unknown spawner " +
          type +
          ". Make sure Spawner types includes this",
      );
    }
    this.itemType = spawnerInfo?.spawns;
    this.itemLevel = gameData.itemLevels[this.itemType];

    this.speed = gameData.beltSpeed;
    this.nextPath = this.spawnerOutputBelt;
    this.spawnInterval = Infinity;
    this.spawnerLevel = 1;
  }

  setSpawnerLevel(level: number) {
    this.spawnerLevel = level;
    const outputToGenerate = getQuantityByLevel(this.itemLevel);
    const processingSpeed = getQuantityByLevel(this.spawnerLevel);
    console.log(this.id, "Spawner level", level);
    console.log(
      "Output to generate:",
      outputToGenerate,
      "processing speed:",
      processingSpeed,
    );
    this.spawnInterval = (1000 * outputToGenerate) / processingSpeed;
  }

  render() {
    const graphics = new Graphics();
    const cornerRadius = 10;

    const machineColor = 0x2c3e50;
    const borderColor = 0x1a252f;

    graphics
      .roundRect(
        -SPAWNER_SIZE / 2,
        -SPAWNER_SIZE / 2,
        SPAWNER_SIZE,
        SPAWNER_SIZE,
        cornerRadius,
      )
      .fill(machineColor)
      .stroke({ width: 4, color: borderColor, alignment: 0 });

    this.view.addChild(graphics);

    const textureAlias = `spawner-${this.type}`;
    const texture = Assets.get(textureAlias);

    if (texture) {
      const icon = new Sprite(texture);

      icon.anchor.set(0.5);

      icon.width = SPAWNER_SIZE * 0.75;
      icon.height = SPAWNER_SIZE * 0.75;

      icon.x = 0;
      icon.y = 0;

      if (this.position === "right") {
        icon.rotation = Math.PI;
      }

      this.view.addChild(icon);
    }

    const indicatorGfx = new Graphics();
    const indicatorHeight = SPAWNER_SIZE * 0.4;
    const indicatorWidth = 10;
    const indicatorColor = 0x00ff00;

    indicatorGfx
      .roundRect(
        SPAWNER_SIZE / 2 - indicatorWidth / 2,
        -indicatorHeight / 2,
        indicatorWidth,
        indicatorHeight,
        5,
      )
      .fill(indicatorColor)
      .stroke({ width: 2, color: 0x004400, alignment: 0 });

    this.view.addChild(indicatorGfx);
  }

  generateItem(
    frameTimeMS: number,
    nextPathTail: Item | undefined,
  ): Item | undefined {
    this.spawnTimer += frameTimeMS;
    const minGap = ITEM_RENDER_SIZE / this.length;

    if (nextPathTail && nextPathTail?.pathProgress <= minGap) {
      return;
    }

    if (this.spawnTimer >= this.spawnInterval) {
      const newItem = new Item({
        type: this.itemType,
        level: this.itemLevel,
        currentPath: this,
      });

      this.spawnTimer = 0;
      return newItem;
    }
    return undefined;
  }
}
