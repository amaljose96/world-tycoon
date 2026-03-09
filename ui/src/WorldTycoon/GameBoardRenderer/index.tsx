import { Application, extend } from "@pixi/react";
import { Container } from "pixi.js";
import { useEffect, useMemo, useState } from "react";
import { FactoryScene } from "./FactoryScene";
import { BELT_WIDTH, BOARD_WIDTH } from "../gameObjects/constants";
import { GameBoard } from "../gameObjects/GameBoard";
import { gameData } from "../gameData";
import { loadAssets } from "./FactoryScene/AssetLoader/loadAssets";

extend({ Container });

export function GameBoardRenderer() {
  const [hasAssetsLoaded, setHasAssetsLoaded] = useState(false);
  const gameBoard = useMemo(() => {
    if (!hasAssetsLoaded) {
      return undefined;
    }
    const gameBoard = new GameBoard({ gameData });
    return gameBoard;
  }, [hasAssetsLoaded]);
  useEffect(() => {
    let isMounted = true;

    const initAssets = async () => {
      await loadAssets();
      if (isMounted) {
        setHasAssetsLoaded(true);
        console.log("ASSETS LOADED");
      }
    };

    initAssets();

    return () => {
      isMounted = false;
    }; // Cleanup to prevent state updates on unmounted component
  }, []);
  if (!hasAssetsLoaded || !gameBoard) {
    return "Loading";
  }
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
