import React, { useRef, useEffect, useState, useCallback } from 'react';
import { clsx } from 'clsx';
import { WhiteboardToolbar } from './WhiteboardToolbar';
import type { WhiteboardTool, WhiteboardElement } from '../../types';

interface WhiteboardProps {
  sessionId: string;
  canEdit: boolean;
  elements: WhiteboardElement[];
  onElementAdd?: (element: Omit<WhiteboardElement, 'id' | 'createdAt' | 'createdBy'>) => void;
  onElementUpdate?: (elementId: string, updates: Partial<WhiteboardElement>) => void;
  onElementDelete?: (elementId: string) => void;
  onClear?: () => void;
  className?: string;
}

export const Whiteboard: React.FC<WhiteboardProps> = ({
  canEdit,
  elements,
  onElementAdd,
  onClear,
  className
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<Array<{x: number, y: number}>>([]);
  const [history] = useState<WhiteboardElement[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  const [currentTool, setCurrentTool] = useState<WhiteboardTool>({
    type: 'pen',
    color: '#000000',
    size: 4,
    isActive: true
  });

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
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
  useEffect(() => {
    redrawCanvas();
  }, [elements]);

  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw all elements
    elements.forEach(element => {
      drawElement(ctx, element);
    });
  }, [elements]);

  const drawElement = (ctx: CanvasRenderingContext2D, element: WhiteboardElement) => {
    ctx.strokeStyle = element.style.color;
    ctx.lineWidth = element.style.strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    switch (element.type) {
      case 'pen':
        if (element.data.path && element.data.path.length > 1) {
          ctx.beginPath();
          ctx.moveTo(element.data.path[0].x, element.data.path[0].y);
          element.data.path.forEach((point: {x: number, y: number}) => {
            ctx.lineTo(point.x, point.y);
          });
          ctx.stroke();
        }
        break;

      case 'text':
        ctx.font = `${element.style.fontSize || 16}px ${element.style.fontFamily || 'Arial'}`;
        ctx.fillStyle = element.style.color;
        ctx.fillText(element.data.text, element.position.x, element.position.y);
        break;

      case 'shape':
        ctx.beginPath();
        switch (element.data.shapeType) {
          case 'circle':
            ctx.arc(
              element.position.x,
              element.position.y,
              element.data.radius,
              0,
              2 * Math.PI
            );
            break;
          case 'square':
            ctx.rect(
              element.position.x,
              element.position.y,
              element.data.width,
              element.data.height
            );
            break;
          case 'triangle':
            ctx.moveTo(element.position.x, element.position.y);
            ctx.lineTo(element.position.x + element.data.width / 2, element.position.y + element.data.height);
            ctx.lineTo(element.position.x - element.data.width / 2, element.position.y + element.data.height);
            ctx.closePath();
            break;
        }
        ctx.stroke();
        break;

      case 'laser':
        // Laser pointer - temporary red dot
        ctx.fillStyle = 'red';
        ctx.beginPath();
        ctx.arc(element.position.x, element.position.y, 8, 0, 2 * Math.PI);
        ctx.fill();
        break;
    }
  };

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canEdit) return;

    const pos = getMousePos(e);
    setIsDrawing(true);

    if (currentTool.type === 'pen') {
      setCurrentPath([pos]);
    } else if (currentTool.type === 'text') {
      const text = prompt('Nhập văn bản:');
      if (text) {
        const element = {
          type: 'text' as const,
          data: { text },
          position: pos,
          style: {
            color: currentTool.color,
            strokeWidth: currentTool.size,
            fontSize: currentTool.size * 2,
            fontFamily: 'Arial'
          }
        };
        onElementAdd?.(element);
      }
    } else if (currentTool.type === 'laser') {
      const element = {
        type: 'laser' as const,
        data: {},
        position: pos,
        style: {
          color: 'red',
          strokeWidth: currentTool.size
        }
      };
      onElementAdd?.(element);

      // Remove laser pointer after 2 seconds
      setTimeout(() => {
        // This would need to be implemented with proper element tracking
      }, 2000);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canEdit || !isDrawing) return;

    const pos = getMousePos(e);

    if (currentTool.type === 'pen') {
      setCurrentPath(prev => [...prev, pos]);
      
      // Draw current stroke
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (ctx && currentPath.length > 0) {
        ctx.strokeStyle = currentTool.color;
        ctx.lineWidth = currentTool.size;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        ctx.beginPath();
        ctx.moveTo(currentPath[currentPath.length - 2]?.x || pos.x, currentPath[currentPath.length - 2]?.y || pos.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
      }
    }
  };

  const handleMouseUp = () => {
    if (!canEdit || !isDrawing) return;

    setIsDrawing(false);

    if (currentTool.type === 'pen' && currentPath.length > 1) {
      const element = {
        type: 'pen' as const,
        data: { path: currentPath },
        position: { x: 0, y: 0 },
        style: {
          color: currentTool.color,
          strokeWidth: currentTool.size
        }
      };
      onElementAdd?.(element);
    }

    setCurrentPath([]);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      // Implement undo logic
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      // Implement redo logic
    }
  };

  const handleClear = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tất cả?')) {
      onClear?.();
    }
  };

  return (
    <div className={clsx('flex flex-col h-full', className)}>
      {/* Toolbar */}
      {canEdit && (
        <div className="mb-4">
          <WhiteboardToolbar
            currentTool={currentTool}
            onToolChange={setCurrentTool}
            onUndo={handleUndo}
            onRedo={handleRedo}
            onClear={handleClear}
            canUndo={historyIndex > 0}
            canRedo={historyIndex < history.length - 1}
          />
        </div>
      )}

      {/* Canvas */}
      <div className="flex-1 relative bg-white border border-gray-200 rounded-lg overflow-hidden">
        <canvas
          ref={canvasRef}
          className="w-full h-full cursor-crosshair"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => setIsDrawing(false)}
        />
        
        {!canEdit && (
          <div className="absolute inset-0 bg-gray-900 bg-opacity-20 flex items-center justify-center">
            <div className="bg-white px-4 py-2 rounded-lg shadow-lg">
              <p className="text-sm text-gray-600">Chỉ giáo viên mới có thể chỉnh sửa bảng</p>
            </div>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="mt-2 text-xs text-gray-500 text-center">
        {canEdit ? 'Bạn có thể vẽ và chỉnh sửa bảng' : 'Chế độ chỉ xem'}
      </div>
    </div>
  );
};
