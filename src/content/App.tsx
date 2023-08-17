import classNames from 'classnames'
import { isEqual } from 'lodash-es'
import React, {
  MutableRefObject,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
type ImageInfo = {
  width: number
  height: number
  active?: boolean
  replaced?: boolean
}
// 이미지 url을 받아서 ImageInfo 리턴하는 함수
const getImageInfo = (url: string) => {
  return new Promise<ImageInfo>((res, rej) => {
    const image = new Image()
    image.src = url
    image.onload = () => {
      res({
        width: image.naturalWidth,
        height: image.naturalHeight,
      })
    }
    image.onerror = () => {
      rej()
    }
  })
}

const objectKeys = <T extends object>(item: T) => {
  return Object.keys(item) as Array<keyof T>
}
const objectEntries = <T extends object>(item: T) => {
  return Object.entries(item) as Array<[keyof T, T[keyof T]]>
}
type RequestItem = chrome.webRequest.WebResponseHeadersDetails
type DataType = { [key in string]: RequestItem }
const App = (): JSX.Element => {
  const [imageList, set_imageList] = useState<
    (RequestItem & {
      imageInfo: ImageInfo
    })[]
  >([])
  const [sources, set_sources] = useState<DataType | null>(null)
  const [replaceUrl, set_replaceUrl] = useState<{ from: string; to: string }>({
    from: '',
    to: '',
  })
  const [sizeLimit, set_sizeLimit] = useState<{
    width: number
    height: number
  }>({
    width: 0,
    height: 0,
  })
  const [searchTextOnUrl, set_searchTextOnUrl] = useState<string>('')
  const filteredImages = useMemo(() => {
    return imageList.filter((item) => {
      if (!item.imageInfo) return false
      const { width, height } = item.imageInfo
      let searchResult = true
      let sizeResult = true
      if (searchTextOnUrl) searchResult = item.url.includes(searchTextOnUrl)
      if (sizeLimit.width && sizeLimit.height)
        sizeResult = width > sizeLimit.width && height > sizeLimit.height
      return searchResult && sizeResult
    })
  }, [imageList, sizeLimit, searchTextOnUrl])
  const [downloadedItem, set_downloadedItem] = useState<string[]>([])
  const timeoutRef = useRef(null) as MutableRefObject<NodeJS.Timeout | null>
  useEffect(() => {
    function getData(): Promise<{
      data: DataType
      downloaded: string[]
    }> {
      if (chrome.runtime.lastError) console.log(chrome.runtime.lastError)
      return new Promise((res, rej) => {
        chrome.runtime.sendMessage(
          'get-items',
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
          set_downloadedItem(downloaded)
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
  return (
    <div className="utaku-wrapper" style={{ background: '#fff' }}>
      <div className="utaku-header">
        <div className="utaku-header-title">Utaku</div>
        <div className="utaku-header-search">
          <input
            type="text"
            value={searchTextOnUrl}
            onChange={(e) => {
              set_searchTextOnUrl(e.target.value)
            }}
          />
        </div>
        <div className="utaku-header-replace">
          <div className="utaku-header-replace-item">
            <div className="utaku-header-replace-item-title">From</div>
            <input
              type="text"
              value={replaceUrl.from}
              onChange={(e) => {
                set_replaceUrl((prev) => ({
                  ...prev,
                  from: e.target.value,
                }))
              }}
            />
          </div>
          <div className="utaku-header-replace-item">
            <div className="utaku-header-replace-item-title">To</div>
            <input
              type="text"
              value={replaceUrl.to}
              onChange={(e) => {
                set_replaceUrl((prev) => ({
                  ...prev,
                  to: e.target.value,
                }))
              }}
            />
          </div>
        </div>
        <div className="replace-submit">
          <button
            onClick={async () => {
              const { from, to } = replaceUrl
              if (!from || !to) return

              const nextImagePromises = imageList.map(async (item) => {
                if (item.url.includes(from)) {
                  item.url = item.url.replace(from, to)
                }
                item.imageInfo = {
                  ...item.imageInfo,
                  ...((await getImageInfo(item.url)) ?? {}),
                  replaced: true,
                }
                return item
              })

              const nextImage = await Promise.all(nextImagePromises)
              set_imageList(nextImage)
            }}
          >
            Replace
          </button>
        </div>
        <div className="utaku-header-size">
          <div className="utaku-header-size-item">
            <div className="utaku-header-size-item-title">Width</div>
            <input
              type="number"
              value={sizeLimit.width}
              onChange={(e) => {
                set_sizeLimit((prev) => ({
                  ...prev,
                  width: Number(e.target.value),
                }))
              }}
            />
          </div>
          <div className="utaku-header-size-item">
            <div className="utaku-header-size-item-title">Height</div>
            <input
              type="number"
              value={sizeLimit.height}
              onChange={(e) => {
                set_sizeLimit((prev) => ({
                  ...prev,
                  height: Number(e.target.value),
                }))
              }}
            />
          </div>
        </div>
      </div>

      <div
        className="utaku-container"
        onWheel={(e) => {
          e.currentTarget.scrollLeft += e.deltaY
        }}
      >
        <div className="utaku-dispose-image">
          {sources &&
            objectEntries(sources).map(([key, value]) => {
              return (
                <img
                  key={key}
                  src={value.url}
                  alt={value.requestId}
                  onLoad={(e) => {
                    const imageTarget = e.currentTarget
                    const { naturalWidth, naturalHeight } = imageTarget
                    set_imageList((prev) => {
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
                  }}
                  // onError={(e) => handleOnError(e, item)}
                />
              )
            })}
        </div>
        <div className="utaku-grid">
          {filteredImages &&
            filteredImages.map((value) => {
              return (
                <div
                  className={classNames(
                    { active: value.imageInfo?.active },
                    'grid-item'
                  )}
                  key={value.requestId}
                >
                  <div
                    className="image-box"
                    onClick={() => {
                      set_imageList((prev) => {
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
                  >
                    <img src={value.url} alt={value.requestId} />
                  </div>
                  <div>
                    {value.imageInfo && (
                      <div>
                        <div>
                          Size: {value.imageInfo.width} x{' '}
                          {value.imageInfo.height}{' '}
                        </div>
                        {value.imageInfo.replaced && <div>Replaced</div>}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
        </div>
      </div>
    </div>
  )
}

export default App
