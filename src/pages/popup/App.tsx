import classNames from 'classnames'
import React, { useEffect, useState } from 'react'
import { PrimaryButton, WhiteFill } from '../../components/Buttons'
import Tooltip from '../../components/Tooltip'
import PopupStyle from './Popup.styled'
import useFileDownload from './hooks/useFileDownload'
import useWebRequests from './hooks/useWebRequests'
import './index.scss'

const App = (): JSX.Element => {
  const results = useWebRequests(true)
  const { folderName, downloadedItem, handleFolderName } = useFileDownload()
  const { sourceGroup, tabList } = results
  const [folderNameList, set_folderNameList] = useState<string[]>([])

  const handleClickTab = (tabId?: number) => {
    if (!tabId) return
    chrome.tabs.get(tabId, (tab) => {
      if (chrome.runtime.lastError) {
        console.log(chrome.runtime.lastError.message)
      } else {
        chrome.windows.update(tab.windowId, { focused: true }, () => {
          chrome.tabs.update(tabId, { active: true })
        })
      }
    })
  }

  const handleReloadTab = (tabId?: number) => {
    if (!tabId) return
    if (chrome.runtime.lastError) {
      console.log(chrome.runtime.lastError.message)
    } else {
      chrome.tabs.reload(tabId)
    }
  }

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
  return (
    <PopupStyle.Wrap>
      {tabList.map((tabItem) => {
        const tabId = tabItem.id as keyof typeof sourceGroup | undefined
        const groupList = tabId && sourceGroup ? sourceGroup[tabId] ?? {} : {}
        const sourceList = Object.values(groupList)
        return (
          <PopupStyle.Item
            key={tabItem.id}
            className={classNames({ active: tabItem.active })}
          >
            {tabItem.tooltip && <Tooltip>{tabItem.tooltip}</Tooltip>}
            <PopupStyle.Row
              className="description"
              onMouseEnter={(e) => {
                const targetText = e.currentTarget
                results.handleTooltip(
                  tabItem,
                  targetText ? targetText.innerText.replace(/\n/g, '') : ''
                )
              }}
              onMouseLeave={() => {
                results.handleTooltip(tabItem, '')
              }}
            >
              <span className="title">{tabItem.title}</span>::
              <span className="url">{tabItem.url}</span>
              <span className="id">[{tabItem.id}]</span>
              <span className="length">({sourceList?.length ?? 0})</span>
            </PopupStyle.Row>
            <PopupStyle.Row>
              <PrimaryButton
                onClick={(e) => {
                  e.stopPropagation()
                  handleClickTab(tabItem.id)
                }}
              >
                선택
              </PrimaryButton>
              <WhiteFill
                onClick={(e) => {
                  e.stopPropagation()
                  handleReloadTab(tabItem.id)
                }}
              >
                새로고침
              </WhiteFill>
            </PopupStyle.Row>
          </PopupStyle.Item>
        )
      })}
    </PopupStyle.Wrap>
  )
}

export default App
