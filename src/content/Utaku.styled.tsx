import { css } from '@emotion/react'
import styled from '@emotion/styled'
import { colors, typography } from '../themes'

const Controller = styled.div`
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
  }
  button:disabled {
    background-color: ${colors['White/White 10%']};
    color: ${colors['Grayscale/Gray Default']};
    opacity: 0.5;
    box-shadow: none;
    cursor: default;
  }
  ${typography['Body/Small/Bold']}
  .utaku-url-tooltip {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    white-space: nowrap;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`
const Editor = styled(Controller)`
  background-color: rgb(7 121 255 / 50%);
`
const InputWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  margin-right: 16px;
  color: #fff;
`
const Input = styled.input`
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
const DisposeContainer = styled.div`
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
`
const Left = styled.div`
  gap: 4px;
`
const Right = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`
const ItemContainer = styled.div`
  overflow: auto hidden;
  overscroll-behavior: contain;
  width: 100%;
  height: calc(100% - 100px);
  padding: 16px;
  backdrop-filter: blur(6px);
  background-color: rgba(0, 0, 0, 0.5);
`
const Grid = styled.div`
  flex-direction: row-reverse;
  justify-content: flex-end;
  column-count: initial;
  display: flex;
  gap: 8px;
`
const Center = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`
const switchCss = css`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px;
  border-radius: 24px;
  background-color: ${colors['White/White 10%']};
  & > div {
    color: ${colors['White/White off']};
    ${typography['Body/Small/Bold']}
    border-radius: 24px;
    padding: 4px 12px;
    text-transform: capitalize;
    cursor: pointer;
    &.active {
      color: ${colors['Primary/Default']};
      background-color: ${colors['White/White 70%']};
    }
  }
`
export const ModalList = {
  NameList: styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
    max-height: 400px;
    overflow-y: auto;
    overscroll-behavior-y: contain;
  `,
  BottomList: styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 16px;
  `,
  List: styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
  `,
  Row: styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 8px;
    border-radius: 8px;
    border: 1px solid #ccc;
  `,
  Name: styled.div`
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  `,
  Buttons: styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    justify-content: flex-end;
  `,
}
const IconButton = styled.button`
  appearance: none;
  display: flex;
  outline: none;
  align-items: center;
  border-radius: 8px;
  background: #ffffff26;
  color: #fff;
  cursor: pointer;
  padding: 8px;
  font-size: 12px;
  margin-left: 4px;
  border: none;
  &:hover {
    background: #ffffff70;
  }
`
const UtakuStyle = {
  IconButton,
  SizeController: styled.div`
    ${switchCss}
  `,
  QualityController: styled.div`
    ${switchCss}
  `,
  Center,
  Input,
  InputWrap,
  Controller,
  Editor,
  Left,
  Right,
  ItemContainer,
  DisposeContainer,
  Grid,
}
export default UtakuStyle
