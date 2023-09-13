import { isEqual, sortBy } from 'lodash-es'
import React, {
  MutableRefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import { produce } from 'immer'
import {
  FaQuestion,
  FaRedo,
  FaRegEdit,
  FaRocket,
  FaTimes,
} from 'react-icons/fa'
import { RecoilRoot, useRecoilState } from 'recoil'
import { uniqBy } from 'remeda'
import {
  UrlRemapItem,
  defaultMode,
  modeType,
  settings,
} from '../atoms/settings'
import { GrayScaleFill, WhiteFill } from '../components/Buttons'
import ItemBox from '../components/ItemBox'
import EditLimitArea from '../components/LimitArea/EditLimitArea'
import Modal from '../components/Modal'
import ModalBody from '../components/Modal/ModalBody'
import Remaps from '../components/Remap/Remaps'
import StepEditor from '../components/Remap/StepEditor'
import { sampleApply, sampleList } from '../pages/popup/sources'
import {
  lang,
  migrationRemapList,
  parseItemWithUrlRemaps,
  urlToRemapItem,
} from '../utils'
import ControlComp from './ControlComp'
import Dispose from './DisposeComp'
import DownloadComp from './DownloadComp'
import UtakuStyle from './Utaku.styled'
import {
  getAllImageUrls,
  getAllVideoUrls,
  getLimitBySelector,
} from './hooks/getImages'
import { toItemType } from './hooks/useGetImages'
import './index.scss'
import { ImageInfo, ItemType, WebResponseItem } from './types'

const App = () => {
  return (
    <RecoilRoot>
      <Main />
    </RecoilRoot>
  )
}
const Main = (): JSX.Element => {
  const [tooltip, set_tooltip] = useState<string>('')
  const [itemList, set_itemList] = useState<ItemType[]>([])
  const [queueList, set_queueList] = useState<ItemType[]>([])
  const [changedUrl, set_changedUrl] = useState<
    chrome.webRequest.WebResponseHeadersDetails[]
  >([])
  const [downloadedItem, set_downloadedItem] = useState<string[]>([])
  const [settingState, set_settingState] = useRecoilState(settings)
  const [active, set_active] = useState<boolean>(true)
  const [pending, set_pending] = useState<boolean>(false)
  const [fireFirst, set_fireFirst] = useState<boolean>(false)
  const toggleActive = useCallback(() => {
    set_active((prev) => !prev)
  }, [])
  useEffect(() => {
    chrome.storage.local.get(
      [
        'folderName',
        'folderNameList',
        'sizeLimit',
        'sizeType',
        'itemType',
        'containerSize',
        'modeType',
        'remapList',
        'applyRemapList',
        'viewMode',
        'remapFilter',
      ],
      (items) => {
        set_settingState(
          produce((draft) => {
            if (!items.remapList && !items.applyRemapList) {
              chrome.storage.local.set({
                remapList: sampleList,
                applyRemapList: sampleApply,
              })
            }
            if (items.folderName) draft.folderName = items.folderName
            draft.modeType = items.modeType ?? defaultMode
            if (!items.modeType) {
              chrome.storage.local.set({ modeType: defaultMode })
            }
            if (items.folderNameList)
              draft.folderNameList = items.folderNameList
            if (items.sizeLimit) draft.sizeLimit = items.sizeLimit
            if (items.sizeType) draft.sizeType = items.sizeType
            if (items.remapFilter) draft.remapFilter = items.remapFilter
            if (items.viewMode) draft.viewMode = items.viewMode
            if (items.itemType) draft.itemType = items.itemType
            if (items.containerSize) draft.containerSize = items.containerSize
            if (items.remapList) {
              // migrate
              draft.remapList = migrationRemapList(items.remapList)
            }
            if (items.applyRemapList)
              draft.applyRemapList = items.applyRemapList
            if (!items.remapList && !items.applyRemapList) {
              draft.remapList = sampleList
              draft.applyRemapList = sampleApply
            }
          })
        )
        set_fireFirst(true)
      }
    )
  }, [])
  const limitBySelector = useMemo(() => {
    return getLimitBySelector(settingState.remapFilter.limitBySelector)
  }, [settingState.remapFilter.limitBySelector])
  const appliedRemapList = useMemo(() => {
    return settingState.remapList.filter((item) =>
      settingState.applyRemapList.includes(item.id)
    )
  }, [settingState.applyRemapList, settingState.remapList])
  const remapHostList = useMemo(() => {
    return appliedRemapList.map((item) => item.item.host)
  }, [appliedRemapList])
  const filteredImages = useMemo(() => {
    if (!itemList) return []
    if (!itemList.length) return []
    const filtered = itemList.filter((item) => {
      if (!item.imageInfo) return false
      if (item.imageInfo.hide) return false
      const { width, height } = item.imageInfo
      const sizeLimit = settingState.sizeLimit
      const itemType = settingState.itemType
      let checkItemType = true
      let widthResult = true
      let heightResult = true
      let notDownloaded = true
      let includeUrlHost = true
      let searchName = true
      if (settingState.remapFilter.searchName) {
        searchName = item.url
          .toLowerCase()
          .includes(settingState.remapFilter.searchName.trim().toLowerCase())
      }
      if (settingState.remapFilter.onlyRemapped) {
        if (!remapHostList.includes(item.url)) includeUrlHost = false
      }
      if (itemType && itemType !== 'all') checkItemType = item.type === itemType
      if (downloadedItem.includes(item.url)) notDownloaded = false
      if (sizeLimit.width) widthResult = width >= sizeLimit.width
      if (sizeLimit.height) heightResult = height >= sizeLimit.height
      return (
        widthResult &&
        heightResult &&
        notDownloaded &&
        checkItemType &&
        includeUrlHost &&
        searchName
      )
    })
    return uniqBy(filtered, (item) => item.url)
  }, [
    itemList,
    settingState.sizeLimit,
    downloadedItem,
    settingState.itemType,
    remapHostList,
    settingState.remapFilter,
  ])

  const timeoutRef = useRef(null) as MutableRefObject<NodeJS.Timeout | null>
  const reloadRef = useRef(null) as MutableRefObject<NodeJS.Timeout | null>
  const selectedDownload = (all?: boolean) => {
    const downloadList = all
      ? filteredImages.map((item) => item.url)
      : filteredImages
          .filter((item) => item.imageInfo.active)
          .map((item) => item.url)
    if (!downloadList.length) return
    set_itemList((prev) => {
      return prev.map((item) => {
        if (downloadList.includes(item.url)) {
          item.imageInfo.active = false
          item.imageInfo.download = true
        }
        return item
      })
    })
    if (settingState.modeType === 'simple') {
      chrome.runtime.sendMessage({
        message: 'simple-download',
        data: downloadList,
      })
      return
    }
    if (settingState.modeType === 'enhanced') {
      chrome.runtime.sendMessage({
        message: 'download',
        data: downloadList,
      })
      return
    }
  }

  const getCurrentPageImages = useCallback(async () => {
    const results = await chrome.storage.local.get([
      'remapList',
      'applyRemapList',
    ])

    if (!results.remapList || !results.applyRemapList) return []
    const currentApplied = (results.remapList as UrlRemapItem[]).filter(
      (item) => (results.applyRemapList as string[]).includes(item.id)
    )

    const localImages = getAllImageUrls('.utaku-root', limitBySelector).map(
      (item) => toItemType(item, 'image')
    )
    const localVideos = getAllVideoUrls('.utaku-root', limitBySelector).map(
      (item) => toItemType(item, 'media')
    )

    const scrappedImages = uniqBy(
      localImages.map(
        (curr) => parseItemWithUrlRemaps(currentApplied, curr) as ItemType
      ),
      (item) => item.url
    )
    const scrappedVideos = uniqBy(
      localVideos.map(
        (curr) => parseItemWithUrlRemaps(currentApplied, curr) as ItemType
      ),
      (item) => item.url
    )
    return [...scrappedImages, ...scrappedVideos]
  }, [limitBySelector])

  const scrapImages = useCallback(async () => {
    try {
      const scrapped = await getCurrentPageImages()
      set_queueList(() => {
        return scrapped ?? []
      })
    } catch (error) {
      console.log('error', error)
    }
  }, [getCurrentPageImages])
  useEffect(() => {
    function getData(): Promise<{
      data: ItemType[]
      downloaded: string[]
      downloadAble: ItemType[]
    }> {
      if (chrome.runtime.lastError) console.log(chrome.runtime.lastError)
      return new Promise((res, rej) => {
        chrome.runtime.sendMessage(
          {
            message: 'get-items',
            data: chrome.runtime.id,
          },
          (response: {
            data: ItemType[]
            downloaded: string[]
            downloadAble: ItemType[]
          }) => {
            if (chrome.runtime.lastError) {
              return rej
            }
            if (response) res({ ...response })
            return false
          }
        )
      })
    }
    function sortItem(arr: ItemType[]) {
      if (!arr) return []
      if (!arr.length) return []
      return sortBy(
        arr.map((item) => item.url),
        (url) => url
      )
    }
    function runDataPool() {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(async () => {
        try {
          if (settingState.modeType === 'simple') {
            return
          }
          if (settingState.modeType !== 'enhanced') {
            return
          }
          const { data, downloaded, downloadAble } = await getData()
          set_itemList((prev) => {
            if (isEqual(sortItem(prev), sortItem(downloadAble))) return prev
            return downloadAble ?? []
          })
          set_queueList((prev) => {
            if (!data) return []
            if (isEqual(prev, data)) return prev
            return data ?? []
          })
          set_downloadedItem((prev) => {
            if (!downloaded.length) return prev
            if (isEqual(prev, downloaded)) return prev
            return downloaded
          })
          runDataPool()
        } catch (error) {
          if (chrome.runtime.lastError) console.log(chrome.runtime.lastError)
        }
      }, 1000)
    }
    async function callDataPool() {
      const getScrapData = await getCurrentPageImages()
      chrome.runtime.sendMessage(
        {
          message: 'bulk-queue-images',
          data: getScrapData ?? [],
        },
        (response) => {
          if (response?.data?.success) {
            runDataPool()
          }
        }
      )
    }
    if (active) {
      callDataPool()
    } else {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [active, settingState.modeType, getCurrentPageImages])

  useEffect(() => {
    if (!active) return
    if (settingState.modeType !== 'simple') return
    if (active && settingState.modeType === 'simple') {
      scrapImages()
    }
    return () => {
      set_queueList([])
      set_itemList([])
    }
  }, [settingState.modeType, active, scrapImages])
  const handleRemove = (
    item: chrome.webRequest.WebResponseHeadersDetails & {
      imageInfo?: ImageInfo
    },
    error?: boolean
  ) => {
    set_queueList(
      produce((draft) => {
        return draft.filter((value) => value.url !== item.url)
      })
    )
    if (settingState.modeType === 'simple') {
      return
    }
    if (settingState.modeType === 'enhanced') {
      chrome.runtime.sendMessage({
        message: 'delete-from-queue',
        data: { ...item, error: error ?? false },
      })
      return
    }
  }
  const disposeVideo = (
    e: React.SyntheticEvent<HTMLVideoElement, Event>,
    value: chrome.webRequest.WebResponseHeadersDetails
  ) => {
    try {
      const videoTarget = e.currentTarget
      const { videoWidth, videoHeight } = videoTarget
      const imageInfoData = {
        width: videoWidth,
        height: videoHeight,
      }
      set_itemList((prev) => {
        const clone: WebResponseItem & {
          imageInfo: ImageInfo
        } = {
          ...value,
          imageInfo: imageInfoData,
        }
        return uniqBy([...prev, clone], (item) => item.url)
      })
      handleRemove({
        ...value,
        imageInfo: imageInfoData,
      })
    } catch (error) {
      handleRemove(value, true)
    }
  }
  const disposeImage = (
    e: React.SyntheticEvent<HTMLImageElement, Event>,
    value: chrome.webRequest.WebResponseHeadersDetails
  ) => {
    try {
      const imageTarget = e.currentTarget
      const { naturalWidth, naturalHeight } = imageTarget
      const imageInfoData = {
        width: naturalWidth,
        height: naturalHeight,
      }
      set_itemList((prev) => {
        const clone: WebResponseItem & {
          imageInfo: ImageInfo
        } = {
          ...value,
          imageInfo: imageInfoData,
        }
        return uniqBy([...prev, clone], (item) => item.url)
      })
      handleRemove({
        ...value,
        imageInfo: imageInfoData,
      })
    } catch (error) {
      handleRemove(value, true)
    }
  }
  const [modalOpen, set_modalOpen] = useState<'remaps' | UrlRemapItem | null>(
    null
  )
  const handleRemaps = useCallback((value: string) => {
    set_modalOpen(urlToRemapItem(value))
  }, [])
  useEffect(() => {
    function onMessage(
      request: { message: string; data: unknown }
      // sender?: unknown,
      // sendResponse?: (response: string) => void
    ) {
      if (request.message === 'utaku-downloaded') {
        const downloadedURL =
          typeof request.data === 'string' ? request.data : ''
        if (!downloadedURL) return false
        set_itemList((prev) => {
          return prev.filter((item) => item.url !== (request.data as string))
        })
      }
      return false
    }
    chrome.runtime.onMessage.addListener(onMessage)
    return () => {
      chrome.runtime.onMessage.removeListener(onMessage)
    }
  }, [])
  if (!itemList) return <></>
  if (!fireFirst) return <></>
  return (
    <>
      <Modal
        open={modalOpen !== null}
        onClose={() => {
          set_modalOpen(null)
        }}
      >
        {modalOpen === 'remaps' && (
          <Remaps
            applyRemapList={settingState.applyRemapList}
            emitRemap={(value) => {
              set_settingState(
                produce((draft) => {
                  draft.applyRemapList = value
                })
              )
              chrome.storage.local.set({ applyRemapList: value })
            }}
          />
        )}
        {typeof modalOpen !== 'string' && modalOpen && (
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
      <UtakuStyle.Wrap data-wrapper-size={settingState.containerSize}>
        {settingState.modeType === 'simple' && (
          <UtakuStyle.SettingsRow>
            <UtakuStyle.Row>
              <WhiteFill
                _mini
                onClick={() => {
                  chrome.runtime.sendMessage({
                    message: 'utaku-call-unmount',
                  })
                }}
              >
                <FaTimes />
                {lang('close')}
              </WhiteFill>
              <WhiteFill
                _mini
                onClick={() => {
                  set_modalOpen('remaps')
                }}
              >
                <FaRegEdit />
                {lang('remaps')}({appliedRemapList?.length ?? 0})
              </WhiteFill>
              {/* {appliedRemapList?.length > 0 && (
                <WhiteFill _mini onClick={() => {}}>
                  {lang('remaps_only')}
                </WhiteFill>
              )} */}
              <EditLimitArea
                emitItemList={(value) => {
                  console.log('value', value)
                  set_itemList([])
                  set_queueList(value)
                }}
              />
              <WhiteFill
                _mini
                onClick={() => {
                  if (reloadRef.current) clearTimeout(reloadRef.current)
                  set_pending(true)
                  set_itemList([])
                  reloadRef.current = setTimeout(async () => {
                    await scrapImages()
                    set_pending(false)
                  }, 1000)
                }}
              >
                <FaRedo />
                {lang('reload')}
              </WhiteFill>
            </UtakuStyle.Row>
            <UtakuStyle.Center></UtakuStyle.Center>
            <UtakuStyle.Right>
              <UtakuStyle.QualityController>
                <UtakuStyle.IconWrap>
                  <FaRocket />
                </UtakuStyle.IconWrap>
                {modeType
                  .filter((ii) => !!ii)
                  .map((type) => (
                    <div
                      key={type}
                      className={type === settingState.modeType ? 'active' : ''}
                      onClick={() => {
                        if (type === 'simple') return
                        set_settingState(
                          produce((draft) => {
                            draft.modeType = type
                          })
                        )
                        chrome.runtime.sendMessage({
                          message: 'mode-change',
                          data: type,
                        })
                        window.location.reload()
                      }}
                    >
                      {type}
                    </div>
                  ))}
              </UtakuStyle.QualityController>
              <GrayScaleFill
                _icon
                _mini
                onClick={() => {
                  chrome.runtime.sendMessage({
                    message: 'open-options',
                  })
                }}
              >
                <FaQuestion />
              </GrayScaleFill>
            </UtakuStyle.Right>
          </UtakuStyle.SettingsRow>
        )}
        <DownloadComp
          itemList={itemList}
          handleItemList={(arr) => {
            set_itemList(arr)
          }}
          handleDownload={selectedDownload}
          disabledTrashDeselected={
            (filteredImages.some((item) => item.imageInfo.active) &&
              !filteredImages.some((item) => !item.imageInfo.active)) ||
            filteredImages.every((item) => !item.imageInfo.active)
          }
          disabledTrashSelected={filteredImages.every(
            (item) => !item.imageInfo.active
          )}
          disabledAllDeSelect={filteredImages.every(
            (item) => !item.imageInfo.active
          )}
          disabledAllSelect={filteredImages.every(
            (item) => item.imageInfo.active
          )}
        />
        <ControlComp
          active={active}
          toggleActive={toggleActive}
          tooltip={tooltip}
          current={
            filteredImages.filter((item) => item.imageInfo.active).length
          }
          queue={queueList.length}
          total={filteredImages.length}
        />
        <UtakuStyle.ItemContainer
          onWheel={(e) => {
            if (settingState.containerSize !== 'normal') return
            e.currentTarget.scrollLeft += e.deltaY
          }}
          data-wrapper-size={settingState.containerSize}
        >
          <UtakuStyle.DisposeContainer>
            {queueList &&
              queueList.map((value) => {
                if (value.type === 'media') {
                  return (
                    <Dispose.Video
                      key={value.url}
                      value={value}
                      disposeVideo={disposeVideo}
                      onError={() => {
                        handleRemove(value, true)
                      }}
                    />
                  )
                }
                return (
                  <Dispose.Image
                    key={value.url}
                    value={value}
                    disposeImage={disposeImage}
                    onError={() => {
                      handleRemove(value, true)
                    }}
                  />
                )
              })}
          </UtakuStyle.DisposeContainer>
          <UtakuStyle.DisposeContainer>
            {changedUrl.length > 0 &&
              changedUrl.map((value, index) => {
                if (value.type === 'media') {
                  return (
                    <Dispose.Video
                      key={'changedUrl' + value.url + index}
                      value={value}
                      disposeVideo={(e, value) => {
                        set_changedUrl((prev) => {
                          return prev.filter((item) => item.url !== value.url)
                        })
                      }}
                      onError={() => {
                        set_changedUrl((prev) => {
                          return prev.filter((item) => item.url !== value.url)
                        })
                      }}
                    />
                  )
                }
                return (
                  <Dispose.Image
                    key={'changedUrl' + value.url + index}
                    value={value}
                    disposeImage={(e, value) => {
                      set_changedUrl((prev) => {
                        return prev.filter((item) => item.url !== value.url)
                      })
                    }}
                    onError={() => {
                      set_changedUrl((prev) => {
                        return prev.filter((item) => item.url !== value.url)
                      })
                    }}
                  />
                )
              })}
          </UtakuStyle.DisposeContainer>
          <UtakuStyle.Grid
            data-item-size={settingState.sizeType}
            data-wrapper-size={
              filteredImages?.length ? settingState.containerSize : 'normal'
            }
          >
            {filteredImages?.length < 1 && (
              <UtakuStyle.Empty
                data-item-size={settingState.sizeType}
                data-wrapper-size={settingState.containerSize}
              >
                {pending && <div>{lang('re_loading')}</div>}
                {!pending && queueList?.length < 1 && (
                  <div>{lang('no_images')}</div>
                )}
              </UtakuStyle.Empty>
            )}
            {filteredImages &&
              filteredImages.map((value) => {
                return (
                  <ItemBox
                    handleRemaps={handleRemaps}
                    data-wrapper-size={settingState.containerSize}
                    item={value}
                    key={'filteredImages' + value.url}
                    setTooltip={(tooltip) => {
                      set_tooltip(tooltip)
                    }}
                    onClick={() => {
                      set_itemList((prev) => {
                        return prev.map((item) => {
                          if (item.url === value.url) {
                            item.imageInfo = {
                              ...value.imageInfo,
                              active: !value.imageInfo.active,
                            }
                          }
                          return item
                        })
                      })
                    }}
                  />
                )
              })}
          </UtakuStyle.Grid>
        </UtakuStyle.ItemContainer>
      </UtakuStyle.Wrap>
    </>
  )
}

export default App
