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
import { RecoilRoot, useRecoilState } from 'recoil'
import { uniqBy } from 'remeda'
import {
  SettingsType,
  UrlRemapItem,
  defaultSettings,
  settings,
} from '../atoms/settings'
import ItemBox from '../components/ItemBox'
import Modal from '../components/Modal'
import ModalBody from '../components/Modal/ModalBody'
import StepEditor from '../components/Remap/StepEditor'
import {
  lang,
  parseItemListWithUrlRemaps,
  syncSettings,
  urlToRemapItem,
} from '../utils'
import {
  getAllImageUrls,
  getAllVideoUrls,
  getLimitBySelector,
} from '../utils/getImages'
import { toItemType } from '../utils/parse'
import ControlComp from './ControlComp'
import Dispose from './DisposeComp'
import DownloadComp from './DownloadComp'
import SimpleModeHeader from './SimpleModeHeader'
import UtakuStyle from './Utaku.styled'
import './index.scss'
import { ImageInfo, ItemType } from './types'

const App = () => {
  return (
    <RecoilRoot>
      <Main />
    </RecoilRoot>
  )
}
const Main = (): JSX.Element => {
  const [hideUi, set_hideUi] = useState<boolean>(false)
  const [tooltip, set_tooltip] = useState<string>('')
  const [itemList, set_itemList] = useState<ItemType[]>([])
  const [queueList, set_queueList] = useState<ItemType[]>([])
  const [changedUrl, set_changedUrl] = useState<ItemType[]>([])
  const [downloadedItem, set_downloadedItem] = useState<string[]>([])
  const [settingState, set_settingState] = useRecoilState(settings)
  const [active, set_active] = useState<boolean>(true)
  const [pending, set_pending] = useState<boolean>(false)
  const [fireFirst, set_fireFirst] = useState<boolean>(false)
  const fireFirstRef = useRef(false)
  const toggleActive = useCallback(() => {
    set_active((prev) => !prev)
  }, [])
  useEffect(() => {
    chrome.storage.local.get(Object.keys(defaultSettings), (items) => {
      set_settingState((prev) => syncSettings(prev, items as SettingsType))
      set_fireFirst(true)
    })
  }, [])
  const appliedRemapList = useMemo(() => {
    return settingState.remapList?.filter((item) => item.active) ?? []
  }, [settingState.remapList])
  const remapHostList = useMemo(() => {
    return appliedRemapList.map((item) => item.item.host)
  }, [appliedRemapList])
  const filterLogic = useCallback(
    (itemList: ItemType[]) => {
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
        if (itemType && itemType !== 'all')
          checkItemType = item.type === itemType
        if (downloadedItem.includes(item.url)) notDownloaded = false
        if (sizeLimit.width) widthResult = width >= sizeLimit.width
        if (sizeLimit.height) heightResult = height >= sizeLimit.height
        return widthResult && heightResult && notDownloaded && checkItemType
      })
      const result = uniqBy(filtered, (item) => item.url).sort(
        (a, b) => a.order - b.order
      )
      return result
    },
    [
      settingState.sizeLimit,
      downloadedItem,
      settingState.itemType,
      remapHostList,
    ]
  )
  const filteredImages = useMemo(() => {
    return filterLogic(itemList)
  }, [filterLogic, itemList])

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

  const getCurrentPageImages = useCallback(
    async (forceRemap?: boolean, forceLimitArea?: boolean) => {
      const results = (await chrome.storage.local.get(null)) as SettingsType
      const limitBySelector =
        results.live?.filter || forceLimitArea
          ? getLimitBySelector(results?.limitBySelector)
          : []
      const remapList =
        results.live?.remap || forceRemap
          ? (results?.remapList as UrlRemapItem[]) ?? []
          : []
      const svgCollect = results.extraOptions.useSvgElement ?? false
      const anchorCollect = results.extraOptions.useAnchorElement ?? false
      const currentApplied = remapList.filter((item) => item.active)
      const localImages = getAllImageUrls(
        '.utaku-root',
        limitBySelector,
        svgCollect,
        anchorCollect
      ).map((item) => toItemType(item, 'image'))
      const localVideos = getAllVideoUrls('.utaku-root', limitBySelector).map(
        (item) => toItemType(item, 'media')
      )
      const scrappedImages = uniqBy(
        parseItemListWithUrlRemaps(currentApplied, localImages) as ItemType[],
        (item) => item.url
      )
      const scrappedVideos = uniqBy(
        parseItemListWithUrlRemaps(currentApplied, localVideos) as ItemType[],
        (item) => item.url
      )
      return [...scrappedImages, ...scrappedVideos]
    },
    []
  )

  const scrapImages = useCallback(
    async (forceRemap?: boolean, forceLimitArea?: boolean) => {
      try {
        const scrapped = await getCurrentPageImages(forceRemap, forceLimitArea)
        set_queueList(() => {
          return scrapped
            ? scrapped.map((item, index) => ({ ...item, order: index + 1 }))
            : []
        })
      } catch (error) {
        console.log(error)
      }
    },
    [getCurrentPageImages]
  )
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
            return data
              ? data.map((item, index) => ({ ...item, order: index + 1 }))
              : []
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
      if (!fireFirstRef.current) {
        fireFirstRef.current = true
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
    }
    if (active && settingState.modeType !== null) {
      settingState.modeType === 'enhanced' && callDataPool()
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
    value: ItemType
  ) => {
    try {
      const videoTarget = e.currentTarget
      const { videoWidth, videoHeight } = videoTarget
      const imageInfoData = {
        width: videoWidth,
        height: videoHeight,
      }
      set_itemList((prev) => {
        const clone: ItemType = {
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
    value: ItemType
  ) => {
    try {
      const imageTarget = e.currentTarget
      const { naturalWidth, naturalHeight } = imageTarget
      const imageInfoData = {
        width: naturalWidth,
        height: naturalHeight,
      }
      set_itemList((prev) => {
        const clone: ItemType = {
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
  const [modalOpen, set_modalOpen] = useState<UrlRemapItem | null>(null)
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
  const handleOrder = (item: ItemType, direction: 'left' | 'right') => {
    set_itemList((draft) => {
      const filtered = filterLogic([...draft])
      const currentIndex = filtered.findIndex((i) => i.url === item.url)
      if (currentIndex < 0 || currentIndex >= filtered.length - 1) return draft
      const currentItem = filtered[currentIndex]
      const currentOrder = currentItem.order
      if (direction === 'left') {
        if (currentIndex === 0) return draft
        const temp = filtered[currentIndex - 1]
        const tempOrder = temp.order
        temp.order = currentOrder
        currentItem.order = tempOrder
        return draft.map((i) => {
          if (i.url === currentItem.url) return currentItem
          if (i.url === temp.url) return temp
          return i
        })
      } else {
        if (currentIndex === filtered.length - 1) return draft
        const temp = filtered[currentIndex + 1]
        const tempOrder = temp.order
        temp.order = currentOrder
        currentItem.order = tempOrder
        return draft.map((i) => {
          if (i.url === currentItem.url) return currentItem
          if (i.url === temp.url) return temp
          return i
        })
      }
    })
  }

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
      <UtakuStyle.Wrap
        {...(hideUi && { style: { display: 'none' } })}
        data-wrapper-size={settingState.containerSize}
      >
        {settingState.modeType === 'simple' && (
          <SimpleModeHeader
            handleItemList={(value) => {
              set_itemList([])
              if (settingState.extraOptions.remapOnSelect) {
                value = parseItemListWithUrlRemaps(
                  appliedRemapList,
                  value
                ) as ItemType[]
              }
              set_queueList(uniqBy(value, (item) => item.url))
            }}
            handleReload={(bool) => {
              if (reloadRef.current) clearTimeout(reloadRef.current)
              set_pending(true)
              set_itemList([])
              reloadRef.current = setTimeout(async () => {
                await scrapImages(bool, bool)
                set_pending(false)
              }, 1000)
            }}
            handleUi={(value) => {
              set_hideUi(value)
            }}
          />
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
              queueList.map((value, index) => {
                if (value.type === 'media') {
                  return (
                    <Dispose.Video
                      key={'dispose-video' + index + value.url}
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
                    key={'dispose-image' + index + value.url}
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
              filteredImages.map((value, index) => {
                return (
                  <ItemBox
                    itemIndex={index}
                    handleOrder={handleOrder}
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
