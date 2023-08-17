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
async function createWindow(tab: browser.Tabs.Tab) {
  console.log('tab', tab)
  const currentTabs = await browser.tabs.query({
    url: browser.runtime.getURL('popup/index.html'),
  })
  console.log('currentTabs1', currentTabs)

  const firstTab =
    currentTabs.length > 0 && currentTabs[0].id ? currentTabs[0] : null
  if (firstTab && firstTab.windowId) {
    console.log('firstTab', firstTab)

    await browser.windows.update(firstTab.windowId, { focused: true })
    await browser.tabs.update(firstTab.id, { active: true })
  } else {
    await browser.windows.create({
      type: 'popup',
      url: browser.runtime.getURL('popup/index.html'),
      focused: true,
      width: 1024,
      height: 768,
    })
  }
}

browser.action.onClicked.addListener(async (tab) => createWindow(tab))
