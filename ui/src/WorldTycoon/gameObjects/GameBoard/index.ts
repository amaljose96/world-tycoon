import {
  BELT_WIDTH,
  BOARD_WIDTH,
  FACTORY_MARGIN,
  FACTORY_SIZE,
  ITEM_RENDER_SIZE,
  SCREEN_MARGIN,
} from "../constants";
import { Belt } from "../Belt";
import { Spawner } from "../Spawner";
import { Item } from "../Item";
import type { GameData, SpawnerData } from "../../types";
import type { Path } from "../Path";
import type { TilingSprite } from "pixi.js";

export class GameBoard {
  gameData: GameData;
  belts: Belt[];
  items: Item[];
  spawners: Spawner[];
  numberOfSegments: number;

  gameBoardHeight: number;

  constructor({ gameData }: { gameData: GameData }) {
    this.gameData = gameData;
    this.belts = [];
    this.items = [];
    this.spawners = [];
    this.numberOfSegments = 1;
    this.gameBoardHeight = 1000;
    this.constructBoard();
  }

  calculateGameBoardHeight() {
    const spawnerCount = this.gameData.spawners.length;
    const spawnerRows = Math.ceil(spawnerCount / 2);
    const spawnerHeight =
      spawnerRows * FACTORY_SIZE +
      (spawnerRows - 1) * FACTORY_MARGIN +
      SCREEN_MARGIN;
    const firstSnakeHeight =
      BELT_WIDTH + FACTORY_SIZE * 2.5 + FACTORY_MARGIN * 4;

    const outputHeight =
      FACTORY_SIZE * 2 + FACTORY_MARGIN * 4 + SCREEN_MARGIN * 2;

    this.gameBoardHeight = spawnerHeight + firstSnakeHeight + outputHeight;
    console.log("Calculated game board height: ", this.gameBoardHeight);
  }

  constructSpawnerMasterBelt(): {
    masterSpawnerBelt: Belt | undefined;
    spawnerBelts: Belt[];
  } {
    const spawnerBelts: Belt[] = [];
    let spawnerY = this.gameBoardHeight - SCREEN_MARGIN; // Start from the top, accounting for margin and half factory size

    const spawnerRows: {
      leftSpawnerData: SpawnerData;
      rightSpawnerData?: SpawnerData;
    }[] = [];

    for (let i = 0; i < this.gameData.spawners.length; i += 2) {
      spawnerRows.push({
        leftSpawnerData: this.gameData.spawners[i],
        // Only add right if it exists (handles odd numbers automatically)
        rightSpawnerData: this.gameData.spawners[i + 1] || undefined,
      });
    }
    let previousRowMasterBelt: Belt | undefined = undefined;

    spawnerRows.forEach((row, rowIndex) => {
      const leftSpawner = new Spawner({
        y: spawnerY,
        position: "left",
        type: row.leftSpawnerData.type,
        gameData: this.gameData,
      });

      const rightSpawner = row.rightSpawnerData
        ? new Spawner({
            y: spawnerY,
            position: "right",
            type: row.rightSpawnerData.type,
            gameData: this.gameData,
          })
        : undefined;

      spawnerY -= FACTORY_SIZE + FACTORY_MARGIN;

      leftSpawner.setSpawnerLevel(row.leftSpawnerData.level);
      this.spawners.push(leftSpawner);

      if (row.rightSpawnerData && rightSpawner) {
        rightSpawner.setSpawnerLevel(row.rightSpawnerData?.level);
        this.spawners.push(rightSpawner);
      }

      const rowMasterBelt = new Belt({
        id: `master-spawner-belt-row-${rowIndex}`,

        start: {
          x: BOARD_WIDTH / 2,
          y: leftSpawner.spawnerOutputBelt.start.y,
        },
        end: {
          x: BOARD_WIDTH / 2,
          y: spawnerY,
        },
        gameData: this.gameData,
      });
      leftSpawner.spawnerOutputBelt.nextPath = rowMasterBelt;
      spawnerBelts.push(leftSpawner.spawnerOutputBelt);
      if (rightSpawner) {
        rightSpawner.spawnerOutputBelt.nextPath = rowMasterBelt;
        spawnerBelts.push(rightSpawner.spawnerOutputBelt);
      }
      spawnerBelts.push(rowMasterBelt);
      if (previousRowMasterBelt) {
        previousRowMasterBelt.nextPath = rowMasterBelt;
      }
      previousRowMasterBelt = rowMasterBelt;
    });
    return { masterSpawnerBelt: previousRowMasterBelt, spawnerBelts };
  }

