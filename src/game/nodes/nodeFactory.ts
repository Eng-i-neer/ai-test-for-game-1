import { Node, NodeType, Position, Direction, Data } from '../../types';
import { v4 as uuidv4 } from 'uuid';

const generateId = (): string => {
  return uuidv4();
};

const createData = (tickCount: number): Data => ({
  id: generateId(),
  createdAt: tickCount,
});

export const createGeneratorNode = (
  position: Position,
  outputDirection: Direction = Direction.Right,
  generationInterval: number = 1,
  maxQueueSize: number = 5
): Node => {
  const node: Node = {
    id: generateId(),
    type: NodeType.Generator,
    position,
    inputDirection: null,
    outputDirection,
    dataQueue: [],
    maxQueueSize,
    update: (tickCount: number, getNeighborNode: (dir: Direction) => Node | null) => {
      if (tickCount % generationInterval !== 0) {
        return;
      }

      if (node.dataQueue.length >= node.maxQueueSize) {
        return;
      }

      const newData = createData(tickCount);
      const neighbor = getNeighborNode(node.outputDirection);

      if (neighbor && neighbor.type === NodeType.Belt) {
        const canReceive = 
          neighbor.inputDirection === node.outputDirection || 
          neighbor.inputDirection === null;
        
        if (canReceive && neighbor.dataQueue.length < neighbor.maxQueueSize) {
          neighbor.dataQueue.push(newData);
          return;
        }
      }

      if (node.dataQueue.length < node.maxQueueSize) {
        node.dataQueue.push(newData);
      }
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
  const node: Node = {
    id: generateId(),
    type: NodeType.Belt,
    position,
    inputDirection,
    outputDirection,
    dataQueue: [],
    maxQueueSize,
    update: (_tickCount: number, getNeighborNode: (dir: Direction) => Node | null) => {
      if (node.dataQueue.length === 0) {
        return;
      }

      const nextNode = getNeighborNode(node.outputDirection);

      if (nextNode && nextNode.type === NodeType.Belt) {
        const canReceive = 
          nextNode.inputDirection === node.outputDirection || 
          nextNode.inputDirection === null;
        
        if (canReceive && nextNode.dataQueue.length < nextNode.maxQueueSize) {
          nextNode.dataQueue.push(node.dataQueue.shift()!);
          return;
        }
      }

      if (nextNode && nextNode.type === NodeType.Generator) {
        return;
      }
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
