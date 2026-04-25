import { Node, Position, Direction, directionOffset, oppositeDirection, NodeType } from '../../types';

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

  public rotateNodeAt(position: Position): boolean {
    const node = this.getNodeAt(position);
    if (!node) {
      return false;
    }
    node.rotate();
    return true;
  }

  private canReceiveData(fromNode: Node, toNode: Node): boolean {
    if (toNode.type === NodeType.Generator) {
      return false;
    }

    if (toNode.dataQueue.length + toNode.incomingData.length >= toNode.maxQueueSize) {
      return false;
    }

    if (toNode.inputDirection === null) {
      return true;
    }

    const expectedInputDirection = oppositeDirection[fromNode.outputDirection];
    
    return toNode.inputDirection === expectedInputDirection;
  }

  public updateAllNodes(tickCount: number): void {
    const getNeighborNode = (node: Node) => (direction: Direction): Node | null => {
      return this.getNeighborNode(node.position, direction);
    };

    this.nodes.forEach((node) => {
      node.update(tickCount, getNeighborNode(node));
    });
  }

  public transferData(): void {
    const nodesArray = Array.from(this.nodes.values());
    
    const sortedNodes = nodesArray.sort((a, b) => {
      if (a.position.x !== b.position.x) {
        return a.position.x - b.position.x;
      }
      return a.position.y - b.position.y;
    });

    const transfers: { from: Node; to: Node; data: Node['dataQueue'] }[] = [];

    for (const node of sortedNodes) {
      if (node.dataQueue.length === 0) {
        continue;
      }

      const nextNode = this.getNeighborNode(node.position, node.outputDirection);
      if (!nextNode) {
        continue;
      }

      if (this.canReceiveData(node, nextNode)) {
        const dataToTransfer = node.dataQueue[0];
        transfers.push({
          from: node,
          to: nextNode,
          data: [dataToTransfer],
        });
      }
    }

    for (const transfer of transfers) {
      const data = transfer.from.dataQueue.shift();
      if (data) {
        transfer.to.incomingData.push(data);
      }
    }
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
