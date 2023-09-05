
import browser from 'webextension-polyfill';
import { defaultMode, modeType } from '../atoms/settings';
let isSimpleMode = false
let folderName = 'utaku'

const activeTab = async (activeInfo: chrome.tabs.TabActiveInfo) => {
  if (!activeInfo) return
  chrome.tabs.get(activeInfo.tabId, function (tab) {
    if (chrome.runtime.lastError) console.log(chrome.runtime.lastError)
    if (!tab?.url?.startsWith('http')) return
    chrome.tabs.sendMessage(activeInfo.tabId, { message: 'utaku-current-active' }, (response) => {
      if (chrome.runtime.lastError) {
        chrome.action.setIcon({ path: '/icon34.png' })
        return
      }
      if (response === 'ok') {
        chrome.action.setIcon({ path: '/icon34.png' })
      }
      if (response === 'mounted') {
        chrome.action.setIcon({ path: '/icon34-simple.png' })
      }
    })
  })
}
function downloaded(url: string) {
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach((tab) => {
      if (tab.id && tab.id > 0)
        chrome.tabs.sendMessage(tab.id, { message: 'utaku-current-active' }, (response) => {
          if (chrome.runtime.lastError) {
            return
          }
          if (response === 'mounted' && tab.id) {
            chrome.tabs.sendMessage(tab.id, { message: 'utaku-downloaded', data: url })
          }
        });
    });
  });

}
function handleChangeMode(value: typeof modeType[number]) {
  value = typeof value === 'string' ? value : defaultMode
  if (value === 'simple') {
    isSimpleMode = true
    chrome.downloads.onDeterminingFilename.addListener(
      downloadFilenameSuggestOnBackground
    )
    chrome.downloads.onChanged.addListener(handleDownloadChangeOnBackground)
    chrome.tabs.onActivated.addListener(activeTab)
  } else {
    isSimpleMode = false
    chrome.downloads.onDeterminingFilename.removeListener(
      downloadFilenameSuggestOnBackground
    )
    chrome.downloads.onChanged.removeListener(handleDownloadChangeOnBackground)
    chrome.tabs.onActivated.removeListener(activeTab)
  }
}

chrome.storage.local.get(['modeType', 'folderName'], (results) => {
  if (results.modeType) handleChangeMode(results.modeType as typeof modeType[number] || defaultMode)
  if (results.folderName) folderName = results.folderName || 'utaku'
})
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
function quitUtaku() {
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
}
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
      quitUtaku()
    })
  }
})
chrome.runtime.onSuspend.addListener(function () {
  quitUtaku()
});
async function getPopupTab() {
  const currentTabs = await browser.tabs.query({
    url: browser.runtime.getURL('popup/index.html'),
  })
  return currentTabs.length > 0 && currentTabs[0].id ? currentTabs[0] : null
}
async function createWindow() {
  const results = await chrome.storage.local.get(['modeType', 'folderName'])
  handleChangeMode(results.modeType as typeof modeType[number] || defaultMode)
  folderName = results.folderName || 'utaku'
  if (results.modeType === 'enhanced') {
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
  } else {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (chrome.runtime.lastError) return
      const activeTab = tabs[0];
      if (activeTab.id) {
        chrome.tabs.sendMessage(activeTab.id, { message: 'utaku-current-active' }, (response) => {
          if (chrome.runtime.lastError) {
            if (activeTab.id) chrome.tabs.reload(activeTab.id)
          }
          if (response === 'ok' && activeTab.id) {
            chrome.action.setIcon({ path: '/icon34-simple.png' })
            chrome.tabs.sendMessage(activeTab.id, { message: 'utaku-mount' })
          }
          if (response === 'mounted' && activeTab.id) {
            chrome.action.setIcon({ path: '/icon34.png' })
            chrome.tabs.sendMessage(activeTab.id, { message: 'utaku-quit' })
          }
          return false
        })
      }
    });
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
  const senderId = _sender.tab?.id
  if (request.message === 'open-options') {
    chrome.runtime.openOptionsPage()
  }
  if (request.message === 'active-icon') {
    chrome.action.setIcon({ path: '/icon34-simple.png' })
  }
  if (request.message === 'inactive-icon') {
    chrome.action.setIcon({ path: '/icon34.png' })
  }
  if (request.message === 'set-folderName') {
    folderName = request.data as string
  }
  if (request.message === 'mode-change') {
    handleChangeMode(request.data as typeof modeType[number] || defaultMode)
    chrome.storage.local.set({ modeType: request.data }, () => {
      createWindow()
    })
  }
  if (request.message === 'simple-download') {
    const downloadList = request.data as string[]
    for (let i = 0; i < downloadList.length; i++) {
      chrome.downloads.download({ url: downloadList[i] })
    }
  }
  if (request.message === 'utaku-call-unmount' && senderId) {
    chrome.action.setIcon({ path: '/icon34.png' })
    chrome.tabs.sendMessage(senderId, { message: 'utaku-quit' }, () => {
      if (chrome.runtime.lastError) {
        console.log('Error:', chrome.runtime.lastError);
      }
    });
  }
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
chrome.action.onClicked.addListener(createWindow)

function handleDownloadChangeOnBackground(
  downloadDelta: chrome.downloads.DownloadDelta
) {
  getProgress(downloadDelta.id, () => { })
}
function getProgress(
  downloadId: number,
  callback: (percent: number) => void
) {
  if (!isSimpleMode) return
  chrome.downloads.search({ id: downloadId }, function (item) {
    if (item[0].totalBytes > 0) {
      downloaded(item[0].url)
      callback(item[0].bytesReceived / item[0].totalBytes)
    } else {
      callback(-1)
    }
  })
}

function downloadFilenameSuggestOnBackground(
  downloadItem: chrome.downloads.DownloadItem,
  suggest: (
    suggestion?: chrome.downloads.DownloadFilenameSuggestion | undefined
  ) => void
) {
  if (!isSimpleMode) return
  try {
    const manifestData = chrome.runtime.getManifest()
    const extensionName = manifestData.name
    const trimmed = folderName || 'utaku'
      .replace(/[^\x20-\x7E]/gim, '')
      .trim()
      .normalize('NFC')
    const checked =
      trimmed[trimmed.length - 1] === '/' ? trimmed : trimmed + '/'
    const fileName = checked + downloadItem.filename
    if (downloadItem.byExtensionName === extensionName) {
      suggest({
        filename: fileName,
        conflictAction: 'uniquify',
      })
    }
  } catch (error) {
    console.log('error', error)
  }
}