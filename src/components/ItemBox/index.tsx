import classNames from 'classnames'
import React from 'react'
import {
  FaCheck,
  FaClipboard,
  FaDownload,
  FaFilter,
  FaImage,
  FaShare,
  FaVideo,
} from 'react-icons/fa'
import { useRecoilState } from 'recoil'
import { settings } from '../../content/atoms/settings'
import { ItemType } from '../../content/types'
import S from './ItemBox.styles'

interface ItemBoxProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {
  item: ItemType
  setUrl?: (url: string) => void
  setTooltip?: (tooltip: string) => void
}
const ItemBox = ({ item, setUrl, setTooltip, ...props }: ItemBoxProps) => {
  const [settingState] = useRecoilState(settings)
  const { ImageItem, VideoItem } = S
  const copyToClipboard = (text: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then()
      return
    }
  }
  const handleDown = (url: string) => {
    chrome.runtime.sendMessage({
      message: 'download',
      data: [url],
    })
  }
  const handleNewWindow = (url: string | URL) => {
    window.open(url, '_blank')
  }
  const tooltipEventAttributes = (value: string) => {
    return {
      onMouseEnter: () => {
        setTooltip && setTooltip(value)
      },
      onMouseLeave: () => {
        setTooltip && setTooltip('')
      },
    }
  }
  return (
    <>
      <S.Wrap
        className={classNames({ active: item.imageInfo.active }, item.type)}
        {...props}
      >
        <div className="image-box">
          {item.imageInfo.active && (
            <S.CheckIcon>
              <FaCheck />
            </S.CheckIcon>
          )}
          {item.type === 'media' && (
            <>
              <S.MediaIcon>
                <FaVideo />
              </S.MediaIcon>
              <VideoItem
                className={settingState.sizeType}
                key={item.requestId}
                src={item.url}
              />
            </>
          )}
          {item.type === 'image' && (
            <>
              <S.MediaIcon>
                <FaImage />
              </S.MediaIcon>
              <ImageItem
                className={settingState.sizeType}
                key={item.requestId}
                src={item.url}
                alt={item.requestId}
              />
            </>
          )}
        </div>
        <S.ImageSize className="image-size">
          <span>{item.imageInfo.width}px</span>
          <span>×</span>
          <span>{item.imageInfo.height}px</span>
          {item.imageInfo.replaced && <span>(Replaced)</span>}
        </S.ImageSize>
        <S.Icons className="image-icons">
          <S.IconWrap
            {...tooltipEventAttributes('Copy')}
            onClick={(e) => {
              e.stopPropagation()
              copyToClipboard(item.url)
            }}
          >
            <FaClipboard />
          </S.IconWrap>
          <S.IconWrap
            {...tooltipEventAttributes('Download')}
            onClick={(e) => {
              e.stopPropagation()
              handleDown(item.url)
            }}
          >
            <FaDownload />
          </S.IconWrap>
          {setUrl && (
            <S.IconWrap
              {...tooltipEventAttributes('Filter: ' + item.url)}
              onClick={(e) => {
                e.stopPropagation()
                setUrl(item.url)
              }}
            >
              <FaFilter />
            </S.IconWrap>
          )}
          <S.IconWrap
            {...tooltipEventAttributes('New Window')}
            onClick={(e) => {
              e.stopPropagation()
              handleNewWindow(item.url)
            }}
          >
            <FaShare />
          </S.IconWrap>
        </S.Icons>
      </S.Wrap>
    </>
  )
}
export default ItemBox
