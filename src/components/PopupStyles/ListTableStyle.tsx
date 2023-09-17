import { css } from '@emotion/react'
import styled from '@emotion/styled'

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0px;
  padding: 8px;
  border-radius: 8px;
  * {
    box-sizing: border-box;
  }
`

const gridCss = css`
  width: 100%;
  display: grid;
  grid-auto-columns: 1fr;
  grid-template: 'A B C' / 50px auto 140px;
  gap: 16px;
  padding: 4px 8px;
  border: 1px solid transparent;
`
const gridRowCss = css`
  display: grid;
  grid-template-rows: 30px 1fr;
  grid-template-areas:
    'A B C'
    'D D D';
  grid-row-gap: 0px;
  grid-column-gap: 16px;
  border-radius: 16px;
  padding: 8px 8px;
  border: 1px solid #d1d1d1;
  background-color: #ffffff;
  &[data-disabled='true'] {
    background-color: #f5f5f5;
    color: #9b9b9b;
    button {
      opacity: 0.5;
    }
  }
`
const Grid = styled.div`
  ${gridCss}
  grid-template: 'A B C' / 50px auto 140px;
`
const SettingsGrid = styled.div`
  ${gridCss}
  grid-template: 'A B' / 80px auto;
`
const SettingsRow = styled.div`
  ${gridRowCss};
  grid-template: 'A B' / 80px auto;
  padding: 0;
  grid-column-gap: 4px;
  border: none;
`
const Row = styled.div`
  ${gridRowCss};
  grid-template-columns: 50px auto 140px;
`
const NotFound = styled.div`
  border-radius: 16px;
  padding: 32px 8px;
  border: 1px solid #d1d1d1;
  background-color: #f5f5f5;
  color: #9b9b9b;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
`
const SettingColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0px;
  &[data-utaku-grid-item='a'] {
    grid-area: A;
    padding: 8px 0 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-size: 12px;
    border-radius: 4px;
    border: 1px solid #d1d1d1;
    cursor: pointer;
    user-select: none;
    background-color: #ffebeb;
    transition: 0.15s;
    &[data-active='true'] {
      background-color: #d8ffe5;
    }
    &:hover {
      border-color: #616161;
    }
  }
  &[data-utaku-grid-item='b'] {
    user-select: none;
    grid-area: B;
    width: 100%;
    min-width: 200px;
    overflow: hidden;
    align-items: center;
    justify-content: center;
    padding: 12px;
    border-radius: 4px;
    border: 1px solid #d1d1d1;
    cursor: pointer;
    transition: 0.3s;
    &:hover {
      border-color: #616161;
    }
  }
`
const Column = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  &[data-utaku-grid-item='a'] {
    grid-area: A;
  }
  &[data-utaku-grid-item='b'] {
    grid-area: B;
    width: 100%;
    min-width: 200px;
    overflow: hidden;
    justify-content: center;
  }
  &[data-utaku-grid-item='c'] {
    grid-area: C;
  }
`
const SummaryBox = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
`
const CountBox = styled.div`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: flex-end;
`
const SummaryContent = styled.div`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
  font-size: 14px;
`
const Content = styled.div`
  grid-area: D;
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  display: none;
  &[data-active='true'] {
    display: flex;
  }
  label {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 4px 8px;
    gap: 4px;
    border-radius: 4px;
    background-color: #ffffff;
    color: #b7b7b7;
    font-size: 14px;
  }
`
const Buttons = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  flex: 1;
`
const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`
const Label = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px 8px 8px;
  gap: 4px;
  font-size: 14px;
  color: #333;
  border-bottom: 1px solid #cecece;
  margin-bottom: 8px;
`
const FlexRow = styled.div`
  padding: 4px 0px;
  width: 100%;
`
const FlexTitle = styled.div`
  html body .utaku-css & {
    padding: 4px 8px;
    margin-top: 16px;
    h1 {
      font-size: 14px;
      font-weight: 700;
      line-height: 1;
      margin: 0px;
      padding: 0px;
    }
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
`
const DotLine = styled.div`
  width: 100%;
  flex: 1;
  height: 1px;
  display: flex;
  align-items: center;
  justify-content: center;
  &::before {
    content: '';
    width: 100%;
    height: 1px;
    border-bottom: 1px dashed #cecece;
    position: relative;
    top: -1px;
  }
`
const FlexItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
  & > label {
    display: flex;
    align-items: center;
    padding: 4px 8px 8px;
    gap: 4px;
    font-size: 14px;
    color: #333;
  }
  & > div {
    padding: 8px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }
`
const StatusBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  flex: 1;
  &.clickable {
    cursor: pointer;
  }
`
const Center = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`
const Bottom = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16px;
  & > div {
    display: flex;
    align-items: center;
    gap: 8px;
  }
`
const BodyWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`
export const ListTableStyle = {
  SettingsGrid,
  SettingsRow,
  List,
  SummaryBox,
  SummaryContent,
  Content,
  Buttons,
  Row,
  Wrap,
  StatusBox,
  Label,
  Grid,
  SettingColumn,
  Column,
  NotFound,
  Bottom,
  FlexRow,
  FlexItem,
  FlexTitle,
  DotLine,
  Center,
  CountBox,
  BodyWrap,
}
