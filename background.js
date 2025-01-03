chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({
    url: 'editor.html'
  });
}); 