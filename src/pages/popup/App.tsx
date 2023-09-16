import classNames from 'classnames'
import { produce } from 'immer'
import React, { Fragment, useEffect, useMemo, useState } from 'react'
import {
  FaDownload,
  FaList,
  FaQuestion,
  FaRegEdit,
  FaRocket,
  FaShare,
} from 'react-icons/fa'
import { RecoilRoot, useRecoilState } from 'recoil'
import { UtakuW } from '../../assets'
import {
  SettingsType,
  UrlRemapItem,
  defaultSettings,
  initialUrlRemapItem,
  modeType,
  settings,
} from '../../atoms/settings'
import {
  GrayScaleFill,
  PrimaryButton,
  WhiteFill,
} from '../../components/Buttons'
import Modal from '../../components/Modal/Modal'
import ModalBody from '../../components/Modal/ModalBody'
import Tooltip from '../../components/Tooltip'
import { WebResponseItem } from '../../content/types'
import { lang, syncSettings, urlToRemapItem } from '../../utils'
import PopupStyle from './Popup.styled'
import useFileDownload from './hooks/useFileDownload'
import useWebRequests from './hooks/useWebRequests'
import './index.scss'

import { Virtuoso } from 'react-virtuoso'
import { LiveStyles } from '../../components/PopupStyles/LiveStyles'
import StepEditor from '../../components/Remap/StepEditor'
import Settings from '../../components/Settings/Settings'

const Live = LiveStyles

