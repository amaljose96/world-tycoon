import { Assets } from "pixi.js";
import { itemTypes, spawnerTypes } from "../../../gameInfo";

// Call this once when your app starts
export async function loadAssets() {
  const itemAssetInfo = itemTypes.map((itemType) => {
    return {
      alias: "item-" + itemType.id,
      src: "/assets/items/" + itemType.id + ".png",
    };
  });
  const spawnerAssetInfo = spawnerTypes.map((spawnerType) => {
    return {
      alias: "spawner-" + spawnerType.id,
      src: "/assets/spawners/" + spawnerType.id + ".png",
    };
  });
  const allAssetInfos = [
    ...itemAssetInfo,
    ...spawnerAssetInfo,
    {
      alias: "belt-texture",
      src: "/assets/belt-texture.png",
    },
  ];
  console.log(allAssetInfos);
  try {
    await Assets.load(allAssetInfos);
  } catch (e) {
    console.error("Failed to load assets", e);
  }
}
