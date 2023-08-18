import { css } from '@emotion/react'
import styled from '@emotion/styled'
import { colors } from '../../themes'
const Ellipsis = css`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`
const PopupStyle = {
  Wrap: styled.div`
    padding: 32px 24px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  `,
  Item: styled.div`
    padding: 8px 16px;
    background-color: rgb(78 78 78 / 30%);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    &.active {
      background-color: rgb(78 78 78 / 70%);
    }
    button {
      cursor: pointer;
      user-select: none;
    }
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
}
export default PopupStyle
