import {
  BELT_WIDTH,
  BOARD_WIDTH,
  FACTORY_MARGIN,
  FACTORY_SIZE,
  SCREEN_MARGIN,
} from "../constants";
import { Belt } from "../Belt";
import { Spawner } from "../Spawner";
import { Item } from "../Item";
import type { GameData, SpawnerData } from "../../types";
import type { Path } from "../Path";

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

    const outputHeight = FACTORY_SIZE * 2 + FACTORY_MARGIN * 4 + SCREEN_MARGIN;

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
    console.log("Game data spawners: ", this.gameData.spawners);

    if (this.gameData.spawners.length === 1) {
      spawnerRows.push({
        leftSpawnerData: this.gameData.spawners[0],
      });
    }

    this.gameData.spawners.forEach((spawnerData, spawnerIndex) => {
      if (spawnerIndex % 2 === 1) {
        spawnerRows.push({
          leftSpawnerData: this.gameData.spawners[spawnerIndex - 1],
          rightSpawnerData: spawnerData,
        });
      }
    });
    let previousRowMasterBelt: Belt | undefined = undefined;

    console.log(
      "Constructing spawners and their belts with the following data: ",
      {
        spawnerRows,
      },
    );
    spawnerRows.forEach((row, rowIndex) => {
      const leftSpawner = new Spawner({
        id: `spawner-${row.leftSpawnerData.type}-row-${rowIndex}-left`,
        y: spawnerY,
        position: "left",
        itemType: row.leftSpawnerData.type,
        beltSpeed: this.gameData.beltSpeed,
        spawnSpeed: row.leftSpawnerData.speed,
      });
      const rightSpawner = row.rightSpawnerData
        ? new Spawner({
            id: `spawner-${row.rightSpawnerData.type}-row-${rowIndex}-right`,
            y: spawnerY,
            position: "right",
            itemType: row.rightSpawnerData.type,
            beltSpeed: this.gameData.beltSpeed,
            spawnSpeed: row.rightSpawnerData.speed,
          })
        : undefined;
      spawnerY -= FACTORY_SIZE + FACTORY_MARGIN;
      this.spawners.push(leftSpawner);
      if (rightSpawner) {
        this.spawners.push(rightSpawner);
      }
      console.log("Constructed spawner: ", leftSpawner, rightSpawner);

      const rowMasterBelt = new Belt(
        `master-spawner-belt-row-${rowIndex}`,
        {
          x: BOARD_WIDTH / 2,
          y: leftSpawner.spawnerOutputBelt.start.y,
        },
        {
          x: BOARD_WIDTH / 2,
          y: spawnerY,
        },
        this.gameData.beltSpeed,
      );
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
        const belt = new Belt(
          `belt-to-first-snake-${i}`,
          start,
          end,
          this.gameData.beltSpeed,
        );
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
      new Belt(
        "output-belt-0",
        lastBelt.end,
        {
          x: BOARD_WIDTH / 2,
          y: lastBelt.end.y,
        },
        this.gameData.beltSpeed,
      ),
      new Belt(
        "output-belt-1",
        {
          x: BOARD_WIDTH / 2,
          y: lastBelt.end.y,
        },
        {
          x: BOARD_WIDTH / 2,
          y: lastBelt.end.y - FACTORY_SIZE * 2 - FACTORY_MARGIN * 4,
        },
        this.gameData.beltSpeed,
      ),
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

  update(frameTime: number) {
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
        item.update(frameTime, itemInFront, nextPathTail);
      });
    });
    this.items = this.items.filter((item) => !item.shouldBeRemoved);
    this.spawners.forEach((spawner) => {
      const nextPathItems = itemsByPath.get(spawner.spawnerOutputBelt) ?? [];
      const nextPathTail =
        nextPathItems && nextPathItems.length > 1
          ? nextPathItems[nextPathItems.length - 1]
          : undefined;
      const generatedItem = spawner.generateItem(frameTime, nextPathTail);
      if (generatedItem) {
        console.log("Generated new item: ", generatedItem.id);
        this.items = [...this.items, generatedItem];
      }
    });
  }
}
