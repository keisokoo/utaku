import { css } from '@emotion/react'
import styled from '@emotion/styled'
import { colors } from '../../themes'
const urlBoxCss = css`
  color: #464646;
  background-color: #dcdcdc;
  padding: 8px 12px;
  max-width: 400px;
  word-break: break-all;
  border-radius: 8px;
  font-size: 12px;
  span.highlight {
    color: ${colors['Secondary/Dark']};
  }
`
const UrlEditorStyles = {
  PartLabel: styled.div`
    display: block;
    color: #494949;
    font-weight: 400;
    font-size: 18px;
    text-align: left;
    margin-bottom: 4px;
  `,
  Wrapper: styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
    color: ${colors['Grayscale/Gray Dark']};
    input {
      width: 100%;
    }
  `,
  Column: styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
  `,
  FilteredUrl: styled.div``,
  CurrentUrl: styled.div`
    ${urlBoxCss}
  `,
  NextUrl: styled.div`
    ${urlBoxCss}
    background-color: #d6f7d5;
    span.highlight {
      color: ${colors['Secondary/Dark']};
    }
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
  InputBox: styled.div`
    flex: 1;
    input {
      width: 100%;
    }
    & > label {
      font-weight: 400;
      font-size: 14px;
      color: ${colors['Grayscale/Gray Default']};
    }
  `,
  Row: styled.div`
    label {
      font-size: 14px;
      background-color: #dbdbdb;
      color: #000;
      padding: 4px 8px;
      border-radius: 8px;
    }
    color: ${colors['Grayscale/Gray Dark']};
    display: flex;
    align-items: center;
    gap: 8px;
  `,
  QueryBox: styled.div``,
  QueryColumn: styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
  `,
  ReplaceBox: styled.div``,
}
export default UrlEditorStyles
