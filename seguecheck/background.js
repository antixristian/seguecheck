const INSTAGRAM_URL_PATTERN = /^https:\/\/www\.instagram\.com\//i;

chrome.action.onClicked.addListener((tab) => {
  if (tab?.id && tab.url && INSTAGRAM_URL_PATTERN.test(tab.url)) {
    injectApp(tab.id);
    return;
  }

  chrome.tabs.create({ url: "https://www.instagram.com/" }, (createdTab) => {
    if (!createdTab?.id) return;
    const targetTabId = createdTab.id;

    const cleanup = () => {
      chrome.tabs.onUpdated.removeListener(handleUpdated);
      chrome.tabs.onRemoved.removeListener(handleRemoved);
    };

    const handleUpdated = (tabId, changeInfo) => {
      if (tabId === targetTabId && changeInfo.status === "complete") {
        cleanup();
        injectApp(targetTabId);
      }
    };

    const handleRemoved = (tabId) => {
      if (tabId === targetTabId) {
        cleanup();
      }
    };

    chrome.tabs.onUpdated.addListener(handleUpdated);
    chrome.tabs.onRemoved.addListener(handleRemoved);
  });
});

function injectApp(tabId) {
  chrome.scripting
    .executeScript({
      files: ["contentStyle.js", "contentScript.js"],
      target: { tabId }
    })
    .catch((error) => {
      console.warn("[SegueCheck] Falha ao injetar os scripts na aba:", error);
    });
}
