import { extend } from "@pixi/react";
import { Container } from "pixi.js";
import { useRef, useEffect } from "react";
import { Belt } from "../../../gameObjects/Belt";

extend({ Container });

interface BeltRendererProps {
  belt: Belt;
}

export const BeltRenderer = ({ belt }: BeltRendererProps) => {
  const containerRef = useRef<Container>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      // Inject the belt's visual representation
      container.addChild(belt.view);
    }
    return () => {
      if (container) container.removeChild(belt.view);
    };
  }, [belt]);

  // We don't need useTick here because belts don't move their base position.
  return <pixiContainer ref={containerRef} />;
};
