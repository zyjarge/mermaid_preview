// 监听扩展图标点击事件
chrome.action.onClicked.addListener(() => {
  // 在新标签页中打开编辑器
  chrome.tabs.create({
    url: chrome.runtime.getURL('popup/index.html')
  })
})

// 监听安装事件
chrome.runtime.onInstalled.addListener(() => {
  console.log('Mermaid Preview extension installed')
}) 