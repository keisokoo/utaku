import styled from '@emotion/styled'
import { colors } from '../../themes'

const TooltipStyle = {
  Wrap: styled.div`
    background-color: ${colors['Warning/Light']};
    color: ${colors['Grayscale/Gray Dark']} !important;
    transform: translateY(calc(100% + 6px));
    padding: 6px 12px;
    position: absolute;
    word-break: break-all;
    white-space: pre-line;
    font-size: 14px;
    font-weight: 500;
  `,
}

export default TooltipStyle
