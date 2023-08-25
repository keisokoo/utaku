import React, { useEffect, useMemo, useState } from 'react'
import { PrimaryButton } from '../components/Buttons'
import Modal from '../components/Modal'
import ModalBody from '../components/Modal/ModalBody'
import Tooltip from '../components/Tooltip'
import UtakuStyle from './Utaku.styled'
import { itemTypes } from './sources'
import { ImageInfo, ItemType } from './types'

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
interface ControlCompProps {
  itemType: (typeof itemTypes)[number]
  tooltip: string
  itemList: ItemType[]
  sizeLimit: {
    width: number
    height: number
  }
  current: number
  total: number
  handleItemList: (itemList: ItemType[]) => void
  handleSizeLimit: (size: { width: number; height: number }) => void
  handleItemType: (type: (typeof itemTypes)[number]) => void
}
const ControlComp = ({
  itemType,
  current,
  total,
  tooltip,
  itemList,
  sizeLimit,
  handleItemList,
  handleSizeLimit,
  handleItemType,
}: ControlCompProps) => {
  const [folderName, set_folderName] = useState<string>('')
  const [replaceUrl, set_replaceUrl] = useState<{ from: string; to: string }>({
    from: '',
    to: '',
  })
  const [searchTextOnUrl, set_searchTextOnUrl] = useState<string>('')
  const [modalOpen, set_modalOpen] = useState<'folder' | 'more' | null>(null)

  const hasReplaced = useMemo(() => {
    return itemList.some((item) => item.imageInfo?.replaced)
  }, [itemList])
  useEffect(() => {
    chrome.storage.sync.get(['folderName', 'folderNameList'], (items) => {
      if (items.folderName) set_folderName(items.folderName)
      // if (items.folderNameList) set_folderNameList(items.folderNameList)
    })
  }, [])
  return (
    <>
      <Modal
        open={modalOpen !== null}
        onClose={() => {
          set_modalOpen(null)
        }}
      >
        {modalOpen === 'folder' && <ModalBody title="folder">folder</ModalBody>}
        {modalOpen === 'more' && (
          <ModalBody title="more">
            <div className="utaku-filter">
              <div className="utaku-filter-title">
                <span>URL Filter</span>
              </div>
              <div className="utaku-filter-search">
                <div className="utaku-filter-item">
                  <UtakuStyle.Input
                    placeholder="URL Filter"
                    type="text"
                    value={searchTextOnUrl}
                    onChange={(e) => {
                      set_searchTextOnUrl(e.target.value)
                    }}
                  />
                </div>
              </div>
              <div className="utaku-filter-title">
                <span>Replace</span>
              </div>
              <div className="utaku-filter-replace">
                <div className="utaku-filter-item">
                  <UtakuStyle.Input
                    placeholder="From"
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
                <div className="utaku-filter-item">
                  <UtakuStyle.Input
                    placeholder="To"
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
                    <PrimaryButton
                      onClick={async () => {
                        const { from, to } = replaceUrl
                        const nextImagePromises = itemList.map(async (item) => {
                          const beforeUrl = item.url
                          if (from && item.url.includes(from)) {
                            item.url = item.url.replace(from, to)
                          } else if (!from && to) {
                            item.url = item.url + to
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
                        handleItemList(nextImage)
                      }}
                    >
                      Replace
                    </PrimaryButton>
                  )}
                  {hasReplaced && (
                    <button
                      onClick={async () => {
                        const nextImagePromises = itemList.map(async (item) => {
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
                        handleItemList(nextImage)
                      }}
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>
            </div>
          </ModalBody>
        )}
      </Modal>
      <UtakuStyle.Editor>
        <UtakuStyle.Left>
          <UtakuStyle.InputWrap>
            <span>Folder:</span>
            <UtakuStyle.Input
              value={folderName}
              onChange={(e) => {
                set_folderName(e.target.value)
                chrome.runtime.sendMessage(
                  { message: 'setFolderName', data: e.target.value },
                  () => {
                    if (chrome.runtime.lastError)
                      console.log(chrome.runtime.lastError)
                  }
                )
              }}
            />
            <div
              onClick={() => {
                set_modalOpen('folder')
              }}
            >
              More
            </div>
          </UtakuStyle.InputWrap>
          <UtakuStyle.InputWrap>
            <span>Size:</span>
            <UtakuStyle.Input
              type={'number'}
              min={1}
              value={sizeLimit.width}
              onChange={(e) => {
                handleSizeLimit({
                  ...sizeLimit,
                  width: Number(e.target.value),
                })
              }}
            />
            <span>×</span>
            <UtakuStyle.Input
              type={'number'}
              min={1}
              value={sizeLimit.height}
              onChange={(e) => {
                handleSizeLimit({
                  ...sizeLimit,
                  height: Number(e.target.value),
                })
              }}
            />
          </UtakuStyle.InputWrap>
          <div
            onClick={() => {
              set_modalOpen('more')
            }}
          >
            More
          </div>
        </UtakuStyle.Left>
        <UtakuStyle.Right>
          <UtakuStyle.SizeController>
            {itemTypes.map((type) => (
              <div
                key={type}
                className={type === itemType ? 'active' : ''}
                onClick={() => {
                  handleItemType(type)
                }}
              >
                {type}
              </div>
            ))}
          </UtakuStyle.SizeController>
          <div>
            {'( '}
            <span>
              {current}
              {' / '}
              {total}
            </span>
            {' )'}
          </div>
        </UtakuStyle.Right>
        {tooltip && <Tooltip className="utaku-url-tooltip">{tooltip}</Tooltip>}
      </UtakuStyle.Editor>
    </>
  )
}
export default ControlComp
