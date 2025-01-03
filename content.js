// 检测文件内容
async function detectAndRenderMermaid() {
  // 获取文件内容
  const content = document.body.innerText;
  
  // 创建新的页面布局
  document.body.innerHTML = `
    <div class="container">
      <div class="editor-panel">
        <textarea id="mermaidCode">${content}</textarea>
      </div>
      <div class="preview-panel">
        <div class="toolbar vertical">
          <button id="refreshPreview" title="刷新预览">
            <svg viewBox="0 0 24 24" width="16" height="16">
              <path fill="currentColor" d="M17.65 6.35A7.958 7.958 0 0 0 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0 1 12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
            </svg>
          </button>
          <button id="zoomIn" title="放大">
            <svg viewBox="0 0 24 24" width="16" height="16">
              <path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
          </button>
          <button id="zoomReset" title="重置">
            <svg viewBox="0 0 24 24" width="16" height="16">
              <path fill="currentColor" d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>
            </svg>
          </button>
          <button id="zoomOut" title="缩小">
            <svg viewBox="0 0 24 24" width="16" height="16">
              <path fill="currentColor" d="M19 13H5v-2h14v2z"/>
            </svg>
          </button>
          <div class="divider"></div>
          <div class="export-buttons">
            <button id="exportJPG" title="导出为JPG">
              <svg viewBox="0 0 24 24" width="16" height="16">
                <path fill="currentColor" d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM9 7.5l3 3.86L18 12l3 3.86V19H3v-2.14l4-5.14z"/>
              </svg>
            </button>
            <button id="exportPDF" title="导出为PDF">
              <svg viewBox="0 0 24 24" width="16" height="16">
                <path fill="currentColor" d="M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8.5 7.5c0 .83-.67 1.5-1.5 1.5H9v2H7.5V7H10c.83 0 1.5.67 1.5 1.5v1zm5 2c0 .83-.67 1.5-1.5 1.5h-2.5V7H15c.83 0 1.5.67 1.5 1.5v3zm4-3H19v1h1.5V11H19v2h-1.5V7h3v1.5zM9 9.5h1v-1H9v1zM4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm10 5.5h1v-3h-1v3z"/>
              </svg>
            </button>
          </div>
        </div>
        <div id="preview" class="preview-content"></div>
      </div>
    </div>
  `;

  // 注入样式
  const style = document.createElement('style');
  style.textContent = `
    body {
      margin: 0;
      padding: 20px;
      font-family: Arial, sans-serif;
    }
    .container {
      display: flex;
      width: 100%;
      height: calc(100vh - 40px);
      gap: 20px;
    }
    .editor-panel {
      flex: 1;
      padding: 10px;
      border: 1px solid #ccc;
      border-radius: 4px;
    }
    .preview-panel {
      flex: 1;
      display: flex;
      flex-direction: row;
      border: 1px solid #ccc;
      border-radius: 4px;
      position: relative;
    }
    #mermaidCode {
      width: 100%;
      height: 100%;
      resize: none;
      border: none;
      outline: none;
      font-family: monospace;
    }
    .toolbar {
      width: 36px;
      background: #f5f5f5;
      border-right: 1px solid #ccc;
      display: flex;
      flex-direction: column;
      gap: 10px;
      padding: 8px 4px;
      z-index: 1;
    }
    .divider {
      height: 1px;
      background-color: #ccc;
      margin: 4px 0;
    }
    .export-buttons {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .toolbar button {
      padding: 6px;
      border: 1px solid #ccc;
      border-radius: 4px;
      background: #fff;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      transition: all 0.2s ease;
    }
    .toolbar button:hover {
      background: #f0f0f0;
      transform: scale(1.05);
    }
    .export-buttons button {
      border-color: #8bc34a;
    }
    .export-buttons button:hover {
      background: #f1f8e9;
    }
    .preview-wrapper {
      flex: 1;
      position: relative;
      overflow: hidden;
    }
    .preview-content {
      flex: 1;
      padding: 10px;
      overflow: auto;
      position: relative;
      cursor: grab;
      width: calc(100% - 36px);
    }
    #refreshPreview {
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s;
    }
    #refreshPreview:hover {
      transform: rotate(180deg);
    }
    .toolbar svg {
      width: 14px;
      height: 14px;
    }
    .preview-container {
      min-width: 100%;
      min-height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .mermaid {
      position: relative;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .mermaid svg {
      width: auto;
      height: auto;
      max-width: none;
      max-height: none;
    }
  `;
  document.head.appendChild(style);

  // 注入Mermaid脚本
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('mermaid.min.js');
  script.onload = () => {
    // 初始化Mermaid
    window.mermaid.initialize({
      startOnLoad: true,
      theme: 'default',
      securityLevel: 'loose',
      flowchart: {
        htmlLabels: true,
        curve: 'basis'
      }
    });
    
    // 加载 jsPDF
    const jspdfScript = document.createElement('script');
    jspdfScript.src = chrome.runtime.getURL('jspdf.umd.min.js');
    jspdfScript.onload = () => {
      // 添加预览功能
      initializePreview();
    };
    document.head.appendChild(jspdfScript);
  };
  document.head.appendChild(script);
}

