import { Graphics } from "pixi.js";
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

export class Spawner extends Path {
  spawnTimer: number = 0; // Timer to track when to spawn the next item
  spawnInterval: number; // Time interval (in ms) between spawns
  itemType: string = "unknown"; // Type of item to spawn, can be extended for different item types
  spawnerOutputBelt: Belt;

  constructor({
    id,
    y,
    position,
    itemType,
    beltSpeed,
    spawnSpeed,
  }: {
    id: string;
    y: number;
    position: "left" | "right";
    itemType: string;
    beltSpeed: number;
    spawnSpeed: number;
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

    super(id, spawnerPosition, beltStartPosition, 0.1, SPAWNER_SIZE);
    this.spawnerOutputBelt = new Belt(
      `belt-${id}-output`,
      beltStartPosition,
      beltEndPosition,
      beltSpeed,
    );
    this.itemType = itemType;

    this.speed = beltSpeed;
    this.nextPath = this.spawnerOutputBelt;
    this.spawnInterval = 1000 / spawnSpeed;
  }

  render() {
    const graphics = new Graphics();

    // 1. Base Plate (The Machine Body)
    // Centered at 0,0 (the start.x, start.y of the path)
    graphics
      .roundRect(
        -SPAWNER_SIZE / 2,
        -SPAWNER_SIZE / 2,
        SPAWNER_SIZE,
        SPAWNER_SIZE,
        8,
      )
      .fill(0x444444)
      .stroke({ width: 4, color: 0x222222 });

    // 2. The Output Port (Indicates which way it faces)
    // We draw a smaller rectangle on the "forward" side (+X local)
    graphics
      .rect(
        SPAWNER_SIZE / 4,
        -SPAWNER_SIZE / 4,
        SPAWNER_SIZE / 4,
        SPAWNER_SIZE / 2,
      )
      .fill(0x666666);

    // 3. Status Light (Glowing green)
    graphics.circle(0, 0, 6).fill(0x00ff00);

    this.view.addChild(graphics);
  }

  generateItem(
    frameTime: number,
    nextPathTail: Item | undefined,
  ): Item | undefined {
    this.spawnTimer += frameTime;
    const minGap = ITEM_RENDER_SIZE / this.length; // Minimum gap

    // Check if we have some space first.
    if (nextPathTail && nextPathTail?.pathProgress <= minGap) {
      return;
    }

    if (this.spawnTimer >= this.spawnInterval) {
      // Create the item at the spawner's start point
      const newItem = new Item(
        this.itemType,
        this, // Set this spawner as the item's current path
      );

      this.spawnTimer = 0;
      return newItem;
    }
    return undefined;
  }
}
