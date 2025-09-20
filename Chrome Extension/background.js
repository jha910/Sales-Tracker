chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel.setOptions({
    path: 'sidepanel.html',
    enabled: true
  });
});

chrome.action.onClicked.addListener(async (tab) => {
  // Only opens side panel if the current tab supports it
  await chrome.sidePanel.open({ tabId: tab.id });
});
