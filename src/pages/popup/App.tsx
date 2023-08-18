import React, { useEffect, useState } from 'react'
import useFileDownload from './hooks/useFileDownload'
import useWebRequests from './hooks/useWebRequests'

const objectKeys = <T extends object>(item: T) => {
  return Object.keys(item) as Array<keyof T>
}
const objectEntries = <T extends object>(item: T) => {
  return Object.entries(item) as Array<[keyof T, T[keyof T]]>
}

const App = (): JSX.Element => {
  const results = useWebRequests(true)
  const { folderName, downloadedItem, handleFolderName } = useFileDownload()
  const { sourceGroup } = results
  const [folderNameList, set_folderNameList] = useState<string[]>([])
  useEffect(() => {
    chrome.storage.sync.get(['folderName', 'folderNameList'], (items) => {
      if (items.folderName) handleFolderName(items.folderName)
      if (items.folderNameList) set_folderNameList(items.folderNameList)
    })
    chrome.runtime.connect({ name: 'popup' })
    const contentInit = () => {
      document.querySelector('.floating-button')?.classList.remove('hide')
    }
    const removeContentInit = () => {
      document.querySelector('.floating-button')?.classList.add('hide')
    }

    chrome.runtime.sendMessage(
      {
        message: 'activeTabInfo',
        data: chrome.runtime.id,
      },
      ({
        data,
      }: {
        data: {
          tabId: number
          windowId: number
        } | null
      }) => {
        if (chrome.runtime.lastError) {
          return
        }
        if (data) {
          chrome.scripting.executeScript({
            target: { tabId: data.tabId },
            func: contentInit,
            args: [],
          })
        }
        return true
      }
    )
    return () => {
      chrome.runtime.sendMessage(
        {
          message: 'activeTabInfo',
          data: chrome.runtime.id,
        },
        ({
          data,
        }: {
          data: {
            tabId: number
            windowId: number
          } | null
        }) => {
          if (chrome.runtime.lastError) {
            return
          }
          if (data) {
            chrome.scripting.executeScript({
              target: { tabId: data.tabId },
              func: removeContentInit,
              args: [],
            })
          }
          return true
        }
      )
    }
  }, [])
  useEffect(() => {
    const onMessage = (
      request: {
        message: string
        data: unknown
      },
      sender: chrome.runtime.MessageSender,
      sendResponse: (response?: { data: object; downloaded?: string[] }) => void
    ) => {
      const senderTabId = sender?.tab?.id
      if (!senderTabId) return
      if (request.message === 'get-items') {
        const data = sourceGroup[senderTabId]
        sendResponse({ data, downloaded: downloadedItem })
      }
      if (request.message === 'download') {
        const downloadList = request.data as string[]
        for (let i = 0; i < downloadList.length; i++) {
          results.handleRemove(downloadList[i])
          chrome.downloads.download({ url: downloadList[i] })
        }
      }
      if (request.message === 'getFolderName') {
        sendResponse({
          data: {
            folderName,
            folderNameList,
          },
        })
      }
    }
    if (!chrome.runtime.onMessage.hasListener(onMessage)) {
      chrome.runtime.onMessage.addListener(onMessage)
    }
    return () => {
      if (chrome.runtime.onMessage.hasListener(onMessage)) {
        chrome.runtime.onMessage.removeListener(onMessage)
      }
    }
  }, [
    sourceGroup,
    results.handleRemove,
    downloadedItem,
    folderName,
    folderNameList,
  ])
  useEffect(() => {
    console.log('results', results.sourceGroup)
  }, [results])
  return (
    <div>
      <h1>Popup Page!</h1>
      <p>허 참 어이가 없네?!</p>
      <div>
        {objectKeys(sourceGroup).map((result) => {
          const item = sourceGroup[result]
          return (
            <div key={String(result)}>
              <div>
                {String(result)}
                <span>{Object.keys(item).length}</span>
              </div>
              <div>
                {objectEntries(item).map(([key, value]) => {
                  return <div key={key}>{value.url}</div>
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default App
