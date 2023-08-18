import classNames from 'classnames'
import React from 'react'
import { FaCheck, FaClipboard, FaDownload, FaShare } from 'react-icons/fa'
import { ItemType } from '../../content/App'
import S from './ItemBox.styles'

interface ItemBoxProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {
  item: ItemType
}
const ItemBox = ({ item, ...props }: ItemBoxProps) => {
  const { ImageItem } = S
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
  return (
    <>
      <S.Wrap
        className={classNames({ active: item.imageInfo.active })}
        {...props}
      >
        <div className="image-box">
          {item.imageInfo.active && (
            <i className="check">
              <FaCheck />
            </i>
          )}
          {/* {item.downloaded && (
              <i className="downloaded">
                <FaCheck />
              </i>
            )} */}
          <ImageItem key={item.requestId} src={item.url} alt={item.requestId} />
        </div>
        <S.ImageSize className="image-size">
          <span>width: {item.imageInfo.width}px</span>
          <span>height: {item.imageInfo.height}px</span>
        </S.ImageSize>
        <S.Icons className="image-icons">
          <div>
            <S.IconWrap
              onClick={(e) => {
                e.stopPropagation()
                copyToClipboard(item.url)
              }}
            >
              <FaClipboard />
            </S.IconWrap>
            <S.IconWrap
              onClick={(e) => {
                e.stopPropagation()
                handleDown(item.url)
              }}
            >
              <FaDownload />
            </S.IconWrap>
          </div>
          <S.IconWrap
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
