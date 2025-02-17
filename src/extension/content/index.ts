// 监听来自popup的消息
chrome.runtime.onMessage.addListener((message, _sender, _sendResponse) => {
  console.log('Content script received message:', message)
}) 