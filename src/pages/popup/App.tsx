import classNames from 'classnames'
import React, { Fragment, useEffect, useState } from 'react'
import {
  GrayScaleFill,
  PrimaryButton,
  WhiteFill,
} from '../../components/Buttons'
import Tooltip from '../../components/Tooltip'
import PopupStyle from './Popup.styled'
import useFileDownload from './hooks/useFileDownload'
import useWebRequests from './hooks/useWebRequests'
import './index.scss'

const App = (): JSX.Element => {
  const results = useWebRequests(true)
  const { folderName, downloadedItem, handleFolderName } = useFileDownload()
  const { sourceGroup, tabList, set_sourceList, videoList } = results
  const [openTabList, set_openTabList] = useState<number[]>([])
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
      if (request.message === 'update-image-size') {
        const { requestId, width, height } = request.data as {
          requestId: string
          width: number
          height: number
        }
        set_sourceList((prev) => {
          return prev.map((tabItem) => {
            if (tabItem.requestId !== requestId) return tabItem
            return {
              ...tabItem,
              imageInfo: {
                width,
                height,
              },
            }
          })
        })
      }
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
      if (request.message === 'setFolderName') {
        const folderName = request.data as string
        handleFolderName(folderName)
        chrome.storage.sync.set({ folderName })
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
    <>
      <PopupStyle.Wrap>
        <WhiteFill
          onClick={() => {
            tabList.forEach((tabItem) => {
              if (!tabItem?.id) return
              chrome.tabs.reload(tabItem.id)
            })
            chrome.runtime.reload()
          }}
        >
          Runtime Reload
        </WhiteFill>
        <WhiteFill
          onClick={() => {
            console.log('videoList', videoList)
          }}
        >
          videoList
        </WhiteFill>
        <WhiteFill
          onClick={() => {
            const downloadList = videoList.map((item) => item.url)
            for (let i = 0; i < downloadList.length; i++) {
              results.handleRemove(downloadList[i])
              chrome.downloads.download({ url: downloadList[i] })
            }
          }}
        >
          download video
        </WhiteFill>
        {tabList.map((tabItem) => {
          const tabId = tabItem.id as keyof typeof sourceGroup | undefined
          const groupList = tabId && sourceGroup ? sourceGroup[tabId] ?? {} : {}
          const sourceList = Object.values(groupList)
          return (
            <Fragment key={tabItem.id}>
              <PopupStyle.Item
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
                  <GrayScaleFill
                    onClick={(e) => {
                      e.stopPropagation()
                      if (!tabItem?.id) return
                      set_openTabList((prev) => {
                        if (typeof tabId !== 'number') return prev
                        if (!prev.includes(tabId)) return [...prev, tabId]
                        return prev.filter((curr) => curr !== tabId)
                      })
                    }}
                  >
                    목록
                  </GrayScaleFill>
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
              {typeof tabId === 'number' && openTabList.includes(tabId) && (
                <PopupStyle.Item className="list">
                  <PopupStyle.Column>
                    {sourceList.map((item) => {
                      const { url, requestId, imageInfo } = item
                      return (
                        <PopupStyle.InnerRow
                          key={requestId}
                          className="description"
                        >
                          {imageInfo && (
                            <PopupStyle.SpanRow>
                              ({imageInfo.width}
                              <span>×</span>
                              {imageInfo.height})
                            </PopupStyle.SpanRow>
                          )}
                          <div className="url-details">{url}</div>
                        </PopupStyle.InnerRow>
                      )
                    })}
                  </PopupStyle.Column>
                </PopupStyle.Item>
              )}
            </Fragment>
          )
        })}
      </PopupStyle.Wrap>
    </>
  )
}

export default App
