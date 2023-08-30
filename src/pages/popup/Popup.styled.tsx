import { css, keyframes } from '@emotion/react'
import styled from '@emotion/styled'
import { colors } from '../../themes'
const Ellipsis = css`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`
const pulse = keyframes`
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(0, 174, 35, 0.7);
  }
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 10px rgba(0, 174, 35, 0);
  }
`
const pulseCss = css`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: #ed2700;
  display: flex;
  cursor: pointer;
  align-items: center;
  justify-content: center;
`
const PopupStyle = {
  Circle: styled.div`
    ${pulseCss}
  `,
  CircleActive: styled.div`
    ${pulseCss}
    animation: ${pulse} 3s infinite;
    background-color: rgb(0, 174, 35);
  `,
  Container: styled.div`
    width: 100%;
    height: 100%;
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 0px;
  `,
  Wrap: styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
  `,
  Nothing: styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    white-space: pre-line;
    width: 100%;
    height: 100%;
    text-align: center;
  `,
  Top: styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 32px;
    padding: 24px 32px;
    & > div {
      font-size: 14px;
      color: ${colors['Grayscale/Gray Light']};
      text-align: right;
      flex: 1;
    }
  `,
  TopRight: styled.div`
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
  `,
  Body: styled.div`
    padding: 8px 32px;
    overflow-y: auto;
    overscroll-behavior-y: contain;
    flex: 1;
    background-color: #202020;
  `,
  Bottom: styled.div`
    padding: 24px 32px;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  `,
  BottomButtons: styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
  `,
  BottomDescription: styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: ${colors['Primary/Light']};
    margin-left: 8px;
  `,
  ColumnWrap: styled.div`
    display: flex;
    flex-direction: column;
    gap: 0px;
    background-color: rgb(78 78 78 / 30%);
    &.active {
      background-color: rgb(78 78 78 / 70%);
    }
  `,
  InfoWrap: styled.div`
    padding: 8px 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    border-top: 1px solid ${colors['White/White 30%']};
    button {
      cursor: pointer;
      user-select: none;
    }
  `,
  Info: styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px 16px;
  `,
  List: styled.div`
    padding: 8px 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    button {
      cursor: pointer;
      user-select: none;
    }
  `,
  Item: styled.div`
    padding: 8px 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    button {
      cursor: pointer;
      user-select: none;
    }
  `,
  ColumnList: styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 8px;
    max-height: 500px;
    overflow-y: auto;
  `,
  Row: styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    &.right {
      justify-content: flex-end;
    }
    .title {
      width: 200px;
      ${Ellipsis}
    }
    .url {
      max-width: 250px;
      ${Ellipsis}
    }
    .id {
      ${colors['Danger/Light']}
    }
  `,
  InnerRow: styled.div`
    width: 100%;
    display: flex;
    align-items: flex-start;
    gap: 8px;
    background: #ffffff0f;
    padding: 8px;
    border-radius: 8px;
    .url-details {
      flex: 1;
      word-break: break-all;
    }
  `,
  SpanRow: styled.span`
    display: flex;
    align-items: center;
    gap: 4px;
  `,
}
export default PopupStyle
