// 监听扩展图标点击事件
chrome.action.onClicked.addListener(() => {
  // 在新标签页中打开编辑器
  if (process.env.NODE_ENV === 'development') {
    // 开发模式：使用 Vite 开发服务器
    chrome.tabs.create({
      url: 'http://localhost:5173'
    })
  } else {
    // 生产模式：使用打包后的文件
    chrome.tabs.create({
      url: chrome.runtime.getURL('index.html')
    })
  }
})

// 监听安装事件
chrome.runtime.onInstalled.addListener(() => {
  console.log('Mermaid Preview extension installed')
}) 