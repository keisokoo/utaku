// let popupIsOn = false
// chrome.runtime.onConnect.addListener(function (port) {
//   if (port.name === 'popup') {
//     popupIsOn = true
//     console.log('popup has been opened!')
//     port.onDisconnect.addListener(function () {
//       console.log('popup has been closed')
//       popupIsOn = false
//     })
//   }
// })
import browser from 'webextension-polyfill'
function createWindow(tab: chrome.tabs.Tab) {
  if (tab) {
    browser.tabs.get(tab.id ?? 0).then((tab) => {
      console.log('b tab', tab)
    })
  }
  chrome.tabs.query(
    { url: chrome.runtime.getURL('popup/index.html') },
    (tabs) => {
      if (tabs.length > 0 && tabs[0].id) {
        const tabId = tabs[0].id
        console.log('tabId', tabId)
        console.log('tab', tab)

        chrome.tabs.get(tabId, (tab) => {
          chrome.windows.update(tab.windowId, { focused: true }, (win) => {
            chrome.tabs.update(tabId, { active: true })
          })
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
  )
}

chrome.action.onClicked.addListener(createWindow)
