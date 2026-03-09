import { extend } from "@pixi/react";
import { Container } from "pixi.js";
import { useRef, useEffect } from "react";
import { Spawner } from "../../../gameObjects/Spawner";

extend({ Container });

interface SpawnerRendererProps {
  spawner: Spawner;
}

export const SpawnerRenderer = ({ spawner }: SpawnerRendererProps) => {
  const containerRef = useRef<Container>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      // Inject the spawner's visual representation
      container.addChild(spawner.view);
    }
    return () => {
      if (container) container.removeChild(spawner.view);
    };
  }, [spawner]);

  // We don't need useTick here because belts don't move their base position.
  return <pixiContainer ref={containerRef} />;
};
