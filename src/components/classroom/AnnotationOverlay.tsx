import React, { useRef, useEffect, useState, useCallback } from 'react';
import type { AnnotationTool } from './AnnotationToolbar';

interface Point {
  x: number;
  y: number;
}

interface AnnotationElement {
  id: string;
  type: 'pen' | 'text' | 'red-dot';
  points?: Point[];
  text?: string;
  position?: Point;
  color: string;
  size: number;
  timestamp: number;
}

interface AnnotationOverlayProps {
  isEnabled: boolean;
  currentTool: AnnotationTool;
  penColor: string;
  penSize: number;
  onElementAdd?: (element: AnnotationElement) => void;
  className?: string;
}

export const AnnotationOverlay: React.FC<AnnotationOverlayProps> = ({
  isEnabled,
  currentTool,
  penColor,
  penSize,
  onElementAdd,
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<Point[]>([]);
  const [elements, setElements] = useState<AnnotationElement[]>([]);
  const [redDotPosition, setRedDotPosition] = useState<Point | null>(null);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match container
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      redrawCanvas();
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  // Redraw canvas when elements change
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw all elements
    elements.forEach((element) => {
      ctx.strokeStyle = element.color;
      ctx.fillStyle = element.color;
      ctx.lineWidth = element.size;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      switch (element.type) {
        case 'pen':
          if (element.points && element.points.length > 1) {
            ctx.beginPath();
            ctx.moveTo(element.points[0].x, element.points[0].y);
            for (let i = 1; i < element.points.length; i++) {
              ctx.lineTo(element.points[i].x, element.points[i].y);
            }
            ctx.stroke();
          }
          break;

        case 'text':
          if (element.text && element.position) {
            ctx.font = `${element.size + 10}px Arial`;
            ctx.fillText(element.text, element.position.x, element.position.y);
          }
          break;

        case 'red-dot':
          if (element.position) {
            ctx.beginPath();
            ctx.arc(element.position.x, element.position.y, 8, 0, 2 * Math.PI);
            ctx.fill();
          }
          break;
      }
    });

    // Draw current red dot position
    if (redDotPosition && currentTool === 'red-dot') {
      ctx.fillStyle = '#ff0000';
      ctx.beginPath();
      ctx.arc(redDotPosition.x, redDotPosition.y, 8, 0, 2 * Math.PI);
      ctx.fill();
    }

    // Draw current path while drawing
    if (isDrawing && currentPath.length > 1 && currentTool === 'pen') {
      ctx.strokeStyle = penColor;
      ctx.lineWidth = penSize;
      ctx.beginPath();
      ctx.moveTo(currentPath[0].x, currentPath[0].y);
      for (let i = 1; i < currentPath.length; i++) {
        ctx.lineTo(currentPath[i].x, currentPath[i].y);
      }
      ctx.stroke();
    }
  }, [elements, redDotPosition, currentTool, isDrawing, currentPath, penColor, penSize]);

  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  // Get mouse position relative to canvas
  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  // Handle mouse events
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isEnabled) return;

    const pos = getMousePos(e);

    switch (currentTool) {
      case 'pen':
        setIsDrawing(true);
        setCurrentPath([pos]);
        break;

      case 'text':
        const text = prompt('Nhập văn bản:');
        if (text) {
          const newElement: AnnotationElement = {
            id: Date.now().toString(),
            type: 'text',
            text,
            position: pos,
            color: penColor,
            size: penSize,
            timestamp: Date.now()
          };
          setElements(prev => [...prev, newElement]);
          onElementAdd?.(newElement);
        }
        break;

      case 'red-dot':
        setRedDotPosition(pos);
        const dotElement: AnnotationElement = {
          id: Date.now().toString(),
          type: 'red-dot',
          position: pos,
          color: '#ff0000',
          size: 8,
          timestamp: Date.now()
        };
        setElements(prev => [...prev, dotElement]);
        onElementAdd?.(dotElement);
        break;

      case 'eraser':
        // Find and remove elements at this position
        setElements(prev => prev.filter(element => {
          if (element.type === 'text' || element.type === 'red-dot') {
            if (!element.position) return true;
            const distance = Math.sqrt(
              Math.pow(element.position.x - pos.x, 2) + 
              Math.pow(element.position.y - pos.y, 2)
            );
            return distance > 20; // Erase radius
          }
          return true; // Keep pen strokes for now (more complex to erase)
        }));
        break;
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isEnabled) return;

    const pos = getMousePos(e);

    if (currentTool === 'red-dot') {
      setRedDotPosition(pos);
    }

    if (isDrawing && currentTool === 'pen') {
      setCurrentPath(prev => [...prev, pos]);
    }
  };

  const handleMouseUp = () => {
    if (!isEnabled || !isDrawing) return;

    if (currentTool === 'pen' && currentPath.length > 1) {
      const newElement: AnnotationElement = {
        id: Date.now().toString(),
        type: 'pen',
        points: [...currentPath],
        color: penColor,
        size: penSize,
        timestamp: Date.now()
      };
      setElements(prev => [...prev, newElement]);
      onElementAdd?.(newElement);
    }

    setIsDrawing(false);
    setCurrentPath([]);
  };

  // Clear all annotations
  const clearAnnotations = useCallback(() => {
    setElements([]);
    setRedDotPosition(null);
    setCurrentPath([]);
    setIsDrawing(false);
  }, []);

  // Expose clear function to parent
  useEffect(() => {
    (window as any).clearAnnotations = clearAnnotations;
  }, [clearAnnotations]);

  if (!isEnabled) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-auto z-10 ${className}`}
      style={{
        cursor: currentTool === 'red-dot' ? 'none' : 
               currentTool === 'pen' ? 'crosshair' : 
               currentTool === 'text' ? 'text' : 
               currentTool === 'eraser' ? 'grab' : 'default'
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    />
  );
};
