// 监听扩展安装事件
chrome.runtime.onInstalled.addListener(() => {
  // 初始化存储
  chrome.storage.local.set({
    theme: 'system',
  })
})

// 监听来自content script的消息
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  console.log('Background script received message:', message)
  sendResponse({ status: 'ok' })
}) 