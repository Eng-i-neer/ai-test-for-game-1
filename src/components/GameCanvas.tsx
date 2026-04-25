import React, { useRef, useEffect, useCallback, useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import {
  getCanvasSize,
  screenToGrid,
  clearCanvas,
  drawGrid,
  drawNode,
  drawHoverCell,
  CELL_SIZE,
} from '../utils/canvasUtils';
import { Position, NodeType } from '../types';

const GameCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoverPosition, setHoverPosition] = useState<Position | null>(null);
  
  const {
    gridSize,
    nodes,
    selectedNodeType,
    placeNode,
    removeNode,
    getNodeAt,
    tickCount,
  } = useGameStore();

  const { width, height } = getCanvasSize(gridSize);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    clearCanvas(ctx, width, height);
    drawGrid(ctx, gridSize, CELL_SIZE);

    nodes.forEach((node) => {
      drawNode(ctx, node, CELL_SIZE);
    });

    if (hoverPosition && selectedNodeType) {
      const existingNode = getNodeAt(hoverPosition);
      const isValid = !existingNode;
      drawHoverCell(ctx, hoverPosition, CELL_SIZE, isValid);
    }
  }, [gridSize, nodes, hoverPosition, selectedNodeType, getNodeAt, width, height]);

  useEffect(() => {
    render();
  }, [render, tickCount]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const position = screenToGrid(e.clientX, e.clientY, rect, gridSize);
      setHoverPosition(position);
    },
    [gridSize]
  );

  const handleMouseLeave = useCallback(() => {
    setHoverPosition(null);
  }, []);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const position = screenToGrid(e.clientX, e.clientY, rect, gridSize);

      if (!position) return;

      if (e.button === 0) {
        if (selectedNodeType === NodeType.Generator || selectedNodeType === NodeType.Belt) {
          placeNode(position);
        }
      }
    },
    [gridSize, selectedNodeType, placeNode]
  );

  const handleContextMenu = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const position = screenToGrid(e.clientX, e.clientY, rect, gridSize);

      if (position) {
        removeNode(position);
      }
    },
    [gridSize, removeNode]
  );

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{
        border: '2px solid #3a3a5a',
        borderRadius: '4px',
        cursor: selectedNodeType ? 'crosshair' : 'default',
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
    />
  );
};

export default GameCanvas;
