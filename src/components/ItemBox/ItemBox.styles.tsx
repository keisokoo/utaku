import { css, keyframes } from '@emotion/react'
import styled from '@emotion/styled'
import { colors, typography } from '../../themes'
const syncRotateKeyframes = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`
const mediaCss = css`
  &:not([data-wrapper-size='tile']) {
    height: 120px;
    min-width: 100px;
    width: auto;
    max-width: initial;
    &[data-item-size='medium'] {
      height: 160px;
    }
    &[data-item-size='large'] {
      height: 240px;
    }
  }
  object-fit: contain;
  break-inside: avoid;
  box-sizing: border-box;
  &[data-wrapper-size='tile'] {
    height: auto;
    width: 100%;
  }
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
`
const VideoItem = styled.video`
  ${mediaCss}
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
  border-radius: 50%;
  background-color: #0000006e;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${colors['White/White 30%']};
  &:hover {
    color: ${colors['White/White off']};
  }
`
const ImageSize = styled.div`
  ${typography['Body/Small/Regular']}
  font-size: 14px;
  line-height: 24px;
  padding: 0px 0 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  color: ${colors['White/White 70%']};
  &[data-item-size='small'] {
    font-size: 12px;
    line-height: 20px;
  }
  &[data-item-size='large'] {
    font-size: 16px;
    line-height: 28px;
  }
`
const ImageBox = styled.div`
  font-size: 0;
  border-radius: 8px;
  overflow: hidden;
`
const DummyBox = styled.div`
  ${mediaCss}
  width: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  color: #fff;
  gap: 8px;
  svg {
    font-size: 24px;
    animation: ${syncRotateKeyframes} 1s linear infinite;
  }
  span {
    font-size: 16px;
  }
`
const ItemBoxStyles = {
  ImageBox,
  DummyBox,
  LoadingWrap: styled.div`
    break-inside: avoid;
    box-sizing: border-box;
    opacity: 0.8;
    cursor: pointer;
    transition: ease-out 0.15s;
    position: relative;
    &:hover {
      opacity: 1;
    }
    display: flex;
    align-items: center;
    justify-content: center;
  `,
  Wrap: styled.div`
    user-select: none;
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

    &[data-wrapper-size='tile'] {
      width: 100%;
      break-inside: avoid;
      margin-bottom: 16px;
    }
    &.image {
      ${CheckIcon} {
        color: ${colors['Accent/Default']};
      }
      ${ImageBox} {
        background-color: #c7faff40;
      }
    }
    &.media {
      ${MediaIcon} {
        color: ${colors['Secondary/Default']};
      }
      ${ImageBox} {
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
    & > i {
      padding: 4px;
      font-size: 11px;
      &[data-item-size='small'] {
        padding: 3px;
        font-size: 10px;
      }
      &[data-item-size='large'] {
        padding: 4px;
        font-size: 12px;
      }
    }
  `,
  IconWrap,
  ImageItem,
  VideoItem,
  CheckIcon,
  MediaIcon,
  DownloadIcon: styled.i`
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    background-color: #8e8c009e;
    width: 100%;
    height: 100%;
    font-size: 16px;
    color: #fff;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    & > svg {
      animation: ${syncRotateKeyframes} 1s linear infinite;
    }
  `,
}
export default ItemBoxStyles
