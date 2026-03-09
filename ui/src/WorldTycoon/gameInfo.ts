export const itemTypes = [
  {
    id: "leek",
    name: "Leek",
    requirements: [],
  },
  {
    id: "soup",
    name: "Leek soup",
    requirements: [{ type: "leek", quantity: 10 }],
  },
  {
    id: "cake",
    name: "Leek cake",
    requirements: [{ type: "soup", quantity: 15 }],
  },
  {
    id: "leak",
    name: "Atomic leek",
    requirements: [
      { type: "soup", quantity: 50 },
      { type: "cake", quantity: 10 },
    ],
  },
];
export const spawnerTypes = [
  {
    id: "leek-farm",
    name: "Leek farm",
    spawns: "leek",
    spawnerTime: 1,
  },
];
