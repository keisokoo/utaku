import React from 'react'
import {
  FaArrowLeft,
  FaArrowRight,
  FaCheck,
  FaClipboard,
  FaDownload,
  FaImage,
  FaRegEdit,
  FaShare,
  FaSync,
  FaVideo,
} from 'react-icons/fa'
import { useRecoilState } from 'recoil'
import { settings } from '../../atoms/settings'
import { ItemType } from '../../content/types'
import { copyToClipboard } from '../../utils'
import S from './ItemBox.styles'

interface ItemBoxProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {
  item: ItemType
  itemIndex: number
  setTooltip?: (tooltip: string) => void
  handleRemaps?: (url: string) => void
  handleOrder?: (item: ItemType, direction: 'left' | 'right') => void
}
const ItemBox = ({
  item,
  setTooltip,
  handleRemaps,
  handleOrder,
  ...props
}: ItemBoxProps) => {
  const [settingState] = useRecoilState(settings)
  const { ImageItem, VideoItem } = S
  const handleDown = (url: string) => {
    if (settingState.modeType === 'simple') {
      chrome.runtime.sendMessage({
        message: 'simple-download',
        data: [url],
      })
      return
    }
    if (settingState.modeType === 'enhanced') {
      chrome.runtime.sendMessage({
        message: 'download',
        data: [url],
      })
      return
    }
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
        data-utaku-active={item.imageInfo.active}
        data-utaku-item-type={item.type}
        {...props}
      >
        <S.ImageBox>
          {item.imageInfo.active && (
            <S.CheckIcon>
              <FaCheck />
            </S.CheckIcon>
          )}
          {item.imageInfo?.download && (
            <S.DownloadIcon>
              <FaSync />
            </S.DownloadIcon>
          )}
          {item.type === 'media' && (
            <>
              <S.MediaIcon>
                <FaVideo />
              </S.MediaIcon>
              <VideoItem
                src={item.url}
                draggable="false"
                data-item-size={settingState.sizeType}
                data-wrapper-size={settingState.containerSize}
                muted
                loop
                onMouseEnter={(e) => {
                  e.currentTarget.play()
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.pause()
                }}
              />
            </>
          )}
          {item.type === 'image' && (
            <>
              <S.MediaIcon>
                <FaImage />
              </S.MediaIcon>
              <ImageItem
                src={item.url}
                alt={item.requestId}
                draggable="false"
                data-item-size={settingState.sizeType}
                data-wrapper-size={settingState.containerSize}
              />
            </>
          )}
        </S.ImageBox>
        <S.ImageSize data-item-size={settingState.sizeType}>
          <span>{item.imageInfo.width}px</span>
          <span>×</span>
          <span>{item.imageInfo.height}px</span>
        </S.ImageSize>
        <S.Icons data-item-size={settingState.sizeType}>
          <S.IconWrap
            {...tooltipEventAttributes('Order Left')}
            onClick={(e) => {
              e.stopPropagation()
              handleOrder && handleOrder(item, 'left')
            }}
          >
            <FaArrowLeft />
          </S.IconWrap>
          <S.IconWrap
            {...tooltipEventAttributes('Copy')}
            onClick={async (e) => {
              e.stopPropagation()
              await copyToClipboard(item.url)
              setTooltip && setTooltip('Copied')
              setTimeout(() => {
                setTooltip && setTooltip('')
              }, 2000)
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
          <S.IconWrap
            {...tooltipEventAttributes('Remap: ' + item.url)}
            onClick={(e) => {
              e.stopPropagation()
              if (settingState.modeType === 'simple') {
                handleRemaps && handleRemaps(item.url)
                return
              }
              if (settingState.modeType === 'enhanced') {
                chrome.runtime.sendMessage({
                  message: 'create-remap',
                  data: item.url,
                })
                return
              }
            }}
          >
            <FaRegEdit />
          </S.IconWrap>
          <S.IconWrap
            {...tooltipEventAttributes('New Window')}
            onClick={(e) => {
              e.stopPropagation()
              handleNewWindow(item.url)
            }}
          >
            <FaShare />
          </S.IconWrap>
          <S.IconWrap
            {...tooltipEventAttributes('Order Right')}
            onClick={(e) => {
              e.stopPropagation()
              handleOrder && handleOrder(item, 'right')
            }}
          >
            <FaArrowRight />
          </S.IconWrap>
        </S.Icons>
      </S.Wrap>
    </>
  )
}
export default ItemBox
