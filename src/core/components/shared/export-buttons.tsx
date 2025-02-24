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

  const prepareExport = () => {
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
      return new Promise<{ container: HTMLElement; exportContainer: HTMLElement }>((resolve) => {
        setTimeout(() => {
          resolve({ container, exportContainer });
        }, 100);
      });
    } else {
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
      
      return Promise.resolve({ container, exportContainer, width, height });
    }
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

      const { container, exportContainer } = prepared;
      let dataUrl: string;
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `${codeType}-${timestamp}`;

      try {
        switch (type) {
          case 'png':
            dataUrl = await toPng(exportContainer, { 
              quality: 1.0,
              style: {
                transform: 'scale(2)', // 提高导出图片的清晰度
                transformOrigin: 'top left'
              }
            });
            downloadImage(dataUrl, `${filename}.png`);
            break;
          case 'jpg':
            dataUrl = await toJpeg(exportContainer, { 
              quality: 0.95,
              style: {
                transform: 'scale(2)', // 提高导出图片的清晰度
                transformOrigin: 'top left'
              }
            });
            downloadImage(dataUrl, `${filename}.jpg`);
            break;
          case 'pdf':
            // 使用 html-to-image 将内容转换为图片
            dataUrl = await toPng(exportContainer, {
              style: {
                transform: 'scale(2)', // 提高导出图片的清晰度
                transformOrigin: 'top left'
              }
            });
            const img = new Image();
            img.src = dataUrl;
            await new Promise((resolve, reject) => {
              img.onload = resolve;
              img.onerror = reject;
            });
            
            // 获取导出容器的尺寸
            const rect = exportContainer.getBoundingClientRect();
            const pdf = new jsPDF({
              orientation: rect.width > rect.height ? 'landscape' : 'portrait',
              unit: 'px',
              format: [rect.width * 2, rect.height * 2] // 调整 PDF 尺寸以匹配高清图片
            });
            
            pdf.addImage(dataUrl, 'PNG', 0, 0, rect.width * 2, rect.height * 2);
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