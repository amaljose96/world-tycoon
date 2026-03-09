import type { GameData } from "./types";

export const gameData: GameData = {
  beltSpeed: 3,
  spawners: [
    {
      type: "leek-farm",
      level: 2,
    },
    {
      type: "leek-farm",
      level: 1,
    },
    {
      type: "leek-farm",
      level: 1,
    },
    {
      type: "leek-farm",
      level: 1,
    },
  ],
  factories: [],
  itemLevels: {
    leek: 2,
    soup: 1,
    cake: 1,
  },
};
