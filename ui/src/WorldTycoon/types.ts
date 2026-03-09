export interface SpawnerData {
  type: string;
  level: number;
}
export interface FactoryData {
  type: string;
  level: number;
}
export type ItemLevels = Record<string, number>;
export interface GameData {
  beltSpeed: number;
  spawners: SpawnerData[];
  factories: FactoryData[];
  itemLevels: ItemLevels;
}
