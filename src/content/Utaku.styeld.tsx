import styled from '@emotion/styled'
import { colors, typography } from '../themes'

export const Controller = styled.div`
  height: 50px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  backdrop-filter: blur(6px);
  background-color: rgb(190 190 190 / 50%);
  padding: 0 22px;
  color: ${colors['White/White off']};
  & > div {
    display: flex;
    align-items: center;
    gap: 4px;
  }
  button:disabled {
    background-color: ${colors['White/White 10%']};
    color: ${colors['Grayscale/Gray Default']};
    box-shadow: none;
    cursor: default;
  }
  ${typography['Body/Small/Bold']}
`
export const Editor = styled(Controller)`
  background-color: rgb(7 121 255 / 50%);
`
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
export const Left = styled.div``
export const Right = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`
export const Center = styled.div``
export const UtakuImageList = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  z-index: 9999;
  height: 100vh;
  min-width: 300px;
  max-width: 50vw;
  width: 100%;
  padding: 0;
  transform: translateX(100%);
  transition: 0.3s;
  .utaku-toggle .active {
    visibility: hidden;
    display: none;
  }
  .utaku-toggle .in-active {
    visibility: visible;
    display: block;
  }
  &.active {
    transform: translateX(0);
    .utaku-toggle .active {
      visibility: visible;
      display: block;
    }
    .utaku-toggle .in-active {
      visibility: hidden;
      display: none;
    }
  }

  * {
    box-sizing: border-box;
  }
  .utaku-container {
    width: 100%;
    height: calc(100% - 100px);
    padding: 16px;
    backdrop-filter: blur(6px);
    background-color: rgb(0 0 0 / 50%);
    overflow-y: auto;
    overscroll-behavior-y: contain;
  }
  .utaku-grid {
    column-count: 4;
    column-gap: 1%;
  }
  .utaku-grid > img {
    width: 100%;
    break-inside: avoid;
    box-sizing: border-box;
  }

  .utaku-toggle {
    position: absolute;
    top: 0;
    left: 0;
    border-radius: 15px 0 0 15px;
    backdrop-filter: blur(6px);
    background-color: rgb(190 190 190 / 50%);
    width: 30px;
    height: 50px;
    transform: translate(-30px, 0);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .utaku-dispose-image {
    position: absolute;
    top: 0;
    left: 0;
    width: 1px;
    height: 1px;
    overflow: hidden;
    & > img {
      width: 1px;
      height: 1px;
    }
  }
  &.bottom {
    top: initial;
    left: 0;
    bottom: 0;
    min-width: 100vw;
    max-width: 100vw;
    height: 504px;
    transform: translateY(100%);
    &.active {
      transform: translateY(0);
    }
    .utaku-container {
      overflow-y: hidden;
      overscroll-behavior-y: contain;
      overflow-x: auto;
      overscroll-behavior-x: contain;
    }
    .utaku-grid {
      column-count: initial;
      column-gap: initial;
      display: flex;
      gap: 8px;
    }
    .image-size {
      justify-content: flex-start;
      flex-direction: column;
    }
    .image-box img {
      width: auto;
      height: 280px;
      break-inside: avoid;
      box-sizing: border-box;
    }
    .utaku-toggle {
      left: 50%;

      width: 80px;
      height: 30px;
      border-radius: 15px 15px 0 0;

      transform: translate(-50%, -100%);
      svg {
        transform: rotate(90deg);
      }
    }
  }
`
export const ImageItem = styled.img`
  width: 100%;
  break-inside: avoid;
  box-sizing: border-box;
  &.downloaded {
    opacity: 0.4;
  }
`
