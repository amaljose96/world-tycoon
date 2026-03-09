import { Container, Graphics } from "pixi.js";
import { ITEM_RENDER_SIZE } from "../constants";
import { Path } from "../Path";

export class Item {
  public view: Container;
  currentPath: Path | undefined;
  id: string;
  type: string;
  pathProgress: number = 0; // New property to track progress along the path
  shouldBeRemoved: boolean = false; // Flag to indicate if the item should be removed from the game

  constructor(type: string, currentPath?: Path) {
    this.view = new Container();
    this.type = type;
    this.id = `item-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    if (currentPath) {
      this.view.position.set(currentPath.start.x, currentPath.start.y);
    }
    this.render();
    this.currentPath = currentPath;
  }

  render() {
    const graphics = new Graphics();
    graphics.roundRect(
      -ITEM_RENDER_SIZE / 2,
      -ITEM_RENDER_SIZE / 2,
      ITEM_RENDER_SIZE,
      ITEM_RENDER_SIZE,
      0,
    ); // Define the path
    graphics.fill(0x32cd32); // Apply the color
    this.view.addChild(graphics);
  }

  update(
    frameTime: number,
    itemInFront: Item | undefined,
    nextPathTail: Item | undefined,
  ) {
    if (!this.currentPath) return;
    const minGap = ITEM_RENDER_SIZE / this.currentPath.length; // Minimum gap
    const { nextPosition, nextPathProgress } =
      this.currentPath.getUpdatedItemPosition(
        this.view.position,
        this.pathProgress,
        frameTime,
      );

    if (itemInFront) {
      const progressGap = itemInFront.pathProgress - nextPathProgress;

      if (progressGap < minGap) {
        // If the item in front is too close, we don't move this item
        return;
      }
    }

    if (this.currentPath.isWithinBounds(nextPosition)) {
      this.view.position.set(nextPosition.x, nextPosition.y);
      this.pathProgress = nextPathProgress;
    } else {
      if (!this.currentPath.nextPath) {
        this.view.position.set(this.currentPath.end.x, this.currentPath.end.y);
        this.shouldBeRemoved = true;
        return;
      }

      if (nextPathTail && nextPathTail?.pathProgress <= minGap) {
        return;
      }
      // Snap to start of next path and trigger handoff
      this.view.position.set(
        this.currentPath.nextPath.start.x,
        this.currentPath.nextPath.start.y,
      );
      this.pathProgress = 0; // Reset progress for the new path
      this.currentPath = this.currentPath?.nextPath as Path | undefined;
    }
  }
}
