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
  Column: styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 8px;
    flex-direction: column-reverse;
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
