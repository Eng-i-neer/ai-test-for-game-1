import { Node, Position, Direction, directionOffset } from '../../types';

export class GridSystem {
  private gridSize: number;
  private nodes: Map<string, Node>;
  private positionToNodeId: Map<string, string>;

  constructor(gridSize: number = 10) {
    this.gridSize = gridSize;
    this.nodes = new Map();
    this.positionToNodeId = new Map();
  }

  private getPositionKey(position: Position): string {
    return `${position.x},${position.y}`;
  }

  private isValidPosition(position: Position): boolean {
    return (
      position.x >= 0 &&
      position.x < this.gridSize &&
      position.y >= 0 &&
      position.y < this.gridSize
    );
  }

  public getGridSize(): number {
    return this.gridSize;
  }

  public getNodes(): Map<string, Node> {
    return this.nodes;
  }

  public getNodeAt(position: Position): Node | null {
    if (!this.isValidPosition(position)) {
      return null;
    }
    const nodeId = this.positionToNodeId.get(this.getPositionKey(position));
    if (!nodeId) {
      return null;
    }
    return this.nodes.get(nodeId) || null;
  }

  public getNodeById(nodeId: string): Node | null {
    return this.nodes.get(nodeId) || null;
  }

  public getNeighborNode(fromPosition: Position, direction: Direction): Node | null {
    const offset = directionOffset[direction];
    const neighborPosition: Position = {
      x: fromPosition.x + offset.x,
      y: fromPosition.y + offset.y,
    };
    return this.getNodeAt(neighborPosition);
  }

  public addNode(node: Node): boolean {
    if (!this.isValidPosition(node.position)) {
      console.error('Invalid position for node:', node.position);
      return false;
    }

    const positionKey = this.getPositionKey(node.position);
    if (this.positionToNodeId.has(positionKey)) {
      console.error('Position already occupied:', node.position);
      return false;
    }

    this.nodes.set(node.id, node);
    this.positionToNodeId.set(positionKey, node.id);
    return true;
  }

  public removeNode(nodeId: string): boolean {
    const node = this.nodes.get(nodeId);
    if (!node) {
      return false;
    }

    const positionKey = this.getPositionKey(node.position);
    this.nodes.delete(nodeId);
    this.positionToNodeId.delete(positionKey);
    return true;
  }

  public removeNodeAt(position: Position): boolean {
    const node = this.getNodeAt(position);
    if (!node) {
      return false;
    }
    return this.removeNode(node.id);
  }

  public updateAllNodes(tickCount: number): void {
    this.nodes.forEach((node) => {
      const getNeighborNode = (direction: Direction): Node | null => {
        return this.getNeighborNode(node.position, direction);
      };
      
      node.update(tickCount, getNeighborNode);
    });
  }

  public clear(): void {
    this.nodes.clear();
    this.positionToNodeId.clear();
  }

  public getAllPositions(): Position[] {
    const positions: Position[] = [];
    for (let x = 0; x < this.gridSize; x++) {
      for (let y = 0; y < this.gridSize; y++) {
        positions.push({ x, y });
      }
    }
    return positions;
  }
}
