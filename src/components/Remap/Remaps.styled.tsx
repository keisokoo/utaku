import { css } from '@emotion/react'
import styled from '@emotion/styled'
import { colors } from '../../themes'

const urlBoxCss = css`
  color: #464646;
  background-color: #dcdcdc;
  padding: 8px 12px;
  word-break: break-all;
  width: 100%;
  max-width: 100%;
  border-radius: 8px;
  font-size: 12px;
  span.highlight {
    color: ${colors['Secondary/Dark']};
  }
`
const QueryResult = styled.div`
  display: none;
  flex-direction: column;
  gap: 4px;
  position: absolute;
  width: 100%;
  top: 0;
  transform: translateY(calc(-100% - 16px));
  background: #fff;
  padding: 8px;
  border-radius: 8px;
  box-shadow: 0px 2px 8px 1px #afafaf;
  & > div {
    font-size: 14px;
    color: #333;
    display: flex;
    align-items: flex-start;
    gap: 8px;
    & > label,
    & > div {
      padding: 8px;
    }
    & > label {
      padding: 8px;
      width: 80px;
      flex-shrink: 0;
    }
    & > div {
      background-color: #d5f6f7;
      color: #0147a4;
      border-radius: 4px;
      flex: 1;
    }
    &.after {
      & > div {
        background-color: #d6f8d6;
        color: #006b05;
      }
    }
  }
`
export const RemapStyle = {
  EditorWrap: styled.div`
    display: flex;
    flex-direction: column;
    gap: 0;
    width: 800px;
    max-width: calc(100vw - 120px);
    & > div {
      &:first-of-type {
        flex: 1;
        overflow-y: auto;
        overflow-x: hidden;
      }
      &:last-of-type {
        flex-shrink: 0;
      }
    }
  `,
  Guidance: styled.div`
    &.edit {
      display: none;
    }
    display: flex;
    align-items: center;
    gap: 8px;
    div {
      flex: 1;
    }
    white-space: pre-line;
    font-size: 14px;
    color: #4e4e4e;
    padding: 8px;
    border-radius: 8px;
    background-color: #eeecec;
    line-height: 1.4;
  `,
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
    &:hover {
      .query-result {
        display: flex;
      }
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
    html body .utaku-css & {
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
    }
  `,
  QueryResult,
  InputBox: styled.div`
    html body .utaku-css & {
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
    }
  `,
  CurrentUrl: styled.textarea`
    html body .utaku-css & {
      ${urlBoxCss}
      min-height: 90px;
      border: none;
      outline: none;
    }
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
  ErrorText: styled.div`
    color: #a90b0b;
    font-size: 12px;
  `,
  PartLabel: styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: #494949;
    font-weight: 400;
    font-size: 18px;
    text-align: left;
    margin-bottom: 4px;
  `,
  QueryKey: styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: #333;
  `,
  EditorList: styled.div`
    display: flex;
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
    border: none;
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
  LiveStatus: styled.div`
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    font-size: 12px;
    color: #333;
    border-radius: 16px;
    padding: 6px 12px;
    background-color: #f1f1f1;
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
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 16px;
  `,
  ButtonList: styled.div`
    display: flex;
    justify-content: space-between;
    gap: 8px;
    & > div {
      display: flex;
      align-items: center;
      gap: 8px;
    }
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