function focusPopup() {
  chrome.tabs.query(
    {
      url: chrome.runtime.getURL('popup/index.html'),
    },
    (currentTabs) => {
      const firstTab =
        currentTabs.length > 0 && currentTabs[0].id ? currentTabs[0] : null
      if (firstTab && firstTab.windowId) {
        chrome.windows.update(firstTab.windowId, { focused: true }, () => {
          if (firstTab.id) chrome.tabs.update(firstTab.id, { active: true })
        })
      }
    }
  )
}
const App = () => {
  return (
    <RecoilRoot>
      <Main />
    </RecoilRoot>
  )
}
const targetType = ['disposed', 'queue', 'error', 'removed'] as const
const Main = (): JSX.Element => {
  const [active, set_active] = useState(true)
  const [onProgress, set_onProgress] = useState<string[]>([])
  const [settingState, set_settingState] = useRecoilState(settings)
  const { folderName, downloadedItem, handleFolderName } = useFileDownload(
    (item) => {
      set_onProgress((prev) => prev.filter((curr) => curr !== item.url))
    },
    settingState.modeType !== 'enhanced'
  )
  const [modalOpen, set_modalOpen] = useState<UrlRemapItem | null>(null)
  const [currentListTarget, set_currentListTarget] = useState<{
    tabId: number
    target: (typeof targetType)[number]
  } | null>(null)

  const appliedRemapList = useMemo(() => {
    return settingState.live.remap
      ? settingState.remapList.filter((item) => item.active)
      : []
  }, [settingState.remapList, settingState.live.remap])
  const results = useWebRequests(active, appliedRemapList)
  const {
    removedGroup,
    queueGroup,
    tabList,
    returnRemoved,
    removeDisposedItem,
    removeQueueItem,
    disposedGroup,
    errorGroup,
    clearListByTabId,
    handleSourceList,
  } = results
  useEffect(() => {
    chrome.storage.local.get(Object.keys(defaultSettings), (items) => {
      set_settingState((prev) => syncSettings(prev, items as SettingsType))
    })
  }, [])
  useEffect(() => {
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
        downloadAble?: WebResponseItem[]
      }) => void
    ) => {
      const senderTabId = sender?.tab?.id
      if (!senderTabId) return
      if (request.message === 'delete-from-queue') {
        const disposedData =
          request.data as chrome.webRequest.WebResponseHeadersDetails & {
            error: boolean
          }
        removeQueueItem(disposedData)
      }
      if (request.message === 'bulk-queue-images' && senderTabId) {
        const appended = (request.data as WebResponseItem[]).map((item) => {
          item.tabId = senderTabId
          return item
        })
        handleSourceList(appended)
        sendResponse({ data: { success: true } })
      }
      if (request.message === 'delete-all-disposed') {
        clearListByTabId(senderTabId)
      }
      if (request.message === 'delete-from-disposed') {
        const disposedData = request.data as WebResponseItem[]
        disposedData.forEach((item) => {
          removeDisposedItem(item)
        })
      }
      if (request.message === 'get-items') {
        const data = queueGroup[senderTabId]
        const downloadAbleData = disposedGroup[senderTabId] ?? []
        sendResponse({
          data,
          downloaded: downloadedItem,
          downloadAble: downloadAbleData,
        })
      }
      if (request.message === 'download') {
        const downloadList = request.data as string[]
        for (let i = 0; i < downloadList.length; i++) {
          set_onProgress((prev) => [...prev, downloadList[i]])
          chrome.downloads.download({ url: downloadList[i] })
        }
      }
      if (request.message === 'create-remap') {
        focusPopup()
        const remapUrl = request.data as string
        set_modalOpen(urlToRemapItem(remapUrl))
      }
      if (request.message === 'getFolderName') {
        sendResponse({
          data: {
            folderName,
            folderNameList: settingState.folderNameList,
          },
        })
      }
      if (request.message === 'setFolderName') {
        const folderName = request.data as string
        handleFolderName(folderName)
        chrome.storage.local.set({ folderName })
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
    removeDisposedItem,
    removeQueueItem,
    handleSourceList,
    downloadedItem,
    folderName,
    settingState.folderNameList,
  ])
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
        chrome.tabs.sendMessage(
          tabId,
          { message: 'utaku-current-active' },
          (response) => {
            if (chrome.runtime.lastError) {
              chrome.tabs.reload(tabId)
              return
            }
            if (response === 'ok' && tabId) {
              chrome.tabs.sendMessage(tabId, { message: 'utaku-mount' })
            }
            if (response === 'mounted' && tabId) {
              chrome.tabs.sendMessage(tabId, { message: 'utaku-quit' })
            }
          }
        )
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
  const currentList = useMemo(() => {
    if (!currentListTarget) return []
    const { tabId, target } = currentListTarget
    if (target === 'disposed') {
      return disposedGroup[tabId] ?? []
    } else if (target === 'queue') {
      return queueGroup[tabId] ?? []
    } else if (target === 'error') {
      return errorGroup[tabId] ?? []
    } else if (target === 'removed') {
      return removedGroup[tabId] ?? []
    }
    return []
  }, [currentListTarget, disposedGroup, errorGroup, queueGroup, removedGroup])

  return (
    <>
      <Modal
        target="#popup-modal"
        open={modalOpen !== null}
        onClose={() => {
          set_modalOpen(null)
        }}
      >
        {modalOpen && (
          <ModalBody title={lang('url_remap_list')} btn={<></>}>
            <StepEditor
              mode="add"
              remapItem={modalOpen}
              onClose={() => {
                set_modalOpen(null)
              }}
            />
          </ModalBody>
        )}
      </Modal>
      <PopupStyle.Container>
        <PopupStyle.Top>
          <UtakuW />
          <PopupStyle.TopRight>
            {onProgress.length > 0 && (
              <div>Downloading {onProgress.length} files ...</div>
            )}
            <PopupStyle.Row>
              <PopupStyle.ModeController>
                <PopupStyle.IconWrap>
                  <FaRocket />
                </PopupStyle.IconWrap>
                {modeType
                  .filter((ii) => !!ii)
                  .map((type) => (
                    <div
                      key={type}
                      className={type === settingState.modeType ? 'active' : ''}
                      onClick={() => {
                        if (type === 'enhanced') return
                        set_settingState(
                          produce((draft) => {
                            draft.modeType = type
                          })
                        )
                        chrome.runtime.sendMessage({
                          message: 'mode-change',
                          data: type,
                        })
                        window.close()
                      }}
                    >
                      {type}
                    </div>
                  ))}
              </PopupStyle.ModeController>
            </PopupStyle.Row>
            <div
              onClick={() => {
                set_active((prev) => !prev)
              }}
            >
              {active && <Live.CircleActive />}
              {!active && <Live.Circle />}
            </div>
          </PopupStyle.TopRight>
        </PopupStyle.Top>
        <PopupStyle.Body>
          {tabList.length < 1 && (
            <PopupStyle.Nothing>
              {lang('collect_description')}
            </PopupStyle.Nothing>
          )}
          {tabList.length > 0 && (
            <PopupStyle.Wrap>
              {tabList.map((tabItem, index) => {
                const isActive = (
                  currentTarget: (typeof targetType)[number]
                ) => {
                  if (!currentListTarget) return false
                  const { tabId, target } = currentListTarget
                  return tabId === tabItem.id && target === currentTarget
                }
                const tabId = tabItem.id as keyof typeof queueGroup | undefined
                const queueList =
                  tabId && queueGroup ? queueGroup[tabId] ?? [] : []
                const disposedList =
                  tabId && disposedGroup ? disposedGroup[tabId] ?? [] : []
                const errorList =
                  tabId && errorGroup ? errorGroup[tabId] ?? [] : []
                const removedList =
                  tabId && removedGroup ? removedGroup[tabId] ?? [] : []
                return (
                  <Fragment key={tabItem.id + String(index)}>
                    <PopupStyle.ColumnWrap
                      className={classNames({ active: tabItem.active })}
                    >
                      <PopupStyle.Item>
                        {tabItem.tooltip && (
                          <Tooltip>{tabItem.tooltip}</Tooltip>
                        )}
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
                            <PopupStyle.ListButton
                              _mini
                              className={classNames({
                                active: isActive('disposed'),
                              })}
                              disabled={disposedList.length < 1}
                              onClick={() => {
                                if (!tabItem.id) return
                                set_currentListTarget(() =>
                                  isActive('disposed')
                                    ? null
                                    : {
                                        tabId: tabItem.id as number,
                                        target: 'disposed',
                                      }
                                )
                              }}
                            >
                              <FaList />
                              <span>{lang('disposed_item')}</span>
                              <span>{disposedList?.length ?? 0}</span>
                            </PopupStyle.ListButton>
                          </span>
                          <span className="length">
                            <PopupStyle.ListButton
                              _mini
                              className={classNames({
                                active: isActive('queue'),
                              })}
                              disabled={queueList.length < 1}
                              onClick={() => {
                                if (!tabItem.id) return
                                set_currentListTarget(() =>
                                  isActive('queue')
                                    ? null
                                    : {
                                        tabId: tabItem.id as number,
                                        target: 'queue',
                                      }
                                )
                              }}
                            >
                              <FaList />
                              <span>{lang('queue')}</span>{' '}
                              <span>{queueList?.length ?? 0}</span>
                            </PopupStyle.ListButton>
                          </span>
                          <span className="length">
                            <PopupStyle.ListButton
                              _mini
                              className={classNames({
                                active: isActive('error'),
                              })}
                              disabled={errorList.length < 1}
                              onClick={() => {
                                if (!tabItem.id) return
                                set_currentListTarget(() =>
                                  isActive('error')
                                    ? null
                                    : {
                                        tabId: tabItem.id as number,
                                        target: 'error',
                                      }
                                )
                              }}
                            >
                              <FaList />
                              <span>{lang('error')}</span>{' '}
                              <span>{errorList?.length ?? 0}</span>
                            </PopupStyle.ListButton>
                          </span>
                          <span className="length">
                            <PopupStyle.ListButton
                              _mini
                              className={classNames({
                                active: isActive('removed'),
                              })}
                              disabled={removedList.length < 1}
                              onClick={() => {
                                if (!tabItem.id) return
                                set_currentListTarget(() =>
                                  isActive('removed')
                                    ? null
                                    : {
                                        tabId: tabItem.id as number,
                                        target: 'removed',
                                      }
                                )
                              }}
                            >
                              <FaList />
                              <span>{lang('remove')}</span>{' '}
                              <span>{removedList?.length ?? 0}</span>
                            </PopupStyle.ListButton>
                          </span>
                        </PopupStyle.Info>
                        <PopupStyle.Row>
                          {removedList.length > 0 && (
                            <WhiteFill
                              onClick={() => {
                                returnRemoved(removedList)
                              }}
                            >
                              {lang('return_removed')}
                            </WhiteFill>
                          )}
                          <PrimaryButton
                            _mini
                            onClick={(e) => {
                              e.stopPropagation()
                              handleClickTab(tabItem.id)
                            }}
                          >
                            {lang('enter')}
                          </PrimaryButton>
                        </PopupStyle.Row>
                      </PopupStyle.InfoWrap>
                    </PopupStyle.ColumnWrap>
                    {typeof tabId === 'number' &&
                      tabId === currentListTarget?.tabId &&
                      currentList.length > 0 && (
                        <PopupStyle.List>
                          <PopupStyle.ColumnList>
                            <Virtuoso
                              style={{ height: '100%' }}
                              totalCount={currentList.length}
                              itemContent={(index) => {
                                const item = currentList[index]
                                const { url, requestId, imageInfo } = item
                                return (
                                  <PopupStyle.InnerRow
                                    key={url + index + requestId + tabId}
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
                                      <WhiteFill
                                        _mini
                                        onClick={() => {
                                          try {
                                            const currentUrl = new URL(url)
                                            set_modalOpen({
                                              ...initialUrlRemapItem,
                                              item: {
                                                ...initialUrlRemapItem.item,
                                                reference_url: url,
                                                host: currentUrl.host,
                                                params: Object.fromEntries(
                                                  currentUrl.searchParams
                                                ),
                                              },
                                            })
                                          } catch (error) {
                                            console.log('err')
                                          }
                                        }}
                                      >
                                        <FaRegEdit />
                                      </WhiteFill>
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
                                          set_onProgress((prev) => [
                                            ...prev,
                                            url,
                                          ])
                                        }}
                                      >
                                        <FaDownload />
                                      </PrimaryButton>
                                    </PopupStyle.Row>
                                  </PopupStyle.InnerRow>
                                )
                              }}
                            />
                          </PopupStyle.ColumnList>
                        </PopupStyle.List>
                      )}
                  </Fragment>
                )
              })}
            </PopupStyle.Wrap>
          )}
        </PopupStyle.Body>
        <PopupStyle.Bottom>
          <PopupStyle.BottomButtons>
            <Settings target="#popup-modal" />
            {settingState.live.remap && (
              <PopupStyle.BottomDescription>
                {lang('applied_remaps', String(appliedRemapList.length))}
              </PopupStyle.BottomDescription>
            )}
          </PopupStyle.BottomButtons>
          <PopupStyle.BottomButtons>
            <GrayScaleFill
              _icon
              _mini
              onClick={() => {
                chrome.runtime.openOptionsPage()
              }}
            >
              <FaQuestion />
            </GrayScaleFill>
          </PopupStyle.BottomButtons>
        </PopupStyle.Bottom>
      </PopupStyle.Container>
    </>
  )
}

export default App
