// 初始化Mermaid
mermaid.initialize({
  startOnLoad: true,
  theme: 'default'
});

const editor = document.getElementById('mermaidCode');
const preview = document.getElementById('preview');
let currentScale = 1;

// 缩放功能
document.getElementById('zoomIn').addEventListener('click', () => {
  currentScale += 0.1;
  updatePreviewScale();
});

document.getElementById('zoomOut').addEventListener('click', () => {
  currentScale = Math.max(0.1, currentScale - 0.1);
  updatePreviewScale();
});

document.getElementById('zoomReset').addEventListener('click', () => {
  currentScale = 1;
  updatePreviewScale();
});

function updatePreviewScale() {
  preview.style.transform = `scale(${currentScale})`;
  preview.style.transformOrigin = 'top left';
}

// 实时预览功能
editor.addEventListener('input', updatePreview);

async function updatePreview() {
  try {
    const code = editor.value;
    const svg = await mermaid.render('preview-diagram', code);
    preview.innerHTML = svg;
  } catch (error) {
    preview.innerHTML = `<div class="error">图表语法错误: ${error.message}</div>`;
  }
}

// 导出功能
document.getElementById('exportSVG').addEventListener('click', () => {
  const svgData = preview.querySelector('svg').outerHTML;
  downloadFile(svgData, 'diagram.svg', 'image/svg+xml');
});

document.getElementById('exportPNG').addEventListener('click', async () => {
  const svg = preview.querySelector('svg');
  const canvas = await svgToCanvas(svg);
  canvas.toBlob(blob => {
    downloadFile(blob, 'diagram.png', 'image/png');
  });
});

document.getElementById('exportJPG').addEventListener('click', async () => {
  const svg = preview.querySelector('svg');
  const canvas = await svgToCanvas(svg);
  canvas.toBlob(blob => {
    downloadFile(blob, 'diagram.jpg', 'image/jpeg');
  }, 'image/jpeg');
});

// 辅助函数
function downloadFile(content, fileName, contentType) {
  const blob = content instanceof Blob ? content : new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

async function svgToCanvas(svg) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  // 设置canvas尺寸
  const svgRect = svg.getBoundingClientRect();
  canvas.width = svgRect.width;
  canvas.height = svgRect.height;
  
  // 转换SVG为图片
  const img = new Image();
  const svgBlob = new Blob([svg.outerHTML], {type: 'image/svg+xml'});
  const url = URL.createObjectURL(svgBlob);
  
  return new Promise((resolve) => {
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      resolve(canvas);
    };
    img.src = url;
  });
} 