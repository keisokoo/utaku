import styled from '@emotion/styled'
import { colors, typography } from '../../themes'
const ImageItem = styled.img`
  width: auto;
  height: 120px;
  min-width: 100px;
  object-fit: contain;
  break-inside: avoid;
  box-sizing: border-box;
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
      background-color: #ffffff30;
      border-radius: 8px;
      overflow: hidden;
    }
    &.active {
      opacity: 1;
      border-radius: 8px;
      background-color: ${colors['Accent/Light']};
      .check {
        position: absolute;
        top: 8px;
        left: 8px;
        font-size: 16px;
        color: #00bd1e;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: #fff;
      }
      ${ImageSize} {
        color: ${colors['Accent/Dark']};
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
}
export default ItemBoxStyles
