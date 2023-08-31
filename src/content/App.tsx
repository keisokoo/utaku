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
import { settings } from '../atoms/settings'
import ItemBox from '../components/ItemBox'
import LoadingImage from '../components/ItemBox/LoadingImage'
import ControlComp from './ControlComp'
import Dispose from './DisposeComp'
import DownloadComp from './DownloadComp'
import UtakuStyle from './Utaku.styled'
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
  const toggleActive = useCallback(() => {
    set_active((prev) => !prev)
  }, [])

  useEffect(() => {
    const elements = document.querySelectorAll('[classname]')
    if (!elements) return
    if (!elements.length) return
    elements.forEach((el) => {
      el.setAttribute('class', el.getAttribute('classname')!)
    })
  })
  useEffect(() => {
    chrome.storage.local.get(
      [
        'folderName',
        'folderNameList',
        'sizeLimit',
        'sizeType',
        'itemType',
        'remapList',
        'containerSize',
      ],
      (items) => {
        set_settingState(
          produce((draft) => {
            if (items.folderName) draft.folderName = items.folderName
            if (items.folderNameList)
              draft.folderNameList = items.folderNameList
            if (items.sizeLimit) draft.sizeLimit = items.sizeLimit
            if (items.sizeType) draft.sizeType = items.sizeType
            if (items.itemType) draft.itemType = items.itemType
            if (items.remapList) draft.remapList = items.remapList
            if (items.containerSize) draft.containerSize = items.containerSize
          })
        )
      }
    )
  }, [])
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
      if (itemType && itemType !== 'all') checkItemType = item.type === itemType
      if (downloadedItem.includes(item.url)) notDownloaded = false
      if (sizeLimit.width) widthResult = width >= sizeLimit.width
      if (sizeLimit.height) heightResult = height >= sizeLimit.height
      return widthResult && heightResult && notDownloaded && checkItemType
    })
    return uniqBy(filtered, (item) => item.url)
  }, [itemList, settingState.sizeLimit, downloadedItem, settingState.itemType])

  const timeoutRef = useRef(null) as MutableRefObject<NodeJS.Timeout | null>
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

    chrome.runtime.sendMessage({
      message: 'download',
      data: downloadList,
    })
  }
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
    if (active) {
      runDataPool()
    } else {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [active])
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
    chrome.runtime.sendMessage({
      message: 'delete-from-queue',
      data: { ...item, error: error ?? false },
    })
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
      console.log('error', error)
      handleRemove(value, true)
    }
  }
  if (!itemList) return <></>
  return (
    <>
      <UtakuStyle.Wrap data-wrapper-size={settingState.containerSize}>
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
            data-wrapper-size={settingState.containerSize}
          >
            {filteredImages &&
              filteredImages.map((value) => {
                return (
                  <ItemBox
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
            {queueList.length > 0 && (
              <LoadingImage
                data-item-size={settingState.sizeType}
                data-wrapper-size={settingState.containerSize}
                length={queueList.length}
              />
            )}
          </UtakuStyle.Grid>
        </UtakuStyle.ItemContainer>
      </UtakuStyle.Wrap>
    </>
  )
}

export default App
