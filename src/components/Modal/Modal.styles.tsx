import { SerializedStyles, css } from '@emotion/react'
import styled from '@emotion/styled'
import { colors } from '../../themes'

const ModalStyle = {
  Container: styled.div(
    ({ _css }: { _css?: SerializedStyles | string }) => css`
      position: fixed;
      width: 100%;
      height: 100%;
      z-index: 214748364;
      display: flex;
      align-items: center;
      justify-content: center;
      top: 0;
      left: 0;
      &[data-utaku-hide='true'] {
        display: none;
      }
      ${typeof _css === 'string' ? css(_css) : _css ? _css : css``}
    `
  ),
  Wrap: styled.div(
    ({ _css }: { _css?: SerializedStyles | string }) => css`
      position: relative;
      z-index: 11;
      background: #ffffff;
      border-radius: 20px;
      outline: none;
      ${typeof _css === 'string' ? css(_css) : _css ? _css : css``}
    `
  ),
  Background: styled.div`
    z-index: 10;
    background-color: ${colors['ETC/Dim']};
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    height: 100%;
  `,
}
export default ModalStyle
