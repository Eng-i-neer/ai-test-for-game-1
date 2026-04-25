import React, { useRef, useEffect, useCallback, useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import {
  getCanvasSize,
  screenToGrid,
  clearCanvas,
  drawGrid,
  drawNode,
  drawHoverCell,
  drawDataInTransit,
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
    rotateNode,
    getNodeAt,
    dataInTransit,
  } = useGameStore();

  const { width, height } = getCanvasSize(gridSize);
  const animationFrameRef = useRef<number>(0);
  const isRenderingRef = useRef(false);

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

    dataInTransit.forEach((transit) => {
      drawDataInTransit(ctx, transit, CELL_SIZE);
    });

    if (hoverPosition) {
      const existingNode = getNodeAt(hoverPosition);
      
      if (selectedNodeType) {
        const isValid = !existingNode;
        drawHoverCell(ctx, hoverPosition, CELL_SIZE, isValid);
      } else if (existingNode) {
        drawHoverCell(ctx, hoverPosition, CELL_SIZE, true);
      }
    }
  }, [gridSize, nodes, dataInTransit, hoverPosition, selectedNodeType, getNodeAt, width, height]);

  const renderLoop = useCallback(() => {
    render();
    if (isRenderingRef.current) {
      animationFrameRef.current = requestAnimationFrame(renderLoop);
    }
  }, [render]);

  useEffect(() => {
    if (isRenderingRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    isRenderingRef.current = true;
    animationFrameRef.current = requestAnimationFrame(renderLoop);

    return () => {
      isRenderingRef.current = false;
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [renderLoop]);

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
        const existingNode = getNodeAt(position);
        
        if (existingNode) {
          rotateNode(position);
        } else if (selectedNodeType === NodeType.Generator || selectedNodeType === NodeType.Belt) {
          placeNode(position);
        }
      }
    },
    [gridSize, selectedNodeType, placeNode, rotateNode, getNodeAt]
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

  const getCursorStyle = (): string => {
    if (selectedNodeType) {
      return 'crosshair';
    }
    if (hoverPosition) {
      const existingNode = getNodeAt(hoverPosition);
      if (existingNode) {
        return 'pointer';
      }
    }
    return 'default';
  };

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{
        border: '2px solid #3a3a5a',
        borderRadius: '4px',
        cursor: getCursorStyle(),
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
    />
  );
};

export default GameCanvas;
