import styled from '@emotion/styled'
import { colors } from '../../themes'

export const PopupInputStyle = {
  UnderlineInput: styled.input`
    appearance: none;
    color: ${colors['Grayscale/Gray Dark']};
    border: none;
    outline: none;
    border-bottom: 1px solid #ccc;
    padding: 8px 0;
    transition: 0.15s;
    &:focus {
      padding: 8px 4px;
      background-color: ${colors['Grayscale/Background Light']};
    }
    &::placeholder {
      color: ${colors['Grayscale/Gray Light']};
    }
    &:disabled {
      background-color: transparent;
      color: ${colors['Grayscale/Gray Light']};
      border-bottom: none;
    }
  `,
}
