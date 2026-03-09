import { useTick } from "@pixi/react";
import { BeltRenderer } from "./BeltRenderer";
import { ItemRenderer } from "./ItemRenderer";
import { SpawnerRenderer } from "./SpawnerRenderer";
import type { GameBoard } from "../../gameObjects/GameBoard";
import { useState } from "react";

interface IFactorySceneProps {
  gameBoard: GameBoard;
}
export function FactoryScene({ gameBoard }: IFactorySceneProps) {
  const [, setTick] = useState(0);
  useTick((tick) => {
    gameBoard.update(tick.deltaTime);
    setTick((t) => t + 1);
  });
  return (
    <>
      {/* Infrastructure Layer */}
      {gameBoard.belts.map((belt) => (
        <BeltRenderer key={`belt-${belt.id}`} belt={belt} />
      ))}

      {/* Spawner Layer */}
      {gameBoard.spawners.map((spawner) => (
        <SpawnerRenderer key={`spawner-${spawner.id}`} spawner={spawner} />
      ))}
      {/* Dynamic Item Layer */}
      {gameBoard.items.map((item) => (
        <ItemRenderer key={`item-${item.id}`} item={item} />
      ))}
    </>
  );
}
