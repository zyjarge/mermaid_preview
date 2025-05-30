import React from 'react';
import { Button } from '@core/components/ui/button';
import { Minus, Plus, RotateCcw } from 'lucide-react';

interface ZoomControlsProps {
  scale: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}

export const ZoomControls: React.FC<ZoomControlsProps> = ({
  scale,
  onZoomIn,
  onZoomOut,
  onReset,
}) => {
  return (
    <div className="flex items-center gap-2">
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