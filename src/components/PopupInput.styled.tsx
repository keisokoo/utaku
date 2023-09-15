import styled from '@emotion/styled'
import { colors } from '../themes'

export const PopupInputStyle = {
  UnderlineInput: styled.input`
    html body .utaku-css & {
      appearance: none;
      color: ${colors['Grayscale/Gray Dark']};
      border: none;
      outline: none;
      border-bottom: 1px solid #ccc;
      padding: 8px 0;
      transition: 0.15s;
      background-color: transparent;
      font-size: 14px;
      &:focus {
        text-indent: 4px;
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
    }
  `,
  FilledInput: styled.input`
    html body .utaku-css & {
      appearance: none;
      color: ${colors['Grayscale/Gray Dark']};
      border: none;
      outline: none;
      border-radius: 4px;
      padding: 8px 12px;
      transition: 0.15s;
      background-color: ${colors['Grayscale/Background Light']};
      font-size: 14px;
      &:focus {
        background-color: #f1f1f1;
      }
      &::placeholder {
        color: ${colors['Grayscale/Gray Light']};
      }
      &:disabled {
        background-color: transparent;
        color: ${colors['Grayscale/Gray Light']};
        border-bottom: none;
      }
    }
  `,
}
