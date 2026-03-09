import { Graphics } from "pixi.js";
import { BELT_WIDTH } from "../constants";
import { Path } from "../Path";
import type { Point } from "../types";

export class Belt extends Path {
  debugColor: number = 0x333333;

  constructor(id: string, start: Point, end: Point, speed: number) {
    super(id, start, end, speed, BELT_WIDTH);
  }

  render() {
    const graphics = new Graphics();

    graphics.roundRect(
      -BELT_WIDTH / 2,
      -BELT_WIDTH / 2,
      this.length,
      BELT_WIDTH,
      4, // Small corner radius for a smoother look
    );

    graphics.fill(0x333333); // Dark grey for the belt surface

    // Optional: Add a subtle border to distinguish segments
    graphics.setStrokeStyle({ width: 2, color: 0x444444 });
    graphics.stroke();

    if (!this.view) return;

    this.view.addChild(graphics);
  }
}
