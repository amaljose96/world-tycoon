import { Assets, Texture, TilingSprite } from "pixi.js";
import { BELT_WIDTH } from "../constants";
import { Path } from "../Path";
import type { Point } from "../types";
import type { GameData } from "../../types";

export class Belt extends Path {
  debugColor: number = 0x333333;

  constructor({
    id,
    start,
    end,
    gameData,
  }: {
    id: string;
    start: Point;
    end: Point;
    gameData: GameData;
  }) {
    super({ id, start, end, speed: gameData.beltSpeed, width: BELT_WIDTH });
  }

  render() {
    // 1. Clean up previous renders to prevent memory leaks

    const texture = Assets.get("belt-texture") || Texture.WHITE;
    if (!texture) {
      console.warn(`Belt texture not found for ${this.id}`);
      return;
    }

    // 2. Create the TilingSprite
    // width: matches the Path length
    // height: matches our BELT_WIDTH constant
    const sprite = new TilingSprite({
      texture,
      width: this.length + BELT_WIDTH,
      height: BELT_WIDTH,
    });
    sprite.label = "belt-tread";

    // 3. Anchor and Position
    // We anchor at (0, 0.5) so the start of the sprite is at (0,0) locally,
    // and it is centered vertically on the path line.
    sprite.anchor.set(0, 0.5);
    sprite.x = -BELT_WIDTH / 2;
    sprite.y = 0;

    // 4. Scale the texture (treads) down
    // If your texture is 64px and belt is 40px, this keeps it proportional
    const scaleFactor = 0.5; // Adjust this to make treads smaller/larger
    sprite.tileScale.set(scaleFactor, scaleFactor);

    // 5. Apply a tint to make it look recessed/industrial
    sprite.tint = 0x999999;

    this.view.addChild(sprite);
  }
}
