// 监听扩展安装事件
chrome.runtime.onInstalled.addListener(() => {
  // 初始化存储
  chrome.storage.local.set({
    theme: 'system',
  })
})

// 监听来自content script的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_THEME') {
    chrome.storage.local.get('theme', (result) => {
      sendResponse(result.theme || 'system')
    })
    return true
  }
}) 