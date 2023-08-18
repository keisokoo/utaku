import styled from '@emotion/styled'
import { isEqual } from 'lodash-es'
import React, {
  MutableRefObject,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  GrayScaleFill,
  PrimaryButton,
  SecondaryButton,
  WhiteFill,
} from '../components/Buttons'
import { colors, typography } from '../themes'
import { Center, Controller, Editor, Left, Right } from './Utaku.styeld'

import {
  FaCaretDown,
  FaCaretUp,
  FaCheckCircle,
  FaCircle,
  FaFileDownload,
  FaTrash,
} from 'react-icons/fa'
import ItemBox from '../components/ItemBox'
export const InputWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  margin-right: 16px;
`
export const Input = styled.input`
  width: 80px;
  border-radius: 4px;
  backdrop-filter: blur(6px);
  background-color: rgb(255 255 255 / 80%);
  color: ${colors['Grayscale/Gray Dark']};
  padding: 2px 6px;
  border: none;
  &:focus {
    outline: none;
    background-color: rgb(255 255 255 / 100%);
  }
  ${typography['Body/Small/Bold']}
`
type ImageInfo = {
  width: number
  height: number
  active?: boolean
  replaced?: string
}
export type ItemType = RequestItem & {
  imageInfo: ImageInfo
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
      rej(new Error(`Failed to load image from URL: ${url}`))
    }
  })
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
  const [folderName, set_folderName] = useState<string>('')
  const [sources, set_sources] = useState<DataType | null>(null)
  const [replaceUrl, set_replaceUrl] = useState<{ from: string; to: string }>({
    from: '',
    to: '',
  })
  const [sizeLimit, set_sizeLimit] = useState<{
    width: number
    height: number
  }>({
    width: 600,
    height: 600,
  })
  const [extraControl, set_extraControl] = useState<boolean>(false)
  const [searchTextOnUrl, set_searchTextOnUrl] = useState<string>('')
  const [downloadedItem, set_downloadedItem] = useState<string[]>([])
  const filteredImages = useMemo(() => {
    return imageList.filter((item) => {
      if (!item.imageInfo) return false
      const { width, height } = item.imageInfo
      let searchResult = true
      let sizeResult = true
      let notDownloaded = true
      if (downloadedItem.includes(item.url)) notDownloaded = false
      if (searchTextOnUrl) searchResult = item.url.includes(searchTextOnUrl)
      if (sizeLimit.width && sizeLimit.height)
        sizeResult = width > sizeLimit.width && height > sizeLimit.height
      return searchResult && sizeResult && notDownloaded
    })
  }, [imageList, sizeLimit, searchTextOnUrl, downloadedItem])
  const hasReplaced = useMemo(() => {
    return imageList.some((item) => item.imageInfo?.replaced)
  }, [imageList])
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
    <div className="utaku-wrapper">
      <Controller>
        <Left>
          <WhiteFill
            _mini
            onClick={(e) => {
              e.stopPropagation()
              set_imageList([])
            }}
          >
            <FaTrash /> All
          </WhiteFill>
          <WhiteFill
            _mini
            disabled={filteredImages.every((item) => !item.imageInfo.active)}
            onClick={(e) => {
              e.stopPropagation()
              set_imageList((prev) => {
                return prev.filter((item) => !item.imageInfo.active)
              })
            }}
          >
            <FaTrash />
            Deselected
          </WhiteFill>
          <WhiteFill
            _mini
            disabled={filteredImages.every((item) => !item.imageInfo.active)}
            onClick={(e) => {
              e.stopPropagation()
              set_imageList((prev) => {
                return prev.filter((item) => item.imageInfo.active)
              })
            }}
          >
            <FaTrash />
            Selected
          </WhiteFill>
        </Left>
        <Center>
          <GrayScaleFill
            _mini
            disabled={filteredImages.every((item) => !item.imageInfo.active)}
            onClick={(e) => {
              e.stopPropagation()
              set_imageList((prev) => {
                return prev.map((item) => {
                  item.imageInfo = {
                    ...item.imageInfo,
                    active: false,
                  }
                  return item
                })
              })
            }}
          >
            <FaCircle />
            All
          </GrayScaleFill>
          <GrayScaleFill
            _mini
            disabled={filteredImages.every((item) => item.imageInfo.active)}
            onClick={(e) => {
              e.stopPropagation()
              set_imageList((prev) => {
                return prev.map((item) => {
                  item.imageInfo = {
                    ...item.imageInfo,
                    active: true,
                  }
                  return item
                })
              })
            }}
          >
            <FaCheckCircle />
            All
          </GrayScaleFill>
        </Center>
        <Right>
          <SecondaryButton
            _mini
            disabled={!imageList.some((item) => item.imageInfo.active)}
            onClick={(e) => {
              e.stopPropagation()
              selectedDownload()
            }}
          >
            <FaFileDownload />
            Selected
          </SecondaryButton>
          <PrimaryButton
            _mini
            onClick={(e) => {
              e.stopPropagation()
              selectedDownload(true)
            }}
          >
            <FaFileDownload />
            All
          </PrimaryButton>
        </Right>
      </Controller>
      <Editor>
        <Left>
          <InputWrap>
            <span>Folder:</span>
            <Input
              value={folderName}
              onChange={(e) => {
                set_folderName(e.target.value)
                chrome.runtime.sendMessage({ folderName: e.target.value })
              }}
            />
          </InputWrap>
          <InputWrap>
            <span>width:</span>
            <Input
              type={'number'}
              min={1}
              value={sizeLimit.width}
              onChange={(e) => {
                set_sizeLimit((prev) => ({
                  ...prev,
                  width: Number(e.target.value),
                }))
                chrome.storage.sync.set({
                  sizeLimit: { ...sizeLimit, width: Number(e.target.value) },
                })
              }}
            />
            <span>height:</span>
            <Input
              type={'number'}
              min={1}
              value={sizeLimit.height}
              onChange={(e) => {
                set_sizeLimit((prev) => ({
                  ...prev,
                  height: Number(e.target.value),
                }))
                chrome.storage.sync.set({
                  sizeLimit: { ...sizeLimit, height: Number(e.target.value) },
                })
              }}
            />
          </InputWrap>
          <div
            onClick={() => {
              set_extraControl((prev) => !prev)
            }}
          >
            {extraControl ? <FaCaretUp /> : <FaCaretDown />}
          </div>
        </Left>
        <Right>
          <div>
            {'( '}
            <span>
              {filteredImages.filter((item) => item.imageInfo.active).length}
              {' / '}
              {filteredImages.length}
            </span>
            {' )'}
          </div>
        </Right>
      </Editor>
      {extraControl && (
        <div className="utaku-filter">
          <div className="utaku-left">
            {/* url search */}
            <div className="utaku-filter-search">
              <Input
                type="text"
                value={searchTextOnUrl}
                onChange={(e) => {
                  set_searchTextOnUrl(e.target.value)
                }}
              />
            </div>
            <div className="utaku-filter-replace">
              <div className="utaku-filter-replace-item">
                <div className="utaku-filter-replace-item-title">From</div>
                <Input
                  type="text"
                  value={replaceUrl.from}
                  onChange={(e) => {
                    set_replaceUrl((prev) => ({
                      ...prev,
                      from: e.target.value,
                    }))
                  }}
                  disabled={hasReplaced}
                />
              </div>
              <div className="utaku-filter-replace-item">
                <div className="utaku-filter-replace-item-title">To</div>
                <Input
                  type="text"
                  value={replaceUrl.to}
                  onChange={(e) => {
                    set_replaceUrl((prev) => ({
                      ...prev,
                      to: e.target.value,
                    }))
                  }}
                  disabled={hasReplaced}
                />
              </div>
              <div className="replace-submit">
                {!hasReplaced && (
                  <button
                    onClick={async () => {
                      const { from, to } = replaceUrl
                      if (!from || !to) return
                      const nextImagePromises = imageList.map(async (item) => {
                        const beforeUrl = item.url
                        if (item.url.includes(from)) {
                          item.url = item.url.replace(from, to)
                        }
                        item.imageInfo = {
                          ...item.imageInfo,
                          ...((await getImageInfo(item.url)) ?? {}),
                          replaced: beforeUrl,
                        }
                        return item
                      })
                      const nextImage = (
                        await Promise.all(nextImagePromises)
                      ).filter(Boolean)
                      set_imageList(nextImage)
                    }}
                  >
                    Replace
                  </button>
                )}
                {hasReplaced && (
                  <button
                    onClick={async () => {
                      const nextImagePromises = imageList.map(async (item) => {
                        const beforeUrl = item.imageInfo.replaced
                        if (!beforeUrl) return item
                        item.url = beforeUrl
                        item.imageInfo = {
                          ...item.imageInfo,
                          ...((await getImageInfo(item.url)) ?? {}),
                          replaced: '',
                        }
                        return item
                      })

                      const nextImage = (
                        await Promise.all(nextImagePromises)
                      ).filter(Boolean)
                      set_imageList(nextImage)
                    }}
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
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
                <ItemBox
                  item={value}
                  key={value.requestId}
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
                />
              )
            })}
        </div>
      </div>
    </div>
  )
}

export default App
