import classNames from 'classnames'
import React, { Fragment, useEffect, useState } from 'react'
import { FaDownload, FaShare } from 'react-icons/fa'
import {
  GrayScaleFill,
  PrimaryButton,
  WhiteFill,
} from '../../components/Buttons'
import Tooltip from '../../components/Tooltip'
import { lang } from '../../utils'
import PopupStyle from './Popup.styled'
import useFileDownload from './hooks/useFileDownload'
import useWebRequests, { ImageResponseDetails } from './hooks/useWebRequests'
import './index.scss'

const App = (): JSX.Element => {
  const results = useWebRequests(true)
  const { folderName, downloadedItem, handleFolderName } = useFileDownload()
  const {
    queueGroup,
    tabList,
    handleRemove,
    disposedGroup,
    errorGroup,
    clearListByTabId,
    requeueDisposeList,
  } = results
  const [openTabList, set_openTabList] = useState<number[]>([])
  const [folderNameList, set_folderNameList] = useState<string[]>([])

  const handleClickTab = (tabId?: number) => {
    if (!tabId) return
    chrome.tabs.get(tabId, (tab) => {
      if (!tab) return
      if (chrome.runtime.lastError) {
        console.log(chrome.runtime.lastError.message)
        return
      } else {
        chrome.windows.update(tab.windowId, { focused: true }, () => {
          chrome.tabs.update(tabId, { active: true })
        })
        chrome.tabs.sendMessage(tabId, { message: 'utaku-mount' }, () => {
          if (chrome.runtime.lastError) {
            console.log(chrome.runtime.lastError.message)
          }
        })
      }
    })
  }

  const handleReloadTab = (tabId?: number) => {
    if (!tabId) return
    chrome.tabs.get(tabId, () => {
      if (chrome.runtime.lastError) {
        console.log(chrome.runtime.lastError.message)
      } else {
        chrome.tabs.reload(tabId)
      }
    })
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
        if (!data) return
        chrome.tabs.get(data.tabId, () => {
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
        })
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
      sendResponse: (response?: {
        data: object
        downloaded?: string[]
        downloadAble?: ImageResponseDetails[]
      }) => void
    ) => {
      const senderTabId = sender?.tab?.id
      if (!senderTabId) return
      if (request.message === 'delete-image') {
        const disposedData =
          request.data as chrome.webRequest.WebResponseHeadersDetails & {
            error: boolean
          }
        handleRemove(disposedData)
      }
      if (request.message === 'get-items') {
        const data = queueGroup[senderTabId]
        const downloadAbleData = disposedGroup[senderTabId]
        sendResponse({
          data,
          downloaded: downloadedItem,
          downloadAble: downloadAbleData,
        })
      }
      if (request.message === 'download') {
        const downloadList = request.data as string[]
        for (let i = 0; i < downloadList.length; i++) {
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
    disposedGroup,
    queueGroup,
    results.handleRemove,
    downloadedItem,
    folderName,
    folderNameList,
  ])
  return (
    <>
      <PopupStyle.Wrap>
        {tabList.map((tabItem) => {
          const tabId = tabItem.id as keyof typeof queueGroup | undefined
          const queueList = tabId && queueGroup ? queueGroup[tabId] ?? [] : []
          const disposedList =
            tabId && disposedGroup ? disposedGroup[tabId] ?? [] : []
          const errorList = tabId && errorGroup ? errorGroup[tabId] ?? [] : []
          return (
            <Fragment key={tabItem.id}>
              <PopupStyle.ColumnWrap
                className={classNames({ active: tabItem.active })}
              >
                <PopupStyle.Item>
                  {tabItem.tooltip && <Tooltip>{tabItem.tooltip}</Tooltip>}
                  <PopupStyle.Row
                    className="description"
                    onMouseEnter={(e) => {
                      const targetText = e.currentTarget
                      results.handleTooltip(
                        tabItem,
                        targetText
                          ? targetText.innerText.replace(/\n/g, '')
                          : ''
                      )
                    }}
                    onMouseLeave={() => {
                      results.handleTooltip(tabItem, '')
                    }}
                  >
                    <span className="title">{tabItem.title}</span>::
                    <span className="url">{tabItem.url}</span>
                    <span className="id">[{tabItem.id}]</span>
                  </PopupStyle.Row>
                  <PopupStyle.Row>
                    <GrayScaleFill
                      _mini
                      onClick={() => {
                        if (!tabId) return
                        if (typeof tabId !== 'number') return
                        clearListByTabId(tabId)
                      }}
                    >
                      {lang('clear')}
                    </GrayScaleFill>
                    <WhiteFill
                      _mini
                      onClick={(e) => {
                        e.stopPropagation()
                        handleReloadTab(tabItem.id)
                      }}
                    >
                      {lang('refresh')}
                    </WhiteFill>
                  </PopupStyle.Row>
                </PopupStyle.Item>
                <PopupStyle.InfoWrap
                  className={classNames({ active: tabItem.active })}
                >
                  <PopupStyle.Info>
                    <span className="length">
                      ({lang('disposed_item')}: {disposedList?.length ?? 0})
                    </span>
                    <span className="length">
                      ({lang('queue')}: {queueList?.length ?? 0})
                    </span>
                    <span className="length">
                      ({lang('error')}: {errorList?.length ?? 0})
                    </span>
                  </PopupStyle.Info>
                  <PopupStyle.Row>
                    <GrayScaleFill
                      _mini
                      disabled={disposedList.length < 1}
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
                      {lang('list')}
                    </GrayScaleFill>
                    <PrimaryButton
                      _mini
                      onClick={(e) => {
                        e.stopPropagation()
                        handleClickTab(tabItem.id)
                      }}
                    >
                      {lang('enter')}
                    </PrimaryButton>
                    <WhiteFill
                      _mini
                      disabled={disposedList.length < 1}
                      onClick={() => {
                        if (!tabId) return
                        if (typeof tabId !== 'number') return
                        requeueDisposeList(tabId)
                      }}
                    >
                      {lang('requeue')}
                    </WhiteFill>
                  </PopupStyle.Row>
                </PopupStyle.InfoWrap>
              </PopupStyle.ColumnWrap>
              {typeof tabId === 'number' && openTabList.includes(tabId) && (
                <PopupStyle.List>
                  <PopupStyle.ColumnList>
                    {disposedList.map((item) => {
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
                          <PopupStyle.Row>
                            <GrayScaleFill
                              _mini
                              onClick={() => {
                                window.open(url, '_blank')
                              }}
                            >
                              <FaShare />
                            </GrayScaleFill>
                            <PrimaryButton
                              _mini
                              onClick={() => {
                                chrome.downloads.download({ url })
                              }}
                            >
                              <FaDownload />
                            </PrimaryButton>
                          </PopupStyle.Row>
                        </PopupStyle.InnerRow>
                      )
                    })}
                  </PopupStyle.ColumnList>
                </PopupStyle.List>
              )}
            </Fragment>
          )
        })}
      </PopupStyle.Wrap>
    </>
  )
}

export default App
