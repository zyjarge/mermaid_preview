// 监听来自popup的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'THEME_CHANGED') {
    // 更新页面主题
    document.documentElement.classList.toggle('dark', message.theme === 'dark')
  }
  return true
}) 