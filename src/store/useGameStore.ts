import { create } from 'zustand';
import { Node, NodeType, Position, Direction } from '../types';
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
  
  initializeGame: () => void;
  startGame: () => void;
  pauseGame: () => void;
  resetGame: () => void;
  incrementTick: () => void;
  
  selectNodeType: (type: NodeType | null) => void;
  placeNode: (position: Position) => void;
  removeNode: (position: Position) => void;
  getNodeAt: (position: Position) => Node | null;
  getNeighborNode: (fromPosition: Position, direction: Direction) => Node | null;
  
  updateAllNodes: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  gridSize: 10,
  tickCount: 0,
  isRunning: false,
  nodes: new Map(),
  selectedNodeType: null,
  tickRate: 60,
  gridSystem: null,

  initializeGame: () => {
    const gridSystem = new GridSystem(10);
    set({
      gridSystem,
      nodes: new Map(),
      tickCount: 0,
      isRunning: false,
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
}));
