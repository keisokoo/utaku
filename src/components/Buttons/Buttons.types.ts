import { SerializedStyles } from '@emotion/react'
import { colors } from '../../themes'

export type ColorKey = keyof typeof colors
export interface ButtonProps {
  $css: SerializedStyles
  _mini?: boolean
  _icon?: boolean
}
export interface ButtonTemplateProps
  extends React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > {
  $css?: SerializedStyles | string
  _mini?: boolean
  _icon?: boolean
}

export type DisabledType = 'fill' | 'text' | 'icon'
export interface ColorOption {
  iconColor?: ColorKey
  textColor?: ColorKey
  backgroundColor?: ColorKey
  hoverIconColor?: ColorKey
  hoverTextColor?: ColorKey
  hoverBackgroundColor?: ColorKey
  borderColor?: ColorKey
  hoverBorderColor?: ColorKey
  disabledType: DisabledType
  _mini?: boolean
}
