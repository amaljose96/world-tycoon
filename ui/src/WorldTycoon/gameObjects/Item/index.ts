import { Assets, Container, Graphics, Sprite, Text } from "pixi.js";
import { ITEM_RENDER_SIZE } from "../constants";
import { Path } from "../Path";

export class Item {
  public view: Container;
  currentPath: Path | undefined;
  id: string;
  type: string;
  level: number;
  pathProgress: number = 0; // New property to track progress along the path
  shouldBeRemoved: boolean = false; // Flag to indicate if the item should be removed from the game

  constructor({
    type,
    level,
    currentPath,
  }: {
    type: string;
    level: number;
    currentPath?: Path;
  }) {
    this.view = new Container();
    this.type = type;
    this.level = level;
    const itemId = Math.floor(Math.random() * 100000);
    this.id = `item-${type}-${level}-${itemId}`;
    if (currentPath) {
      this.view.position.set(currentPath.start.x, currentPath.start.y);
    }
    this.render();
    this.currentPath = currentPath;
  }

  render() {
    const graphics = new Graphics();
    const borderRadius = 6;
    const strokeWidth = 3;
    const boxColor = 0x705711;
    const borderColor = 0xa87f0c; // Light grey border

    // 1. Draw the Background and Border
    graphics
      .roundRect(
        -ITEM_RENDER_SIZE / 2 + strokeWidth,
        -ITEM_RENDER_SIZE / 2 + strokeWidth,
        ITEM_RENDER_SIZE - strokeWidth * 2,
        ITEM_RENDER_SIZE - strokeWidth * 2,
        borderRadius,
      )
      .fill(boxColor)
      .stroke({ width: strokeWidth, color: borderColor, alignment: 0 });
    this.view.addChild(graphics);

    const texture = Assets.get("item-" + this.type);
    const sprite = new Sprite(texture);
    sprite.anchor.set(0.5);
    sprite.width = ITEM_RENDER_SIZE - strokeWidth * 2;
    sprite.height = ITEM_RENDER_SIZE - strokeWidth * 2;
    this.view.addChild(sprite);

    // 2. Add the Level Text if level > 1
    if (this.level > 1) {
      const levelText = new Text({
        text: `x${this.level}`,
        style: {
          fontSize: 14,
          fill: 0xffffff,
        },
      });

      // Position it at the bottom right of the ITEM_RENDER_SIZE
      // Since the anchor is 0.5, (0,0) is center.
      // We move it roughly 60% towards the edges.
      levelText.x = ITEM_RENDER_SIZE / 4;
      levelText.y = ITEM_RENDER_SIZE / 4;
      levelText.anchor.set(0.5);

      this.view.addChild(levelText);
    }
  }

  update(
    frameTime: number,
    itemInFront: Item | undefined,
    nextPathTail: Item | undefined,
  ) {
    if (!this.currentPath) return;
    const { nextPosition, nextPathProgress } =
      this.currentPath.getUpdatedItemPosition(
        this.view.position,
        this.pathProgress,
        frameTime,
      );

    if (itemInFront) {
      const progressGap = itemInFront.pathProgress - nextPathProgress;
      const minGapThisPath = (ITEM_RENDER_SIZE / this.currentPath.length) * 1.1;

      if (progressGap < minGapThisPath) {
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
      const minGapNextPath =
        (ITEM_RENDER_SIZE / this.currentPath.nextPath.length) * 1.1;

      if (nextPathTail && nextPathTail?.pathProgress <= minGapNextPath) {
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
