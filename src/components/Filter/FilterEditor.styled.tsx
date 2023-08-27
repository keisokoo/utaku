import styled from '@emotion/styled'

export const FilterStyle = {
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
