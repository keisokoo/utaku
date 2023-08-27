import { css } from '@emotion/react'
import styled from '@emotion/styled'
import { colors, typography } from '../../themes'
const mediaCss = css`
  width: auto;
  height: 120px;
  min-width: 100px;
  object-fit: contain;
  break-inside: avoid;
  box-sizing: border-box;
`
const iconsCss = css`
  position: absolute;
  font-size: 16px;
  color: #00bd1e;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #fff;
`
const ImageItem = styled.img`
  ${mediaCss}
  &.medium {
    height: 160px;
  }
  &.large {
    height: 240px;
  }
`
const VideoItem = styled.video`
  ${mediaCss}
  &.medium {
    height: 160px;
  }
  &.large {
    height: 240px;
  }
`
const CheckIcon = styled.i`
  ${iconsCss}
  top: 8px;
  left: 8px;
`
const MediaIcon = styled.i`
  ${iconsCss}
  top: 8px;
  right: 8px;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
`
const IconWrap = styled.i`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: #0000006e;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  color: ${colors['White/White 30%']};
  &:hover {
    color: ${colors['White/White off']};
  }
  svg {
    width: 8px;
    height: 8px;
  }
`
const ImageSize = styled.div`
  ${typography['Body/Small/Regular']}
  font-size: 12px;
  padding: 0px 0 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  color: ${colors['White/White 70%']};
`
const ItemBoxStyles = {
  Wrap: styled.div`
    break-inside: avoid;
    box-sizing: border-box;
    opacity: 0.8;
    cursor: pointer;
    transition: ease-out 0.15s;
    position: relative;
    &:hover {
      opacity: 1;
    }
    padding: 6px;
    color: ${colors['White/White 70%']};
    .image-box {
      font-size: 0;
      border-radius: 8px;
      overflow: hidden;
    }
    &.image {
      ${CheckIcon} {
        color: ${colors['Accent/Default']};
      }
      .image-box {
        background-color: #c7faff40;
      }
    }
    &.media {
      ${MediaIcon} {
        color: ${colors['Secondary/Default']};
      }
      .image-box {
        background-color: #ff528640;
      }
    }
    &.active {
      opacity: 1;
      border-radius: 8px;
      ${ImageSize} {
        color: ${colors['Accent/Dark']};
      }
      &.image {
        background-color: ${colors['Accent/Light']};
      }
      &.media {
        background-color: ${colors['Secondary/Light']};
      }
    }
  `,
  ImageSize,
  Icons: styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  `,
  IconWrap,
  ImageItem,
  VideoItem,
  CheckIcon,
  MediaIcon,
}
export default ItemBoxStyles
