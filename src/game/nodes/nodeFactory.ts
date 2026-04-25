import { Node, NodeType, Position, Direction, Data } from '../../types';
import { v4 as uuidv4 } from 'uuid';

const generateId = (): string => {
  return uuidv4();
};

const createData = (tickCount: number): Data => ({
  id: generateId(),
  createdAt: tickCount,
});

const rotateDirectionClockwise = (direction: Direction): Direction => {
  const rotationOrder: Direction[] = [Direction.Up, Direction.Right, Direction.Down, Direction.Left];
  const currentIndex = rotationOrder.indexOf(direction);
  return rotationOrder[(currentIndex + 1) % 4];
};

export const createGeneratorNode = (
  position: Position,
  outputDirection: Direction = Direction.Right,
  generationInterval: number = 1,
  maxQueueSize: number = 5
): Node => {
  let currentOutputDirection = outputDirection;
  
  const node: Node = {
    id: generateId(),
    type: NodeType.Generator,
    position,
    inputDirection: null,
    get outputDirection() {
      return currentOutputDirection;
    },
    set outputDirection(dir: Direction) {
      currentOutputDirection = dir;
    },
    dataQueue: [],
    incomingData: [],
    maxQueueSize,
    
    update: (tickCount: number, _getNeighborNode: (dir: Direction) => Node | null) => {
      if (node.incomingData.length > 0) {
        const spaceInDataQueue = node.maxQueueSize - node.dataQueue.length;
        const dataToMove = node.incomingData.splice(0, spaceInDataQueue);
        node.dataQueue.push(...dataToMove);
      }
      
      if (tickCount % generationInterval !== 0) {
        return;
      }

      if (node.dataQueue.length >= node.maxQueueSize) {
        return;
      }

      const newData = createData(tickCount);
      node.dataQueue.push(newData);
    },
    
    rotate: () => {
      currentOutputDirection = rotateDirectionClockwise(currentOutputDirection);
    },
  };

  return node;
};

export const createBeltNode = (
  position: Position,
  inputDirection: Direction = Direction.Left,
  outputDirection: Direction = Direction.Right,
  maxQueueSize: number = 5
): Node => {
  let currentInputDirection = inputDirection;
  let currentOutputDirection = outputDirection;
  
  const node: Node = {
    id: generateId(),
    type: NodeType.Belt,
    position,
    get inputDirection() {
      return currentInputDirection;
    },
    set inputDirection(dir: Direction | null) {
      if (dir !== null) {
        currentInputDirection = dir;
      }
    },
    get outputDirection() {
      return currentOutputDirection;
    },
    set outputDirection(dir: Direction) {
      currentOutputDirection = dir;
    },
    dataQueue: [],
    incomingData: [],
    maxQueueSize,
    
    update: (_tickCount: number, _getNeighborNode: (dir: Direction) => Node | null) => {
      if (node.incomingData.length > 0) {
        const spaceInDataQueue = node.maxQueueSize - node.dataQueue.length;
        const dataToMove = node.incomingData.splice(0, spaceInDataQueue);
        node.dataQueue.push(...dataToMove);
      }
    },
    
    rotate: () => {
      currentInputDirection = rotateDirectionClockwise(currentInputDirection);
      currentOutputDirection = rotateDirectionClockwise(currentOutputDirection);
    },
  };

  return node;
};

export const createNode = (
  type: NodeType,
  position: Position,
  outputDirection: Direction = Direction.Right,
  inputDirection: Direction | null = null
): Node => {
  if (type === NodeType.Generator) {
    return createGeneratorNode(position, outputDirection);
  }
  
  const actualInput = inputDirection !== null ? inputDirection : 
    (outputDirection === Direction.Right ? Direction.Left :
     outputDirection === Direction.Left ? Direction.Right :
     outputDirection === Direction.Down ? Direction.Up :
     Direction.Down);
  
  return createBeltNode(position, actualInput, outputDirection);
};
