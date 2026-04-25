export type Position = {
  x: number;
  y: number;
};

export enum Direction {
  Up = 'UP',
  Down = 'DOWN',
  Left = 'LEFT',
  Right = 'RIGHT',
}

export enum NodeType {
  Generator = 'GENERATOR',
  Belt = 'BELT',
}

export type Data = {
  id: string;
  createdAt: number;
  value?: unknown;
};

export type Node = {
  id: string;
  type: NodeType;
  position: Position;
  inputDirection: Direction | null;
  outputDirection: Direction;
  dataQueue: Data[];
  maxQueueSize: number;
  update(tickCount: number, getNeighborNode: (dir: Direction) => Node | null): void;
};

export type GameState = {
  gridSize: number;
  tickCount: number;
  isRunning: boolean;
  nodes: Map<string, Node>;
  selectedNodeType: NodeType | null;
  tickRate: number;
};

export const directionOffset: Record<Direction, Position> = {
  [Direction.Up]: { x: 0, y: -1 },
  [Direction.Down]: { x: 0, y: 1 },
  [Direction.Left]: { x: -1, y: 0 },
  [Direction.Right]: { x: 1, y: 0 },
};

export const oppositeDirection: Record<Direction, Direction> = {
  [Direction.Up]: Direction.Down,
  [Direction.Down]: Direction.Up,
  [Direction.Left]: Direction.Right,
  [Direction.Right]: Direction.Left,
};
