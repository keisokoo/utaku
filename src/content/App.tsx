import { isEqual } from 'lodash-es'
import React, {
  MutableRefObject,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import UrlEditor, { UrlFilter } from '../components/Filter/UrlEditor'
import ItemBox from '../components/ItemBox'
import Modal from '../components/Modal/Modal'
import ControlComp from './ControlComp'
import Dispose from './DisposeComp'
import DownloadComp from './DownloadComp'
import UtakuStyle from './Utaku.styled'
import './index.scss'
import { itemTypes } from './sources'
import { DataType, ImageInfo, RequestItem } from './types'

const objectEntries = <T extends object>(item: T) => {
  return Object.entries(item) as Array<[keyof T, T[keyof T]]>
}
const App = (): JSX.Element => {
  const [itemType, set_itemType] = useState<(typeof itemTypes)[number]>('all')
  const [tooltip, set_tooltip] = useState<string>('')
  const [currentUrl, setCurrentUrl] = useState('')
  const [urlFilter, set_urlFilter] = useState<UrlFilter | null>()
  const [itemList, set_itemList] = useState<
    (RequestItem & {
      imageInfo: ImageInfo
    })[]
  >([])
  const [sources, set_sources] = useState<DataType | null>(null)
  const [sizeLimit, set_sizeLimit] = useState<{
    width: number
    height: number
  }>({
    width: 600,
    height: 600,
  })
  const [downloadedItem, set_downloadedItem] = useState<string[]>([])
  const filteredImages = useMemo(() => {
    return itemList.filter((item) => {
      if (!item.imageInfo) return false
      const { width, height } = item.imageInfo
      // let searchResult = true
      // if (searchTextOnUrl) searchResult = item.url.includes(searchTextOnUrl)
      let checkItemType = true
      let widthResult = true
      let heightResult = true
      let notDownloaded = true
      if (itemType && itemType !== 'all') checkItemType = item.type === itemType
      if (downloadedItem.includes(item.url)) notDownloaded = false
      if (sizeLimit.width) widthResult = width > sizeLimit.width
      if (sizeLimit.height) heightResult = height > sizeLimit.height
      return widthResult && heightResult && notDownloaded && checkItemType
    })
  }, [itemList, sizeLimit, downloadedItem, itemType])

  const timeoutRef = useRef(null) as MutableRefObject<NodeJS.Timeout | null>
  const selectedDownload = (all?: boolean) => {
    const downloadList = all
      ? filteredImages.map((item) => item.url)
      : filteredImages
          .filter((item) => item.imageInfo.active)
          .map((item) => item.url)
    if (!downloadList.length) return
    chrome.runtime.sendMessage({
      message: 'download',
      data: downloadList,
    })
  }
  useEffect(() => {
    console.log('urlFilter', urlFilter)
  }, [urlFilter])
  useEffect(() => {
    function getData(): Promise<{
      data: DataType
      downloaded: string[]
    }> {
      if (chrome.runtime.lastError) console.log(chrome.runtime.lastError)
      return new Promise((res, rej) => {
        chrome.runtime.sendMessage(
          {
            message: 'get-items',
            data: chrome.runtime.id,
          },
          (response: { data: DataType; downloaded: string[] }) => {
            if (chrome.runtime.lastError) {
              return rej
            }
            if (response) res({ ...response })
            return false
          }
        )
      })
    }
    function runDataPool() {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(async () => {
        try {
          const { data, downloaded } = await getData()
          set_sources((prev) => {
            if (isEqual(prev, data)) return prev
            return data
          })
          set_downloadedItem((prev) => {
            if (isEqual(prev, downloaded)) return prev
            return downloaded
          })
          runDataPool()
        } catch (error) {
          if (chrome.runtime.lastError) console.log(chrome.runtime.lastError)
          console.log('error', error)
        }
      }, 1000)
    }
    runDataPool()
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])
  const disposeVideo = (
    e: React.SyntheticEvent<HTMLVideoElement, Event>,
    value: chrome.webRequest.WebResponseHeadersDetails
  ) => {
    const video = e.currentTarget
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const context = canvas.getContext('2d')
    if (context) context.drawImage(video, 0, 0, canvas.width, canvas.height)
    const thumbnail = canvas.toDataURL('image/png')
    const videoTarget = e.currentTarget
    const { videoWidth, videoHeight } = videoTarget
    chrome.runtime.sendMessage({
      message: 'update-image-size',
      data: {
        requestId: value.requestId,
        url: value.url,
        width: videoWidth,
        height: videoHeight,
      },
    })
    set_itemList((prev) => {
      const clone: RequestItem & {
        imageInfo: ImageInfo
      } = {
        ...value,
        imageInfo: {
          thumbnail,
          width: videoWidth,
          height: videoHeight,
        },
      }
      return [...prev, clone]
    })
  }
  const disposeImage = (
    e: React.SyntheticEvent<HTMLImageElement, Event>,
    value: chrome.webRequest.WebResponseHeadersDetails
  ) => {
    const imageTarget = e.currentTarget
    const { naturalWidth, naturalHeight } = imageTarget
    chrome.runtime.sendMessage({
      message: 'update-image-size',
      data: {
        requestId: value.requestId,
        url: value.url,
        width: naturalWidth,
        height: naturalHeight,
      },
    })
    set_itemList((prev) => {
      const clone: RequestItem & {
        imageInfo: ImageInfo
      } = {
        ...value,
        imageInfo: {
          width: naturalWidth,
          height: naturalHeight,
        },
      }
      return [...prev, clone]
    })
  }
  return (
    <>
      <Modal
        open={currentUrl !== ''}
        onClose={() => {
          setCurrentUrl('')
        }}
      >
        <UrlEditor
          currentUrl={currentUrl}
          emitValue={(value) => {
            set_urlFilter(value)
            setCurrentUrl('')
          }}
        />
      </Modal>
      <div className="utaku-wrapper">
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
          itemType={itemType}
          tooltip={tooltip}
          itemList={itemList}
          sizeLimit={sizeLimit}
          current={
            filteredImages.filter((item) => item.imageInfo.active).length
          }
          total={filteredImages.length}
          handleItemList={(arr) => {
            set_itemList(arr)
          }}
          handleSizeLimit={(size) => {
            set_sizeLimit(size)
          }}
          handleItemType={(type) => {
            set_itemType(type)
          }}
        />
        <UtakuStyle.ItemContainer
          onWheel={(e) => {
            e.currentTarget.scrollLeft += e.deltaY
          }}
        >
          <UtakuStyle.DisposeContainer>
            {sources &&
              objectEntries(sources).map(([key, value]) => {
                if (value.type === 'media') {
                  return (
                    <Dispose.Video
                      key={key}
                      value={value}
                      disposeVideo={disposeVideo}
                    />
                  )
                }
                return (
                  <Dispose.Image
                    key={key}
                    value={value}
                    disposeImage={disposeImage}
                  />
                )
              })}
          </UtakuStyle.DisposeContainer>
          <UtakuStyle.Grid>
            {filteredImages &&
              filteredImages.map((value) => {
                return (
                  <ItemBox
                    item={value}
                    key={value.requestId}
                    setUrl={(url) => {
                      setCurrentUrl(url)
                    }}
                    setTooltip={(tooltip) => {
                      set_tooltip(tooltip)
                    }}
                    onClick={() => {
                      set_itemList((prev) => {
                        return prev.map((item) => {
                          if (item.requestId === value.requestId) {
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
      </div>
    </>
  )
}

export default App
