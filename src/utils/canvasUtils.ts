import { Position, Node, NodeType, Direction } from '../types';

export const CELL_SIZE = 60;
export const PADDING = 2;

export const getCanvasSize = (gridSize: number): { width: number; height: number } => {
  return {
    width: gridSize * CELL_SIZE,
    height: gridSize * CELL_SIZE,
  };
};

export const screenToGrid = (
  screenX: number,
  screenY: number,
  canvasRect: DOMRect,
  gridSize: number
): Position | null => {
  const x = Math.floor((screenX - canvasRect.left) / CELL_SIZE);
  const y = Math.floor((screenY - canvasRect.top) / CELL_SIZE);

  if (x >= 0 && x < gridSize && y >= 0 && y < gridSize) {
    return { x, y };
  }
  return null;
};

export const gridToScreen = (position: Position): { x: number; y: number } => {
  return {
    x: position.x * CELL_SIZE,
    y: position.y * CELL_SIZE,
  };
};

export const drawGrid = (
  ctx: CanvasRenderingContext2D,
  gridSize: number,
  cellSize: number = CELL_SIZE
): void => {
  ctx.strokeStyle = '#3a3a5a';
  ctx.lineWidth = 1;

  for (let x = 0; x <= gridSize; x++) {
    ctx.beginPath();
    ctx.moveTo(x * cellSize, 0);
    ctx.lineTo(x * cellSize, gridSize * cellSize);
    ctx.stroke();
  }

  for (let y = 0; y <= gridSize; y++) {
    ctx.beginPath();
    ctx.moveTo(0, y * cellSize);
    ctx.lineTo(gridSize * cellSize, y * cellSize);
    ctx.stroke();
  }
};

export const drawNode = (
  ctx: CanvasRenderingContext2D,
  node: Node,
  cellSize: number = CELL_SIZE
): void => {
  const { x, y } = gridToScreen(node.position);
  const innerSize = cellSize - PADDING * 2;

  ctx.save();

  if (node.type === NodeType.Generator) {
    ctx.fillStyle = '#4a9eff';
    ctx.fillRect(x + PADDING, y + PADDING, innerSize, innerSize);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('G', x + cellSize / 2, y + cellSize / 2);
    
    drawDirectionArrow(ctx, x, y, cellSize, node.outputDirection, '#ffcc00');
  } else if (node.type === NodeType.Belt) {
    ctx.fillStyle = '#66bb6a';
    ctx.fillRect(x + PADDING, y + PADDING, innerSize, innerSize);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('B', x + cellSize / 2, y + cellSize / 2);
    
    drawDirectionArrow(ctx, x, y, cellSize, node.outputDirection, '#ff9800');
  }

  if (node.dataQueue.length > 0) {
    drawDataIndicator(ctx, x, y, cellSize, node.dataQueue.length);
  }

  ctx.restore();
};

export const drawDirectionArrow = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  cellSize: number,
  direction: Direction,
  color: string
): void => {
  ctx.save();
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;

  const centerX = x + cellSize / 2;
  const centerY = y + cellSize / 2;
  const arrowSize = 10;

  ctx.beginPath();
  switch (direction) {
    case Direction.Up:
      ctx.moveTo(centerX, centerY - cellSize / 3);
      ctx.lineTo(centerX - arrowSize, centerY - cellSize / 3 + arrowSize);
      ctx.lineTo(centerX + arrowSize, centerY - cellSize / 3 + arrowSize);
      break;
    case Direction.Down:
      ctx.moveTo(centerX, centerY + cellSize / 3);
      ctx.lineTo(centerX - arrowSize, centerY + cellSize / 3 - arrowSize);
      ctx.lineTo(centerX + arrowSize, centerY + cellSize / 3 - arrowSize);
      break;
    case Direction.Left:
      ctx.moveTo(centerX - cellSize / 3, centerY);
      ctx.lineTo(centerX - cellSize / 3 + arrowSize, centerY - arrowSize);
      ctx.lineTo(centerX - cellSize / 3 + arrowSize, centerY + arrowSize);
      break;
    case Direction.Right:
      ctx.moveTo(centerX + cellSize / 3, centerY);
      ctx.lineTo(centerX + cellSize / 3 - arrowSize, centerY - arrowSize);
      ctx.lineTo(centerX + cellSize / 3 - arrowSize, centerY + arrowSize);
      break;
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
};

export const drawDataIndicator = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  cellSize: number,
  count: number
): void => {
  ctx.save();
  ctx.fillStyle = '#ff5722';
  const dotSize = 6;
  const spacing = 8;
  const maxDots = 5;
  const dotsToShow = Math.min(count, maxDots);
  
  const startX = x + cellSize / 2 - ((dotsToShow - 1) * spacing) / 2;
  const dotY = y + cellSize - 15;
  
  for (let i = 0; i < dotsToShow; i++) {
    ctx.beginPath();
    ctx.arc(startX + i * spacing, dotY, dotSize / 2, 0, Math.PI * 2);
    ctx.fill();
  }
  
  if (count > maxDots) {
    ctx.fillStyle = '#ffffff';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`+${count - maxDots}`, x + cellSize / 2, dotY + 12);
  }
  
  ctx.restore();
};

export const drawHoverCell = (
  ctx: CanvasRenderingContext2D,
  position: Position,
  cellSize: number = CELL_SIZE,
  isValid: boolean = true
): void => {
  const { x, y } = gridToScreen(position);
  
  ctx.save();
  ctx.fillStyle = isValid ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 0, 0, 0.2)';
  ctx.fillRect(x, y, cellSize, cellSize);
  
  ctx.strokeStyle = isValid ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 0, 0, 0.5)';
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, cellSize, cellSize);
  ctx.restore();
};

export const clearCanvas = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): void => {
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, width, height);
};
