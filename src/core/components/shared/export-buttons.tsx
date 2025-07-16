import React from 'react';
import { Button } from '@core/components/ui/button';
import { toPng, toJpeg } from 'html-to-image';
import jsPDF from 'jspdf';
import { toast } from '@core/components/ui/use-toast';
import { ThemeToggle } from '@core/components/theme-toggle';
import type { Theme } from '@core/lib/theme-provider';
import { CodeType } from '@core/lib/code-detector';
import ReactDOMServer from 'react-dom/server';
import { MarkdownPreview } from '@core/components/markdown-preview';

interface ExportButtonsProps {
  targetRef: React.RefObject<HTMLElement>;
  onThemeChange?: (theme: Theme) => void;
  codeType?: CodeType;
  code?: string;
}

export const ExportButtons: React.FC<ExportButtonsProps> = ({ 
  targetRef, 
  onThemeChange, 
  codeType = 'unknown',
  code = ''
}) => {
  const [exportTheme, setExportTheme] = React.useState<Theme>('light');

  const handleThemeChange = (theme: Theme) => {
    setExportTheme(theme);
    onThemeChange?.(theme);
  };

  const prepareExport = async (): Promise<{ container: HTMLElement; exportContainer: HTMLElement; width: number; height: number } | null> => {
    if (!targetRef.current) return null;

    if (codeType === 'markdown') {
      // 创建一个临时容器用于导出
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.top = '-9999px';
      
      // 设置导出容器的样式
      const exportContainer = document.createElement('div');
      exportContainer.style.padding = '20px';
      exportContainer.style.background = exportTheme === 'light' ? 'white' : '#1a1a1a';
      exportContainer.style.width = '800px'; // 设置固定宽度以确保布局一致
      
      // 复制当前页面的样式
      const styles = document.querySelectorAll('style, link[rel="stylesheet"]');
      styles.forEach(style => {
        container.appendChild(style.cloneNode(true));
      });

      // 添加 Markdown 预览所需的类名
      exportContainer.className = `markdown-preview prose ${exportTheme === 'dark' ? 'dark prose-invert' : ''} max-w-none`;
      
      // 直接复制当前渲染的内容
      const currentContent = targetRef.current.querySelector('.markdown-preview');
      if (currentContent) {
        exportContainer.innerHTML = currentContent.innerHTML;
      }
      
      container.appendChild(exportContainer);
      document.body.appendChild(container);
      
      // 等待一小段时间，确保样式已经应用
      return new Promise<{ container: HTMLElement; exportContainer: HTMLElement; width: number; height: number }>((resolve) => {
        setTimeout(() => {
          // 对于markdown，返回固定的宽度和高度
          resolve({ container, exportContainer, width: 800, height: 600 });
        }, 100);
      });
    }

    // 处理 Mermaid SVG 导出
    const svg = targetRef.current.querySelector('svg');
    if (!svg) return null;

    // 获取SVG的完整尺寸 - 改进版本
    let svgWidth, svgHeight;
    
    try {
      // 方法1：尝试从SVG属性获取尺寸
      const svgWidthAttr = svg.getAttribute('width');
      const svgHeightAttr = svg.getAttribute('height');
      const viewBoxAttr = svg.getAttribute('viewBox');
      
      if (svgWidthAttr && svgHeightAttr && 
          !svgWidthAttr.includes('%') && !svgHeightAttr.includes('%')) {
        svgWidth = parseFloat(svgWidthAttr);
        svgHeight = parseFloat(svgHeightAttr);
      } else if (viewBoxAttr) {
        const viewBox = viewBoxAttr.split(' ').map(Number);
        if (viewBox.length === 4) {
          svgWidth = viewBox[2];
          svgHeight = viewBox[3];
        }
      }
      
      // 方法2：如果没有从属性获取到，使用getBBox
      if (!svgWidth || !svgHeight) {
        const bbox = svg.getBBox();
        svgWidth = bbox.width;
        svgHeight = bbox.height;
      }
      
      // 方法3：使用getBoundingClientRect作为后备
      if (!svgWidth || !svgHeight || svgWidth < 100 || svgHeight < 100) {
        const rect = svg.getBoundingClientRect();
        svgWidth = Math.max(svgWidth || 0, rect.width);
        svgHeight = Math.max(svgHeight || 0, rect.height);
      }
      
      // 方法4：遍历所有元素获取真实边界（用于复杂图表）
      const allElements = svg.querySelectorAll('g, path, text, circle, rect, line, polyline, polygon');
      if (allElements.length > 0) {
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        
        allElements.forEach(element => {
          try {
            const rect = element.getBoundingClientRect();
            const svgRect = svg.getBoundingClientRect();
            
            if (rect.width > 0 && rect.height > 0) {
              const relativeX = rect.left - svgRect.left;
              const relativeY = rect.top - svgRect.top;
              
              minX = Math.min(minX, relativeX);
              minY = Math.min(minY, relativeY);
              maxX = Math.max(maxX, relativeX + rect.width);
              maxY = Math.max(maxY, relativeY + rect.height);
            }
          } catch (e) {
            // 忽略无法获取边界的元素
          }
        });
        
        // 如果成功获取了边界，使用计算出的尺寸
        if (minX !== Infinity && minY !== Infinity && maxX !== -Infinity && maxY !== -Infinity) {
          const calculatedWidth = maxX - minX;
          const calculatedHeight = maxY - minY;
          
          // 使用更大的尺寸确保完整性
          svgWidth = Math.max(svgWidth, calculatedWidth);
          svgHeight = Math.max(svgHeight, calculatedHeight);
        }
      }
      
      // 确保最小尺寸和合理的比例
      svgWidth = Math.max(svgWidth || 400, 400);
      svgHeight = Math.max(svgHeight || 300, 300);
      
      // 限制最大尺寸，防止过大的图片
      const maxSize = 4000;
      if (svgWidth > maxSize || svgHeight > maxSize) {
        const scale = Math.min(maxSize / svgWidth, maxSize / svgHeight);
        svgWidth = Math.round(svgWidth * scale);
        svgHeight = Math.round(svgHeight * scale);
      }
      
    } catch (error) {
      console.warn('无法获取SVG尺寸，使用默认值:', error);
      svgWidth = 800;
      svgHeight = 600;
    }

    // 克隆SVG元素
    const clonedSvg = svg.cloneNode(true) as SVGElement;
    
    // 创建一个新的div容器
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '-9999px';
    container.style.zIndex = '-1000';
    
    // 设置导出容器的样式
    const exportContainer = document.createElement('div');
    exportContainer.style.padding = '20px';
    exportContainer.style.width = `${svgWidth + 40}px`;
    exportContainer.style.height = `${svgHeight + 40}px`;
    exportContainer.style.background = exportTheme === 'light' ? 'white' : '#1a1a1a';
    exportContainer.style.overflow = 'visible';
    exportContainer.style.display = 'flex';
    exportContainer.style.alignItems = 'center';
    exportContainer.style.justifyContent = 'center';
    
    // 重要：确保SVG能够显示完整内容
    clonedSvg.setAttribute('width', `${svgWidth}`);
    clonedSvg.setAttribute('height', `${svgHeight}`);
    clonedSvg.setAttribute('viewBox', `0 0 ${svgWidth} ${svgHeight}`);
    clonedSvg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    clonedSvg.style.display = 'block';
    clonedSvg.style.maxWidth = 'none';
    clonedSvg.style.maxHeight = 'none';
    clonedSvg.style.width = `${svgWidth}px`;
    clonedSvg.style.height = `${svgHeight}px`;
    clonedSvg.style.overflow = 'visible';
    
    // 应用主题
    if (exportTheme === 'dark') {
      clonedSvg.style.filter = 'invert(1) hue-rotate(180deg)';
    }
    
    // 确保所有文本和路径都可见，并且继承正确的样式
    const allElements = clonedSvg.querySelectorAll('*');
    allElements.forEach(element => {
      const el = element as HTMLElement;
      if (el.style) {
        el.style.overflow = 'visible';
        // 确保文本和形状不会被裁剪
        if (el.tagName === 'text' || el.tagName === 'tspan') {
          el.style.textAnchor = el.style.textAnchor || 'start';
          el.style.dominantBaseline = el.style.dominantBaseline || 'auto';
        }
        // 确保路径和形状完全可见
        if (el.tagName === 'path' || el.tagName === 'g') {
          el.style.overflow = 'visible';
        }
      }
    });
    
    // 复制原始SVG的样式表
    const originalStyles = svg.ownerDocument?.querySelectorAll('style') || [];
    originalStyles.forEach(style => {
      const clonedStyle = style.cloneNode(true);
      clonedSvg.appendChild(clonedStyle);
    });
    
    exportContainer.appendChild(clonedSvg);
    container.appendChild(exportContainer);
    document.body.appendChild(container);
    
    // 等待DOM更新完成
    return new Promise<{ container: HTMLElement; exportContainer: HTMLElement; width: number; height: number }>((resolve) => {
      // 给一些时间让浏览器完成渲染
      setTimeout(() => {
        resolve({ container, exportContainer, width: svgWidth, height: svgHeight });
      }, 100);
    });
  };

  const handleExport = async (type: 'png' | 'jpg' | 'pdf' | 'html') => {
    try {
      if (type === 'html' && codeType === 'markdown') {
        // 生成完整的 HTML 文档
        const htmlContent = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Markdown Export</title>
              <script src="https://cdn.tailwindcss.com"></script>
              <script>
                tailwind.config = {
                  darkMode: 'class',
                  theme: {
                    extend: {}
                  }
                }
              </script>
              <style>
                /* 添加必要的样式 */
                body {
                  margin: 0;
                  padding: 20px;
                  background: ${exportTheme === 'light' ? 'white' : '#1a1a1a'};
                  color: ${exportTheme === 'light' ? 'black' : 'white'};
                }
                .markdown-preview {
                  max-width: none;
                  padding: 20px;
                }
                /* 确保代码块样式正确 */
                pre {
                  background-color: ${exportTheme === 'light' ? '#f3f4f6' : '#374151'};
                  padding: 1rem;
                  border-radius: 0.375rem;
                }
                code {
                  color: inherit;
                }
                /* 确保表格样式正确 */
                table {
                  border-collapse: collapse;
                  width: 100%;
                  margin: 1rem 0;
                }
                th, td {
                  border: 1px solid ${exportTheme === 'light' ? '#e5e7eb' : '#4b5563'};
                  padding: 0.5rem;
                }
                th {
                  background-color: ${exportTheme === 'light' ? '#f9fafb' : '#374151'};
                }
              </style>
            </head>
            <body class="${exportTheme === 'dark' ? 'dark' : ''}">
              ${ReactDOMServer.renderToString(
                <MarkdownPreview code={code} />
              )}
            </body>
          </html>
        `;

        const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `markdown-${timestamp}.html`;
        
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast({
          title: "导出成功",
          description: "已导出为HTML格式",
        });
        return;
      }

      const prepared = await prepareExport();
      if (!prepared) {
        toast({
          title: "导出失败",
          description: "未找到可导出的内容",
          variant: "destructive",
        });
        return;
      }

      const { container, exportContainer, width: svgWidth, height: svgHeight } = prepared as { container: HTMLElement; exportContainer: HTMLElement; width: number; height: number };
      let dataUrl: string;
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `${codeType}-${timestamp}`;

      try {
        switch (type) {
          case 'png':
            dataUrl = await toPng(exportContainer, { 
              quality: 1.0,
              pixelRatio: 2, // 提高像素比例以获得更清晰的图像
              cacheBust: true, // 防止缓存问题
              width: svgWidth ? svgWidth + 40 : undefined,
              height: svgHeight ? svgHeight + 40 : undefined,
              style: {
                transform: 'scale(1)', // 移除缩放，使用 pixelRatio 代替
                transformOrigin: 'top left'
              }
            });
            downloadImage(dataUrl, `${filename}.png`);
            break;
          case 'jpg':
            dataUrl = await toJpeg(exportContainer, { 
              quality: 0.95,
              pixelRatio: 2, // 提高像素比例以获得更清晰的图像
              cacheBust: true, // 防止缓存问题
              width: svgWidth ? svgWidth + 40 : undefined,
              height: svgHeight ? svgHeight + 40 : undefined,
              style: {
                transform: 'scale(1)', // 移除缩放，使用 pixelRatio 代替
                transformOrigin: 'top left'
              }
            });
            downloadImage(dataUrl, `${filename}.jpg`);
            break;
          case 'pdf':
            // 使用 html-to-image 将内容转换为图片
            dataUrl = await toPng(exportContainer, {
              quality: 1.0,
              pixelRatio: 2, // 提高像素比例
              cacheBust: true,
              width: svgWidth ? svgWidth + 40 : undefined,
              height: svgHeight ? svgHeight + 40 : undefined,
              style: {
                transform: 'scale(1)',
                transformOrigin: 'top left'
              }
            });
            const img = new Image();
            img.src = dataUrl;
            await new Promise((resolve, reject) => {
              img.onload = resolve;
              img.onerror = reject;
            });
            
            // 获取实际的图片尺寸
            const actualWidth = svgWidth ? svgWidth + 40 : img.width / 2;
            const actualHeight = svgHeight ? svgHeight + 40 : img.height / 2;
            
            // 创建PDF，使用实际尺寸
            const pdf = new jsPDF({
              orientation: actualWidth > actualHeight ? 'landscape' : 'portrait',
              unit: 'px',
              format: [actualWidth, actualHeight]
            });
            
            // 添加图片到PDF，使用实际尺寸
            pdf.addImage(dataUrl, 'PNG', 0, 0, actualWidth, actualHeight);
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
      console.error('Export error:', error);
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
      {codeType === 'mermaid' && (
        <>
          <Button variant="outline" size="sm" onClick={() => handleExport('png')}>
            PNG
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport('jpg')}>
            JPG
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport('pdf')}>
            PDF
          </Button>
        </>
      )}
      {codeType === 'markdown' && (
        <Button variant="outline" size="sm" onClick={() => handleExport('html')}>
          HTML
        </Button>
      )}
      <div className="w-px h-4 bg-border mx-1" />
      <ThemeToggle 
        onThemeChange={handleThemeChange}
      />
    </div>
  );
}; 