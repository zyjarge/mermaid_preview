// 初始化mermaid配置
const config = {
  startOnLoad: true,
  theme: 'default',
  securityLevel: 'loose',
  fontFamily: 'monospace'
}

// 监听消息
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.type === 'RENDER_DIAGRAM') {
    // TODO: 实现图表渲染逻辑
    sendResponse({ success: true })
  }
}) 