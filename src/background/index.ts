
import browser from 'webextension-polyfill';
let activeTabInfo: {
  "tabId": number,
  "windowId": number
} | null = null
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const tabs = await chrome.tabs.query({
    url: chrome.runtime.getURL('popup/index.html'),
  });
  const currentTabInfo = await chrome.tabs.get(activeInfo.tabId);
  if (!currentTabInfo.url?.includes('http')) return
  if (tabs?.[0]?.id && tabs[0].id === activeInfo.tabId) {
    return
  } else {
    activeTabInfo = activeInfo
  }

});

chrome.runtime.onConnect.addListener(function (port) {
  if (port.name === 'popup') {
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach((tab) => {
        if (tab.id && tab.id > 0)
          chrome.tabs.sendMessage(tab.id, { message: 'utaku-active' }, () => {
            if (chrome.runtime.lastError) {
              console.log('Error:', chrome.runtime.lastError);
            }
          });
      });
    });
    chrome.action.setIcon({ path: '/icon34-active.png' })
    port.onDisconnect.addListener(function () {
      chrome.action.setIcon({ path: '/icon34.png' })
      chrome.tabs.query({}, (tabs) => {
        tabs.forEach((tab) => {
          if (tab.id && tab.id > 0)
            chrome.tabs.sendMessage(tab.id, { message: 'utaku-quit' }, () => {
              if (chrome.runtime.lastError) {
                console.log('Error:', chrome.runtime.lastError);
              }
            });
        });
      });
    })
  }
})
async function getPopupTab() {
  const currentTabs = await browser.tabs.query({
    url: browser.runtime.getURL('popup/index.html'),
  })
  return currentTabs.length > 0 && currentTabs[0].id ? currentTabs[0] : null
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function createWindow(_tab: chrome.tabs.Tab) {
  const firstTab = await getPopupTab()
  if (firstTab && firstTab.windowId) {

    chrome.windows.update(firstTab.windowId, { focused: true }, () => {
      if (firstTab.id) chrome.tabs.update(firstTab.id, { active: true })
    })

  } else {
    chrome.windows.create({
      type: 'popup',
      url: chrome.runtime.getURL('popup/index.html'),
      focused: true,
      width: 1024,
      height: 768,
    })
  }
}

function onMessage(
  request: {
    message: string
    data: unknown
  },
  _sender: chrome.runtime.MessageSender,
  sendResponse: (response?: { data: number | object | null; }) => void
) {
  if (request.message === 'available') {
    getPopupTab().then((popupTab) => {
      sendResponse({ data: popupTab })
    })
  }
  if (request.message === 'activeTabInfo') {
    sendResponse({ data: activeTabInfo })
  }
  return true;
}
if (!chrome.runtime.onMessage.hasListener(onMessage)) {
  chrome.runtime.onMessage.addListener(onMessage)
}
chrome.action.onClicked.addListener((tab) => createWindow(tab))
