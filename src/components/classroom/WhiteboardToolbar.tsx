import React from 'react';
import { clsx } from 'clsx';
import { 
  Pen, 
  Type, 
  Eraser, 
  Undo, 
  Redo, 
  Trash2, 
  Circle, 
  Square, 
  Triangle,
  Ruler,
  Zap
} from 'lucide-react';
import { Button } from '../ui/Button';
import type { WhiteboardTool } from '../../types';

interface WhiteboardToolbarProps {
  currentTool: WhiteboardTool;
  onToolChange: (tool: WhiteboardTool) => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onClear?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  className?: string;
}

export const WhiteboardToolbar: React.FC<WhiteboardToolbarProps> = ({
  currentTool,
  onToolChange,
  onUndo,
  onRedo,
  onClear,
  canUndo = false,
  canRedo = false,
  className
}) => {
  const tools = [
    { type: 'pen', icon: Pen, label: 'Bút vẽ' },
    { type: 'text', icon: Type, label: 'Văn bản' },
    { type: 'eraser', icon: Eraser, label: 'Tẩy xóa' },
    { type: 'laser', icon: Zap, label: 'Laser pointer' },
    { type: 'ruler', icon: Ruler, label: 'Thước kẻ' }
  ];

  const shapes = [
    { type: 'circle', icon: Circle, label: 'Hình tròn' },
    { type: 'square', icon: Square, label: 'Hình vuông' },
    { type: 'triangle', icon: Triangle, label: 'Tam giác' }
  ];

  const colors = [
    '#000000', '#FF0000', '#00FF00', '#0000FF', 
    '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500',
    '#800080', '#008000', '#800000', '#000080'
  ];

  const sizes = [2, 4, 6, 8, 12, 16];

  const handleToolSelect = (toolType: string) => {
    onToolChange({
      ...currentTool,
      type: toolType as any,
      isActive: true
    });
  };

  const handleColorChange = (color: string) => {
    onToolChange({
      ...currentTool,
      color,
      isActive: true
    });
  };

  const handleSizeChange = (size: number) => {
    onToolChange({
      ...currentTool,
      size,
      isActive: true
    });
  };

  return (
    <div className={clsx(
      'bg-white border border-gray-200 rounded-lg shadow-lg p-4',
      className
    )}>
      <div className="flex flex-wrap items-center gap-4">
        {/* Drawing Tools */}
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">Công cụ:</span>
          {tools.map((tool) => (
            <Button
              key={tool.type}
              variant={currentTool.type === tool.type ? 'primary' : 'outline'}
              size="sm"
              icon={tool.icon}
              onClick={() => handleToolSelect(tool.type)}
              title={tool.label}
            />
          ))}
        </div>

        {/* Shapes */}
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">Hình:</span>
          {shapes.map((shape) => (
            <Button
              key={shape.type}
              variant={currentTool.type === shape.type ? 'primary' : 'outline'}
              size="sm"
              icon={shape.icon}
              onClick={() => handleToolSelect(shape.type)}
              title={shape.label}
            />
          ))}
        </div>

        {/* Colors */}
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">Màu:</span>
          <div className="flex space-x-1">
            {colors.map((color) => (
              <button
                key={color}
                onClick={() => handleColorChange(color)}
                className={clsx(
                  'w-6 h-6 rounded border-2 transition-all',
                  currentTool.color === color 
                    ? 'border-gray-800 scale-110' 
                    : 'border-gray-300 hover:border-gray-500'
                )}
                style={{ backgroundColor: color }}
                title={`Màu ${color}`}
              />
            ))}
          </div>
        </div>

        {/* Sizes */}
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">Kích thước:</span>
          <select
            value={currentTool.size}
            onChange={(e) => handleSizeChange(Number(e.target.value))}
            className="text-sm border border-gray-300 rounded px-2 py-1"
          >
            {sizes.map((size) => (
              <option key={size} value={size}>
                {size}px
              </option>
            ))}
          </select>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2 ml-auto">
          <Button
            variant="outline"
            size="sm"
            icon={Undo}
            onClick={onUndo}
            disabled={!canUndo}
            title="Hoàn tác"
          />
          <Button
            variant="outline"
            size="sm"
            icon={Redo}
            onClick={onRedo}
            disabled={!canRedo}
            title="Làm lại"
          />
          <Button
            variant="danger"
            size="sm"
            icon={Trash2}
            onClick={onClear}
            title="Xóa tất cả"
          />
        </div>
      </div>

      {/* Tool Info */}
      <div className="mt-3 pt-3 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            Công cụ hiện tại: <strong>{tools.find(t => t.type === currentTool.type)?.label || 'Không xác định'}</strong>
          </span>
          <span>
            Màu: <span 
              className="inline-block w-4 h-4 rounded border border-gray-300 ml-1"
              style={{ backgroundColor: currentTool.color }}
            />
          </span>
          <span>
            Kích thước: <strong>{currentTool.size}px</strong>
          </span>
        </div>
      </div>
    </div>
  );
};
