import { cloneDeep, isEqual } from 'lodash-es'
import React, {
  MutableRefObject,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import { produce } from 'immer'
import { RecoilRoot, useRecoilState } from 'recoil'
import { uniqBy } from 'remeda'
import UrlEditor from '../components/Filter/UrlEditor'
import ItemBox from '../components/ItemBox'
import Modal from '../components/Modal/Modal'
import ControlComp from './ControlComp'
import Dispose from './DisposeComp'
import DownloadComp from './DownloadComp'
import UtakuStyle from './Utaku.styled'
import { settings } from './atoms/settings'
import './index.scss'
import { DataType, ImageInfo, ItemType, RequestItem } from './types'

const objectEntries = <T extends object>(item: T) => {
  return Object.entries(item) as Array<[keyof T, T[keyof T]]>
}
const App = () => {
  return (
    <RecoilRoot>
      <Main />
    </RecoilRoot>
  )
}
const Main = (): JSX.Element => {
  const [tooltip, set_tooltip] = useState<string>('')
  const [currentUrl, setCurrentUrl] = useState('')
  const [itemList, set_itemList] = useState<ItemType[]>([])
  const [sources, set_sources] = useState<DataType | null>(null)
  const [changedUrl, set_changedUrl] = useState<
    chrome.webRequest.WebResponseHeadersDetails[]
  >([])
  const [downloadedItem, set_downloadedItem] = useState<string[]>([])
  const [settingState, set_settingState] = useRecoilState(settings)
  useEffect(() => {
    chrome.storage.sync.get(
      [
        'folderName',
        'folderNameList',
        'sizeLimit',
        'sizeType',
        'itemType',
        'filterList',
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
            if (items.filterList) draft.filterList = items.filterList
          })
        )
      }
    )
  }, [])
  const filteredImages = useMemo(() => {
    if (!itemList.length) return []
    const filtered = itemList.filter((item) => {
      if (!item.imageInfo) return false
      const { width, height } = item.imageInfo
      const sizeLimit = settingState.sizeLimit
      const itemType = settingState.itemType
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
    chrome.runtime.sendMessage({
      message: 'download',
      data: downloadList,
    })
  }
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
            if (!data) return null
            if (isEqual(prev, data)) return prev
            return data ?? null
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
    runDataPool()
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])
  const handleRemove = (
    item: chrome.webRequest.WebResponseHeadersDetails & {
      imageInfo?: ImageInfo
    },
    error?: boolean
  ) => {
    set_sources(
      produce((draft) => {
        if (draft) delete draft[item.requestId]
      })
    )
    chrome.runtime.sendMessage({
      message: 'delete-image',
      data: { ...item, error: error ?? false },
    })
  }
  const disposeVideo = (
    e: React.SyntheticEvent<HTMLVideoElement, Event>,
    value: chrome.webRequest.WebResponseHeadersDetails
  ) => {
    try {
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
        return uniqBy([...prev, clone], (item) => item.url)
      })
      handleRemove({
        ...value,
        imageInfo: {
          thumbnail,
          width: videoWidth,
          height: videoHeight,
        },
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
        return uniqBy([...prev, clone], (item) => item.url)
      })
      handleRemove({
        ...value,
        imageInfo: {
          width: naturalWidth,
          height: naturalHeight,
        },
      })
    } catch (error) {
      handleRemove(value, true)
    }
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
            const { from, to, params, host } = value
            const replacedItemList = cloneDeep(itemList).filter((item) => {
              if (host && !item.url.includes(host)) return false
              return true
            })
            const nextImagePromises = replacedItemList.map((item) => {
              if (host && !item.url.includes(host)) return item
              if (Object.keys(params).length) {
                const url = new URL(item.url)
                Object.keys(params).forEach((key) => {
                  url.searchParams.set(key, params[key])
                })
                item.url = url.toString()
              }
              if (from && item.url.includes(from)) {
                item.url = item.url.replace(from, to)
              } else if (!from && to) {
                item.url = item.url + to
              }
              return item
            })
            set_changedUrl(nextImagePromises)
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
          tooltip={tooltip}
          itemList={itemList}
          current={
            filteredImages.filter((item) => item.imageInfo.active).length
          }
          total={filteredImages.length}
          handleReplace={(arr) => {
            set_changedUrl(arr.map((item) => item))
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
                      onError={() => {
                        handleRemove(value, true)
                      }}
                    />
                  )
                }
                return (
                  <Dispose.Image
                    key={key}
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
