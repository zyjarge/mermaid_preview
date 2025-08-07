import React from 'react';
import { Button } from '@core/components/ui/button';
import { Minus, Plus, RotateCcw, PanelLeftOpen, PanelLeftClose } from 'lucide-react';

interface ZoomControlsProps {
  scale: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  isEditorCollapsed?: boolean;
  onToggleEditor?: () => void;
}

export const ZoomControls: React.FC<ZoomControlsProps> = ({
  scale,
  onZoomIn,
  onZoomOut,
  onReset,
  isEditorCollapsed = false,
  onToggleEditor,
}) => {
  return (
    <div className="flex items-center gap-2">
      {onToggleEditor && (
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleEditor}
          title={isEditorCollapsed ? "显示代码编辑器" : "隐藏代码编辑器"}
        >
          {isEditorCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
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
        disabled={scale >= 50}
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