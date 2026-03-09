import { extend } from "@pixi/react";
import { Container } from "pixi.js";
import { useRef, useEffect } from "react";
import { Item } from "../../../gameObjects/Item";

extend({ Container });

export function ItemRenderer({ item }: { item: Item }) {
  const containerRef = useRef<Container>(null);

  // 1. Manage the Scene Graph Lifecycle
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addChild(item.view);
    }
    return () => {
      if (container) container.removeChild(item.view);
    };
  }, [item]);

  return <pixiContainer ref={containerRef} />;
}
