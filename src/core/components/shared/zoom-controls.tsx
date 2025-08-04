import React from 'react';
import { Button } from '@core/components/ui/button';
import { Minus, Plus, RotateCcw, Code, Eye } from 'lucide-react';

interface ZoomControlsProps {
  scale: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  showEditor?: boolean;
  onToggleEditor?: () => void;
}

export const ZoomControls: React.FC<ZoomControlsProps> = ({
  scale,
  onZoomIn,
  onZoomOut,
  onReset,
  showEditor = true,
  onToggleEditor,
}) => {
  return (
    <div className="flex items-center gap-2">
      {onToggleEditor && (
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleEditor}
          title={showEditor ? "隐藏代码编辑器" : "显示代码编辑器"}
        >
          {showEditor ? <Eye className="h-4 w-4" /> : <Code className="h-4 w-4" />}
        </Button>
      )}
      <Button
        variant="outline"
        size="sm"
        onClick={onZoomOut}
        disabled={scale <= 0.25}
        title="缩小"
      >
        <Minus className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onReset}
        title="重置缩放"
      >
        <RotateCcw className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onZoomIn}
        disabled={scale >= 10}
        title="放大"
      >
        <Plus className="h-4 w-4" />
      </Button>
      <span className="text-sm text-muted-foreground">
        {Math.round(scale * 100)}%
      </span>
    </div>
  );
}; 