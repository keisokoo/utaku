import styled from '@emotion/styled'
import { colors, typography } from '../../themes'

const TooltipStyle = {
  Wrap: styled.div`
    background-color: ${colors['Warning/Light']};
    ${typography['Body/Caption/Bold']}
    color: ${colors['Grayscale/Gray Dark']};
    transform: translateY(calc(100% + 6px));
    padding: 6px 12px;
    position: absolute;
    word-break: break-all;
  `,
}

export default TooltipStyle
