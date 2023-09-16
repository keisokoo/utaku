import { css } from '@emotion/react'
import styled from '@emotion/styled'

const SettingsWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 4px 8px;
  border-radius: 8px;
  border: 1px solid #e1e1e1;
`
const EditItemColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  position: relative;
`
const ListItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px;
  border-radius: 8px;
  border: 1px solid #939393;
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
`
const PopupInputWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const LimitAreaWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`
export const questionCss = {
  $css: css`
    height: 26px;
    width: 26px;
    padding: 0px;
    border-radius: 50%;
    font-size: 12px;
  `,
}
export const questionMiniCss = {
  $css: css`
    height: 20px;
    width: 20px;
    padding: 0px;
    border-radius: 50%;
    font-size: 12px;
  `,
}
const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow-y: auto;
  height: 400px;
  overflow-x: hidden;
  overscroll-behavior-y: contain;
`
const BottomWrap = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: 12px;
  & > div {
    display: flex;
    align-items: center;
    gap: 8px;
  }
`
const Buttons = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`
const SelectorItem = styled.div`
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 14px;
  color: #939393;
  padding: 4px 8px;
`
const NoticeContents = styled.div`
  padding: 32px;
  white-space: pre-line;
  font-size: 14px;
  line-height: 1;
  color: #434343;
  text-align: center;
  background-color: #fff;
`
const NoticeBottom = styled.div`
  html body .utaku-css & {
    margin-top: 16px;
    display: flex;
    align-items: center;
    justify-content: end;
    gap: 8px;
    & > button {
      &:first-of-type {
        width: 100px;
      }
      &:last-of-type {
        width: 160px;
      }
    }
  }
`
export const PopupStyles = {
  NoticeBottom,
  NoticeContents,
  BottomWrap,
  SettingsWrap,
  ListItem,
  PopupInputWrap,
  LimitAreaWrap,
  List,
  Buttons,
  SelectorItem,
  EditItemColumn,
}
