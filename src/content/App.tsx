import { isEqual, sortBy } from 'lodash-es'
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
import { settings } from '../atoms/settings'
import ItemBox from '../components/ItemBox'
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
  useEffect(() => {
    chrome.storage.local.get(
      [
        'folderName',
        'folderNameList',
        'sizeLimit',
        'sizeType',
        'itemType',
        'remapList',
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
      const video = e.currentTarget
      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const context = canvas.getContext('2d')
      if (context) context.drawImage(video, 0, 0, canvas.width, canvas.height)
      const thumbnail = canvas.toDataURL('image/png')
      const videoTarget = e.currentTarget
      const { videoWidth, videoHeight } = videoTarget
      set_itemList((prev) => {
        const clone: WebResponseItem & {
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
      set_itemList((prev) => {
        const clone: WebResponseItem & {
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
  if (!itemList) return <></>
  return (
    <>
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
          current={
            filteredImages.filter((item) => item.imageInfo.active).length
          }
          total={filteredImages.length}
        />
        <UtakuStyle.ItemContainer
          onWheel={(e) => {
            e.currentTarget.scrollLeft += e.deltaY
          }}
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
          <UtakuStyle.Grid>
            {filteredImages &&
              filteredImages.map((value) => {
                return (
                  <ItemBox
                    item={value}
                    key={'filteredImages' + value.url}
                    setUrl={() => {
                      console.log('deprecated')
                    }}
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
      </div>
    </>
  )
}

export default App