// 初始化预览功能
function initializePreview() {
  const editor = document.getElementById('mermaidCode');
  const preview = document.getElementById('preview');
  let currentScale = 1;

  // 实时预览
  async function updatePreview() {
    try {
      const code = editor.value.trim();
      // 检查代码是否为空
      if (!code) {
        preview.innerHTML = '<div style="display: flex; justify-content: center; align-items: center; height: 100%; color: #999;">预览区域</div>';
        return;
      }
      
      // 清除之前的内容
      preview.innerHTML = '';
      
      // 创建新的容器并设置 mermaid 标记
      const container = document.createElement('div');
      container.className = 'mermaid';
      container.textContent = code;
      preview.appendChild(container);
      
      // 重新渲染
      await window.mermaid.run({
        nodes: [container]
      });
    } catch (error) {
      console.error('Mermaid 渲染错误:', error);
      preview.innerHTML = `<div class="error" style="color: red; padding: 10px;">
        图表语法错误: ${error.message}
      </div>`;
    }
  }

  // 刷新按钮功能
  document.getElementById('refreshPreview').addEventListener('click', async () => {
    try {
      await updatePreview();
      // 等待渲染完成后自动调整缩放
      setTimeout(autoFitPreview, 100);
      // 添加按钮旋转动画效果
      const button = document.getElementById('refreshPreview');
      button.style.transform = 'rotate(360deg)';
      setTimeout(() => {
        button.style.transform = 'rotate(0deg)';
      }, 500);
    } catch (error) {
      console.error('刷新预览失败:', error);
    }
  });

  // 添加拖动功能
  let isDragging = false;
  let startX, startY, scrollLeft, scrollTop;
  
  preview.addEventListener('mousedown', (e) => {
    isDragging = true;
    preview.style.cursor = 'grabbing';
    startX = e.pageX - preview.offsetLeft;
    startY = e.pageY - preview.offsetTop;
    scrollLeft = preview.scrollLeft;
    scrollTop = preview.scrollTop;
  });
  
  preview.addEventListener('mouseleave', () => {
    isDragging = false;
    preview.style.cursor = 'grab';
  });
  
  preview.addEventListener('mouseup', () => {
    isDragging = false;
    preview.style.cursor = 'grab';
  });
  
  preview.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - preview.offsetLeft;
    const y = e.pageY - preview.offsetTop;
    const moveX = x - startX;
    const moveY = y - startY;
    preview.scrollLeft = scrollLeft - moveX;
    preview.scrollTop = scrollTop - moveY;
  });
  
  // 自动调整缩放以适应预览区域
  function autoFitPreview() {
    const svg = preview.querySelector('svg');
    if (!svg) return;
  
    const previewRect = preview.getBoundingClientRect();
    const svgRect = svg.getBoundingClientRect();
  
    const scaleX = (previewRect.width - 40) / svgRect.width;
    const scaleY = (previewRect.height - 40) / svgRect.height;
    currentScale = Math.min(scaleX, scaleY, 1); // 不超过100%
  
    updatePreviewScale();
  }
  
  // 初始预览
  updatePreview().then(() => {
    // 等待渲染完成后自动调整缩放
    setTimeout(autoFitPreview, 100);
  });

  // 缩放功能
  document.getElementById('zoomIn').addEventListener('click', () => {
    currentScale += 0.1;
    updatePreviewScale();
  });

  // 导出JPG功能
  document.getElementById('exportJPG').addEventListener('click', async () => {
    try {
      const svg = preview.querySelector('svg');
      if (!svg) {
        console.error('没有找到可导出的图表');
        return;
      }
  
      // 创建一个临时的 Canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
  
      // 获取 SVG 的尺寸和内容
      const svgData = new XMLSerializer().serializeToString(svg);
      // 添加 SVG 头信息和尺寸
      const svgSize = svg.getBoundingClientRect();
      const svgString = `
        <svg xmlns="http://www.w3.org/2000/svg" width="${svgSize.width}" height="${svgSize.height}">
          <rect width="100%" height="100%" fill="white"/>
          ${svgData}
        </svg>
      `;
      
      // 转换为 base64
      const base64Data = btoa(unescape(encodeURIComponent(svgString)));
      const img = new Image();
      img.crossOrigin = 'anonymous';  // 添加跨域支持
      
      // 使用 base64 数据
      img.src = `data:image/svg+xml;base64,${base64Data}`;
  
      // 当图片加载完成后进行导出
      img.onload = () => {
        // 设置 canvas 尺寸为图片的实际尺寸
        // 使用2倍尺寸以获得更高的清晰度
        canvas.width = svgSize.width * 2;
        canvas.height = svgSize.height * 2;
  
        // 绘制图片到 canvas
        ctx.fillStyle = 'white';  // 设置白色背景
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        // 缩放上下文以匹配更大的尺寸
        ctx.scale(2, 2);
        ctx.drawImage(img, 0, 0);
  
        // 转换为 JPG 并下载
        canvas.toBlob((blob) => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'mermaid-diagram.jpg';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }, 'image/jpeg', 1.0);  // 使用最高质量 1.0
      };
    } catch (error) {
      console.error('导出JPG失败:', error);
    }
  });

  // 导出PDF功能
  document.getElementById('exportPDF').addEventListener('click', async () => {
    try {
      const svg = preview.querySelector('svg');
      if (!svg) {
        console.error('没有找到可导出的图表');
        return;
      }
  
      // 获取 SVG 的尺寸和内容
      const svgData = new XMLSerializer().serializeToString(svg);
      const svgSize = svg.getBoundingClientRect();
  
      // 创建一个临时的 Canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // 使用2倍尺寸以获得更高的清晰度
      canvas.width = svgSize.width * 2;
      canvas.height = svgSize.height * 2;
  
      // 准备图片数据
      const svgString = `
        <svg xmlns="http://www.w3.org/2000/svg" width="${svgSize.width}" height="${svgSize.height}">
          <rect width="100%" height="100%" fill="white"/>
          ${svgData}
        </svg>
      `;
      
      const img = new Image();
      img.crossOrigin = 'anonymous';
  
      img.onload = () => {
        // 绘制到 canvas
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.scale(2, 2);
        ctx.drawImage(img, 0, 0);
  
        // 转换为图片数据
        const imgData = canvas.toDataURL('image/jpeg', 1.0);
  
        // 创建 PDF
        const pdf = new window.jspdf.jsPDF({
          orientation: svgSize.width > svgSize.height ? 'landscape' : 'portrait',
          unit: 'px',
          format: [svgSize.width + 40, svgSize.height + 40]
        });
  
        // 在 PDF 中添加图片
        pdf.addImage(imgData, 'JPEG', 20, 20, svgSize.width, svgSize.height);
  
        // 保存 PDF
        pdf.save('mermaid-diagram.pdf');
      };
  
      // 加载图片
      img.src = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgString)))}`;
  
    } catch (error) {
      console.error('导出PDF失败:', error);
    }
  });

  document.getElementById('zoomOut').addEventListener('click', () => {
    currentScale = Math.max(0.1, currentScale - 0.1);
    updatePreviewScale();
  });

  document.getElementById('zoomReset').addEventListener('click', () => {
    autoFitPreview(); // 重置时自动适应预览区域
    updatePreviewScale();
  });

  function updatePreviewScale() {
    const svg = preview.querySelector('svg');
    if (svg) {
      svg.style.transform = `scale(${currentScale})`;
      svg.style.transformOrigin = 'center center';
    }
  }
}

// 启动检测和渲染
detectAndRenderMermaid(); 