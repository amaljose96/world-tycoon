export interface SpawnerData {
  type: string;
  speed: number;
}
export interface FactoryData {
  type: string;
  speed: number;
}
export interface GameData {
  beltSpeed: number;
  spawners: SpawnerData[];
  factories: FactoryData[];
}
