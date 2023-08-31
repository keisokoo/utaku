import { css } from '@emotion/react'
import styled from '@emotion/styled'
import { colors } from '../../themes'

const urlBoxCss = css`
  color: #464646;
  background-color: #dcdcdc;
  padding: 8px 12px;
  word-break: break-all;
  width: 600px;
  border-radius: 8px;
  font-size: 12px;
  span.highlight {
    color: ${colors['Secondary/Dark']};
  }
`
export const RemapStyle = {
  Divider: styled.div`
    width: 100%;
    height: 1px;
    background-color: #ccc;
  `,
  InputWrap: styled.div`
    display: flex;
    align-items: flex-end;
    gap: 8px;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 8px;
    &.utaku-flex-center {
      align-items: center;
    }
  `,
  QueryBox: styled.div`
    position: relative;
    flex: 1;
    padding: 8px;
    border: 1px solid #ccc;
    display: flex;
    flex-direction: column;
    gap: 24px;
    border-radius: 4px;
  `,
  QueryStatus: styled.div`
    position: absolute;
    top: 0px;
    left: 0px;
    transform: translate(0, calc(-50% - 12px));
    & > div,
    label {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 4px 8px;
      gap: 4px;
      border-radius: 4px;
      background-color: #ffffff;
      color: #b7b7b7;
      font-size: 12px;
    }
    & > label {
      font-size: 14px;
      color: #333;
    }
  `,
  InputBox: styled.div`
    position: relative;
    flex: 1;
    input {
      width: 200px;
    }
    & > label {
      display: block;
      font-weight: 400;
      font-size: 14px;
      color: ${colors['Grayscale/Gray Default']};
      margin-bottom: 4px;
    }
  `,
  CurrentUrl: styled.textarea`
    ${urlBoxCss}
    min-height: 90px;
    border: none;
    outline: none;
  `,
  NextUrl: styled.div`
    ${urlBoxCss}
    background-color: #d6f7d5;
    span.highlight {
      color: ${colors['Secondary/Dark']};
    }
  `,
  PathName: styled.div`
    ${urlBoxCss}
    background-color: #d5f6f7;
    span.highlight {
      color: ${colors['Secondary/Default']};
    }
  `,
  PartLabel: styled.div`
    display: block;
    color: #494949;
    font-weight: 400;
    font-size: 18px;
    text-align: left;
    margin-bottom: 4px;
  `,
  EditorList: styled.div`
    display: flex;
    min-width: 500px;
    max-width: 600px;
    flex-direction: column;
    gap: 24px;
    color: ${colors['Grayscale/Gray Dark']};
  `,
  Column: styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
  `,
  SpaceBetween: styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  `,
  Chip: styled.button`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 4px 8px;
    gap: 4px;
    border-radius: 4px;
    background-color: #f0f0f0;
    color: #404040;
    font-size: 12px;
    cursor: pointer;
    user-select: none;
    &[data-active='true'] {
      background-color: #79c1ff;
    }
  `,
  Row: styled.div`
    label {
      font-size: 14px;
      background-color: #dbdbdb;
      color: #616161;
      padding: 4px 8px;
      border-radius: 8px;
    }
    color: ${colors['Grayscale/Gray Dark']};
    display: flex;
    align-items: center;
    gap: 8px;
  `,
  NameList: styled.div`
    min-width: 400px;
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
  ItemRow: styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 32px;
    padding: 8px;
    border-radius: 8px;
    border: 1px solid #b7b7b7;
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
  Chips: styled.div`
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
  `,
}