  constructBeltsToFirstSnake(masterSpawnerBelt: Belt): Belt[] {
    const firstWaypoint = masterSpawnerBelt.end;
    const waypointsToFirstSnake = [
      firstWaypoint,
      { x: BOARD_WIDTH - BELT_WIDTH / 2, y: firstWaypoint.y },
      {
        x: BOARD_WIDTH - BELT_WIDTH / 2,
        y:
          firstWaypoint.y -
          (BELT_WIDTH + FACTORY_SIZE * 2.5 + FACTORY_MARGIN * 4),
      },
    ];
    const beltsToFirstSnake = waypointsToFirstSnake
      .slice(0, -1)
      .map((start, i) => {
        const end = waypointsToFirstSnake[i + 1];
        const belt = new Belt({
          id: `belt-to-first-snake-${i}`,
          start,
          end,
          gameData: this.gameData,
        });
        return belt;
      });
    beltsToFirstSnake.slice(0, -1).forEach((belt, beltIndex) => {
      const nextBelt = beltsToFirstSnake[beltIndex + 1];
      belt.nextPath = nextBelt;
    });
    masterSpawnerBelt.nextPath = beltsToFirstSnake[0];
    return beltsToFirstSnake;
  }

  constructOutputBelts(lastBelt: Belt): Belt[] {
    const outputBelts = [
      new Belt({
        id: "output-belt-0",
        start: lastBelt.end,
        end: {
          x: BOARD_WIDTH / 2,
          y: lastBelt.end.y,
        },
        gameData: this.gameData,
      }),
      new Belt({
        id: "output-belt-1",
        start: {
          x: BOARD_WIDTH / 2,
          y: lastBelt.end.y,
        },
        end: {
          x: BOARD_WIDTH / 2,
          y: lastBelt.end.y - FACTORY_SIZE * 2 - FACTORY_MARGIN * 4,
        },
        gameData: this.gameData,
      }),
    ];
    lastBelt.nextPath = outputBelts[0];
    outputBelts[0].nextPath = outputBelts[1];
    return outputBelts;
  }

  constructBoard() {
    this.calculateGameBoardHeight();
    // First you have the input belt from the spawners
    // Then from that belt you start your snake to the right.
    const { masterSpawnerBelt, spawnerBelts } =
      this.constructSpawnerMasterBelt();
    if (!masterSpawnerBelt) {
      console.warn("No spawners defined, so no belts constructed.");
      return;
    }
    const beltsToFirstSnake =
      this.constructBeltsToFirstSnake(masterSpawnerBelt);
    const outputBelts = this.constructOutputBelts(
      beltsToFirstSnake[beltsToFirstSnake.length - 1],
    );

    this.belts = [...spawnerBelts, ...beltsToFirstSnake, ...outputBelts];
  }

  update(frameTimeMS: number) {
    // 1. Group items by path (O(n))
    const itemsByPath = new Map<Path, Item[]>();
    this.items.forEach((item) => {
      if (!item.currentPath) return;
      const list = itemsByPath.get(item.currentPath) || [];
      list.push(item);
      itemsByPath.set(item.currentPath, list);
    });
    itemsByPath.forEach((items) => {
      items.sort((a, b) => b.pathProgress - a.pathProgress); // Leader at [0], Tail at [length-1]
    });
    itemsByPath.forEach((items, path) => {
      const nextPathItems = path.nextPath ? itemsByPath.get(path.nextPath) : [];
      const nextPathTail =
        nextPathItems && nextPathItems.length > 1
          ? nextPathItems[nextPathItems.length - 1]
          : undefined;

      items.forEach((item, index) => {
        // The "Leader" is items[0], it has no one in front ON THIS PATH
        const itemInFront = index > 0 ? items[index - 1] : undefined;
        item.update(frameTimeMS, itemInFront, nextPathTail);
      });
    });
    this.items = this.items.filter((item) => !item.shouldBeRemoved);
    this.spawners.forEach((spawner) => {
      const nextPathItems = itemsByPath.get(spawner.spawnerOutputBelt) ?? [];
      const nextPathTail =
        nextPathItems && nextPathItems.length > 1
          ? nextPathItems[nextPathItems.length - 1]
          : undefined;
      const generatedItem = spawner.generateItem(frameTimeMS, nextPathTail);
      if (generatedItem) {
        console.log("Generated new item: ", generatedItem.id);
        this.items = [...this.items, generatedItem];
      }
    });
    const totalSeconds = performance.now() / ITEM_RENDER_SIZE;
    const globalOffset = this.gameData.beltSpeed * totalSeconds;
    this.belts.forEach((belt) => {
      if (belt.view.children.length > 0) {
        const sprite = belt.view.getChildAt(0) as TilingSprite;
        sprite.tilePosition.x = globalOffset;
      }
    });
  }
}
