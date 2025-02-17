import React from 'react';
import { Button } from '@core/components/ui/button';
import { toPng, toJpeg } from 'html-to-image';
import jsPDF from 'jspdf';
import { toast } from '@core/components/ui/use-toast';
import { ThemeToggle } from '@core/components/theme-toggle';
import type { Theme } from '@core/lib/theme-provider';

interface ExportButtonsProps {
  targetRef: React.RefObject<HTMLElement>;
  onThemeChange?: (theme: Theme) => void;
}

export const ExportButtons: React.FC<ExportButtonsProps> = ({ targetRef, onThemeChange }) => {
  const [exportTheme, setExportTheme] = React.useState<Theme>('light');

  const handleThemeChange = (theme: Theme) => {
    setExportTheme(theme);
    onThemeChange?.(theme);
  };

  const prepareExport = () => {
    if (!targetRef.current) return null;

    const svg = targetRef.current.querySelector('svg');
    if (!svg) return null;

    // 克隆SVG元素
    const clonedSvg = svg.cloneNode(true) as SVGElement;
    
    // 获取SVG的尺寸
    const bbox = svg.getBBox();
    const width = bbox.width;
    const height = bbox.height;
    
    // 创建一个新的div容器
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '-9999px';
    
    // 设置导出容器的样式
    const exportContainer = document.createElement('div');
    exportContainer.style.padding = '20px';
    exportContainer.style.width = `${width + 40}px`;
    exportContainer.style.height = `${height + 40}px`;
    exportContainer.style.background = exportTheme === 'light' ? 'white' : '#1a1a1a';
    
    // 确保SVG填满容器并应用主题
    clonedSvg.setAttribute('width', '100%');
    clonedSvg.setAttribute('height', '100%');
    clonedSvg.style.display = 'block';
    if (exportTheme === 'dark') {
      clonedSvg.style.filter = 'invert(1) hue-rotate(180deg)';
    }
    
    exportContainer.appendChild(clonedSvg);
    container.appendChild(exportContainer);
    document.body.appendChild(container);
    
    return { container, exportContainer, width, height };
  };

  const handleExport = async (type: 'png' | 'jpg' | 'pdf') => {
    try {
      const prepared = prepareExport();
      if (!prepared) {
        toast({
          title: "导出失败",
          description: "未找到可导出的图表",
          variant: "destructive",
        });
        return;
      }

      const { container, exportContainer, width, height } = prepared;
      let dataUrl: string;
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `mermaid-${timestamp}`;

      try {
        switch (type) {
          case 'png':
            dataUrl = await toPng(exportContainer, { quality: 1.0 });
            downloadImage(dataUrl, `${filename}.png`);
            break;
          case 'jpg':
            dataUrl = await toJpeg(exportContainer, { quality: 0.95 });
            downloadImage(dataUrl, `${filename}.jpg`);
            break;
          case 'pdf':
            dataUrl = await toPng(exportContainer);
            const img = new Image();
            img.src = dataUrl;
            await new Promise((resolve, reject) => {
              img.onload = resolve;
              img.onerror = reject;
            });
            
            const pdf = new jsPDF({
              orientation: width > height ? 'landscape' : 'portrait',
              unit: 'px',
              format: [width + 40, height + 40]
            });
            
            pdf.addImage(dataUrl, 'PNG', 20, 20, width, height);
            pdf.save(`${filename}.pdf`);
            break;
        }

        toast({
          title: "导出成功",
          description: `已导出为${type.toUpperCase()}格式`,
        });
      } finally {
        // 清理临时创建的DOM元素
        document.body.removeChild(container);
      }
    } catch (error) {
      toast({
        title: "导出失败",
        description: error instanceof Error ? error.message : "未知错误",
        variant: "destructive",
      });
    }
  };

  const downloadImage = (dataUrl: string, filename: string) => {
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    link.click();
  };

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={() => handleExport('png')}>
        PNG
      </Button>
      <Button variant="outline" size="sm" onClick={() => handleExport('jpg')}>
        JPG
      </Button>
      <Button variant="outline" size="sm" onClick={() => handleExport('pdf')}>
        PDF
      </Button>
      <div className="w-px h-4 bg-border mx-1" />
      <ThemeToggle 
        onThemeChange={handleThemeChange}
      />
    </div>
  );
}; 