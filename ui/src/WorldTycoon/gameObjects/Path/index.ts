import { DEBUG_MODE } from "../constants";

import type { Point, Vector } from "../types";
import { Graphics, Container } from "pixi.js";
export class Path {
  id: string;
  speed: number = 1;
  start: Point;
  end: Point;
  length: number;
  pathVector: Vector;
  directionUnitVector: Vector;
  debugColor: number = 0xff0000;
  width: number = 20;
  public view: Container = new Container();

  nextPath: Path | undefined;

  constructor(
    id: string,
    start: Point,
    end: Point,
    speed: number,
    width: number = 20,
  ) {
    this.id = id;
    this.start = start;
    this.end = end;
    this.speed = speed;
    this.width = width;
    this.length = Math.sqrt(
      (end.x - start.x) * (end.x - start.x) +
        (end.y - start.y) * (end.y - start.y),
    );
    this.pathVector = { x: end.x - start.x, y: end.y - start.y };
    this.directionUnitVector = {
      x: (end.x - start.x) / this.length,
      y: (end.y - start.y) / this.length,
    };

    // Rendering the component
    this.view = new Container();
    // Position the container at the start point
    this.view.position.set(this.start.x, this.start.y); // Center the belt on the path
    // Rotate the entire container to face the end point
    this.view.rotation = Math.atan2(
      this.end.y - this.start.y,
      this.end.x - this.start.x,
    );

    this.render();

    if (DEBUG_MODE) {
      this.renderDebug();
    }
  }

  render() {}

  renderDebug() {
    const debugGfx = new Graphics();
    const arrowSpacing = 40;
    const arrowSize = 6;

    // 1. Draw the "Spine"
    // Start at 0 (which is start.x, start.y in global space)
    // End at this.length (which is end.x, end.y in global space)
    debugGfx
      .moveTo(0, 0)
      .lineTo(this.length, 0)
      .stroke({ width: 2, color: this.debugColor, alpha: 0.8 });

    // 2. Multiple Arrows
    for (let x = arrowSpacing; x <= this.length; x += arrowSpacing) {
      debugGfx
        .moveTo(x, 0)
        .lineTo(x - arrowSize, -arrowSize / 2)
        .moveTo(x, 0)
        .lineTo(x - arrowSize, arrowSize / 2)
        .stroke({ width: 2, color: this.debugColor, alpha: 0.8 });
    }

    // 3. Start Point Circle
    debugGfx.circle(0, 0, 4).fill(this.debugColor);

    this.view.addChild(debugGfx);
  }

  setNextPath(nextPath: Path) {
    this.nextPath = nextPath;
  }

  getUpdatedItemPosition(
    currentItemPosition: Point,
    currentItemPathProgress: number,
    frameTime: number,
  ): { nextPosition: Point; nextPathProgress: number } {
    const distanceToMove = this.speed * frameTime;
    if (distanceToMove === 0) {
      return {
        nextPosition: currentItemPosition,
        nextPathProgress: currentItemPathProgress,
      }; // No movement needed
    }
    const deltaPosition: Vector = {
      x: this.directionUnitVector.x * distanceToMove,
      y: this.directionUnitVector.y * distanceToMove,
    };
    const nextPosition: Point = {
      x: currentItemPosition.x + deltaPosition.x,
      y: currentItemPosition.y + deltaPosition.y,
    };
    const nextPathProgress =
      currentItemPathProgress + distanceToMove / this.length;
    return {
      nextPosition,
      nextPathProgress,
    };
  }

  isWithinBounds(itemPosition: Point): boolean {
    const itemPositionalVector: Vector = {
      x: itemPosition.x - this.start.x,
      y: itemPosition.y - this.start.y,
    };
    const dotProduct =
      itemPositionalVector.x * this.pathVector.x +
      itemPositionalVector.y * this.pathVector.y;
    return dotProduct >= 0 && dotProduct <= this.length * this.length;
  }
}
