import { create } from 'zustand';
import { Node, NodeType, Position, Direction, DataInTransit } from '../types';
import { GridSystem } from '../game/grid/gridSystem';
import { createNode } from '../game/nodes/nodeFactory';

interface GameState {
  gridSize: number;
  tickCount: number;
  isRunning: boolean;
  nodes: Map<string, Node>;
  selectedNodeType: NodeType | null;
  tickRate: number;
  gridSystem: GridSystem | null;
  dataInTransit: DataInTransit[];
  animationTime: number;
  
  initializeGame: () => void;
  startGame: () => void;
  pauseGame: () => void;
  resetGame: () => void;
  incrementTick: () => void;
  
  selectNodeType: (type: NodeType | null) => void;
  placeNode: (position: Position) => void;
  removeNode: (position: Position) => void;
  rotateNode: (position: Position) => void;
  getNodeAt: (position: Position) => Node | null;
  getNeighborNode: (fromPosition: Position, direction: Direction) => Node | null;
  
  updateAllNodes: () => void;
  transferData: () => void;
  updateAnimation: (deltaTime: number) => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  gridSize: 10,
  tickCount: 0,
  isRunning: false,
  nodes: new Map(),
  selectedNodeType: null,
  tickRate: 60,
  gridSystem: null,
  dataInTransit: [],
  animationTime: 0,

  initializeGame: () => {
    const gridSystem = new GridSystem(10);
    set({
      gridSystem,
      nodes: new Map(),
      tickCount: 0,
      isRunning: false,
      dataInTransit: [],
      animationTime: 0,
    });
  },

  startGame: () => {
    set({ isRunning: true });
  },

  pauseGame: () => {
    set({ isRunning: false });
  },

  resetGame: () => {
    const { gridSystem } = get();
    if (gridSystem) {
      gridSystem.clear();
    }
    set({
      nodes: new Map(),
      tickCount: 0,
      isRunning: false,
      dataInTransit: [],
      animationTime: 0,
    });
  },

  incrementTick: () => {
    set((state) => ({
      tickCount: state.tickCount + 1,
    }));
  },

  selectNodeType: (type: NodeType | null) => {
    set({ selectedNodeType: type });
  },

  placeNode: (position: Position) => {
    const { selectedNodeType, gridSystem, nodes } = get();
    
    if (!selectedNodeType || !gridSystem) {
      return;
    }

    const existingNode = gridSystem.getNodeAt(position);
    if (existingNode) {
      return;
    }

    const newNode = createNode(selectedNodeType, position);
    const success = gridSystem.addNode(newNode);
    
    if (success) {
      const newNodes = new Map(nodes);
      newNodes.set(newNode.id, newNode);
      set({ nodes: newNodes });
    }
  },

  removeNode: (position: Position) => {
    const { gridSystem, nodes } = get();
    
    if (!gridSystem) {
      return;
    }

    const node = gridSystem.getNodeAt(position);
    if (!node) {
      return;
    }

    const success = gridSystem.removeNode(node.id);
    if (success) {
      const newNodes = new Map(nodes);
      newNodes.delete(node.id);
      set({ nodes: newNodes });
    }
  },

  rotateNode: (position: Position) => {
    const { gridSystem } = get();
    
    if (!gridSystem) {
      return;
    }

    const success = gridSystem.rotateNodeAt(position);
    if (success) {
      const updatedNodes = new Map<string, Node>();
      gridSystem.getNodes().forEach((node, id) => {
        updatedNodes.set(id, node);
      });
      set({ nodes: updatedNodes });
    }
  },

  getNodeAt: (position: Position) => {
    const { gridSystem } = get();
    if (!gridSystem) {
      return null;
    }
    return gridSystem.getNodeAt(position);
  },

  getNeighborNode: (fromPosition: Position, direction: Direction) => {
    const { gridSystem } = get();
    if (!gridSystem) {
      return null;
    }
    return gridSystem.getNeighborNode(fromPosition, direction);
  },

  updateAllNodes: () => {
    const { gridSystem, tickCount } = get();
    
    if (!gridSystem) {
      return;
    }

    gridSystem.updateAllNodes(tickCount);
    
    const updatedNodes = new Map<string, Node>();
    gridSystem.getNodes().forEach((node, id) => {
      updatedNodes.set(id, node);
    });
    
    set({ nodes: updatedNodes });
  },

  transferData: () => {
    const { gridSystem, tickCount, dataInTransit } = get();
    
    if (!gridSystem) {
      return;
    }

    const nodesArray = Array.from(gridSystem.getNodes().values());
    
    const sortedNodes = nodesArray.sort((a, b) => {
      if (a.position.x !== b.position.x) {
        return a.position.x - b.position.x;
      }
      return a.position.y - b.position.y;
    });

    const newDataInTransit: DataInTransit[] = [...dataInTransit];

    for (const node of sortedNodes) {
      if (node.dataQueue.length === 0) {
        continue;
      }

      const nextNode = gridSystem.getNeighborNode(node.position, node.outputDirection);
      if (!nextNode) {
        continue;
      }

      if (nextNode.type === NodeType.Generator) {
        continue;
      }

      const targetQueueHasSpace = 
        nextNode.dataQueue.length + nextNode.incomingData.length < nextNode.maxQueueSize;
      
      if (targetQueueHasSpace) {
        const data = node.dataQueue.shift();
        if (data) {
          const transit: DataInTransit = {
            data,
            fromPosition: { ...node.position },
            toPosition: { ...nextNode.position },
            direction: node.outputDirection,
            progress: 0,
            tickCreated: tickCount,
          };
          newDataInTransit.push(transit);
        }
      }
    }

    const updatedNodes = new Map<string, Node>();
    gridSystem.getNodes().forEach((node, id) => {
      updatedNodes.set(id, node);
    });
    
    set({ 
      nodes: updatedNodes,
      dataInTransit: newDataInTransit,
    });
  },

  updateAnimation: (deltaTime: number) => {
    const { dataInTransit, gridSystem } = get();
    
    if (dataInTransit.length === 0) {
      return;
    }

    const animationDuration = 500;
    const updatedTransit: DataInTransit[] = [];
    const completedTransits: DataInTransit[] = [];

    for (const transit of dataInTransit) {
      const newProgress = transit.progress + (deltaTime / animationDuration);
      
      if (newProgress >= 1) {
        completedTransits.push(transit);
      } else {
        updatedTransit.push({
          ...transit,
          progress: newProgress,
        });
      }
    }

    if (completedTransits.length > 0 && gridSystem) {
      for (const transit of completedTransits) {
        const targetNode = gridSystem.getNodeAt(transit.toPosition);
        if (targetNode) {
          targetNode.incomingData.push(transit.data);
        }
      }

      const updatedNodes = new Map<string, Node>();
      gridSystem.getNodes().forEach((node, id) => {
        updatedNodes.set(id, node);
      });
      
      set({ 
        nodes: updatedNodes,
        dataInTransit: updatedTransit,
      });
    } else {
      set({ dataInTransit: updatedTransit });
    }
  },
}));
