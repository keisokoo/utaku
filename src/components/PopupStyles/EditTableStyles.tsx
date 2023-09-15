import styled from '@emotion/styled'

export const EditTableStyles = {
  List: styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
  `,
  ListItem: styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    & > label {
      width: 80px;
      display: flex;
      align-items: center;
      padding: 4px 8px 8px;
      gap: 4px;
      font-size: 14px;
      color: #333;
    }
    & > div {
      flex: 1;
      padding: 8px;
      display: flex;
      align-items: center;
      gap: 16px;
      & > input {
        flex: 1;
      }
    }
  `,
}
