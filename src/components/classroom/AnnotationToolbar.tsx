import React from 'react';
import { Pen, Type, Circle, Eye, EyeOff, Eraser, Trash2 } from 'lucide-react';

export type AnnotationTool = 'pen' | 'text' | 'red-dot' | 'eraser';

interface AnnotationToolbarProps {
  currentTool: AnnotationTool;
  onToolChange: (tool: AnnotationTool) => void;
  isAnnotationEnabled: boolean;
  onToggleAnnotation: () => void;
  onClear: () => void;
  penColor: string;
  onColorChange: (color: string) => void;
  penSize: number;
  onSizeChange: (size: number) => void;
}

export const AnnotationToolbar: React.FC<AnnotationToolbarProps> = ({
  currentTool,
  onToolChange,
  isAnnotationEnabled,
  onToggleAnnotation,
  onClear,
  penColor,
  onColorChange,
  penSize,
  onSizeChange
}) => {
  const tools = [
    { id: 'pen' as const, icon: Pen, label: 'Vẽ tự do' },
    { id: 'text' as const, icon: Type, label: 'Thêm chữ' },
    { id: 'red-dot' as const, icon: Circle, label: 'Red dot' },
    { id: 'eraser' as const, icon: Eraser, label: 'Tẩy' },
  ];

  const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#000000', '#ffffff'];

  return (
    <div className="flex items-center space-x-2 bg-gray-800 text-white p-2 rounded-lg">
      {/* Toggle Annotation */}
      <button
        onClick={onToggleAnnotation}
        className={`px-3 py-2 rounded text-sm transition-colors ${
          isAnnotationEnabled ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-700 hover:bg-gray-600'
        }`}
        title={isAnnotationEnabled ? 'Tắt chế độ vẽ' : 'Bật chế độ vẽ'}
      >
        {isAnnotationEnabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
      </button>

      {/* Divider */}
      <div className="w-px h-6 bg-gray-600" />

      {/* Tools */}
      {tools.map((tool) => (
        <button
          key={tool.id}
          onClick={() => onToolChange(tool.id)}
          className={`px-3 py-2 rounded text-sm transition-colors ${
            currentTool === tool.id ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-700 hover:bg-gray-600'
          }`}
          title={tool.label}
          disabled={!isAnnotationEnabled}
        >
          <tool.icon className="h-4 w-4" />
        </button>
      ))}

      {/* Divider */}
      <div className="w-px h-6 bg-gray-600" />

      {/* Color Picker */}
      <div className="flex items-center space-x-1">
        <span className="text-xs">Màu:</span>
        <div className="flex space-x-1">
          {colors.map((color) => (
            <button
              key={color}
              onClick={() => onColorChange(color)}
              className={`w-6 h-6 rounded border-2 ${
                penColor === color ? 'border-white' : 'border-gray-500'
              }`}
              style={{ backgroundColor: color }}
              disabled={!isAnnotationEnabled}
              title={`Chọn màu ${color}`}
            />
          ))}
        </div>
      </div>

      {/* Size Slider */}
      <div className="flex items-center space-x-2">
        <span className="text-xs">Cỡ:</span>
        <input
          type="range"
          min="1"
          max="20"
          value={penSize}
          onChange={(e) => onSizeChange(Number(e.target.value))}
          className="w-16"
          disabled={!isAnnotationEnabled}
        />
        <span className="text-xs w-6">{penSize}</span>
      </div>

      {/* Divider */}
      <div className="w-px h-6 bg-gray-600" />

      {/* Clear Button */}
      <button
        onClick={onClear}
        className="px-3 py-2 rounded text-sm bg-red-600 hover:bg-red-700 transition-colors"
        title="Xóa tất cả"
        disabled={!isAnnotationEnabled}
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
};
