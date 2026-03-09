import { itemTypes } from "../../gameInfo";

/**
 * A factory takes in an object and outputs an object.
 * A factory has input requirements and an output
 */
export class Factory {
  id: string;
  outputItem: string;
  requiredItems: string[];
  inventory: Map<string, number>;

  processingTimer: number = 0;
  processingTime: number = 1000;
  constructor({ id, outputItem }: { id: string; outputItem: string }) {
    this.id = id;
    this.outputItem = outputItem;
    const requirements = itemTypes.find(
      (item) => item.id === outputItem,
    )?.requirements;
    this.requiredItems = [];
    this.inventory = new Map();

    (requirements ?? []).forEach((requirement) => {
      this.requiredItems.push(requirement.type);
      this.inventory.set(requirement.type, 0);
    });
  }
}
