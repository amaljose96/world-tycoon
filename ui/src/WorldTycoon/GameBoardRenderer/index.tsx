import { Application, extend } from "@pixi/react";
import { Container } from "pixi.js";
import { useMemo } from "react";
import { FactoryScene } from "./FactoryScene";
import { BELT_WIDTH, BOARD_WIDTH } from "../gameObjects/constants";
import { GameBoard } from "../gameObjects/GameBoard";
import { gameData } from "../gameData";

extend({ Container });

export function GameBoardRenderer() {
  const gameBoard = useMemo(() => {
    const gameBoard = new GameBoard({ gameData });

    return gameBoard;
  }, []);

  return (
    <div>
      <Application
        width={BOARD_WIDTH}
        height={gameBoard.gameBoardHeight + BELT_WIDTH / 2}
      >
        <FactoryScene gameBoard={gameBoard} />
      </Application>
    </div>
  );
}
