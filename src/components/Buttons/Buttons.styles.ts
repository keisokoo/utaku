import { SerializedStyles, css } from '@emotion/react'
import styled from '@emotion/styled'
import { colors, typography } from '../../themes'
import { ButtonProps, ColorOption } from './Buttons.types'

type AdditionalCss = SerializedStyles | string
export const buttonAssets = (color: ColorOption, _css?: AdditionalCss) => css`
  color: #ffffff;
  ${color._mini ? typography['Body/Small/Bold'] : typography['Body/Large/Bold']}
  ${color._mini ? `padding:  4px 12px;` : `padding:6px 18px;`}
  ${color._mini ? `border-radius: 8px;` : `border-radius: 12px;`}
  ${color.textColor ? `color: ${colors[color.textColor]};` : ''}
  ${color.iconColor
    ? css`path{
    fill ${colors[color.iconColor]};
  }`
    : ''}
  ${color.backgroundColor
    ? `background-color: ${colors[color.backgroundColor]};`
    : ''}
${color.borderColor
    ? `box-shadow: inset 0px 0px 0px 1px ${colors[color.borderColor]};`
    : ''}
transition: 0.3s ease-in-out;
  &:hover {
    ${color.hoverTextColor ? `color: ${colors[color.hoverTextColor]};` : ''}
    ${color.hoverIconColor
    ? css`path{
    fill ${colors[color.hoverIconColor]};
  }`
    : ''}
    ${color.hoverBackgroundColor
    ? `background-color: ${colors[color.hoverBackgroundColor]};`
    : ''}
${color.hoverBorderColor
    ? `box-shadow: inset 0px 0px 0px 1px ${colors[color.hoverBorderColor]};`
    : ''}
  }
  &:disabled {
    background-color: ${colors['White/White 10%']};
    color: ${colors['Grayscale/Gray Light']};
    box-shadow: none;
    cursor: default;
  }
  ${_css ? _css : ''}
`

export const ButtonStyle = styled.button(
  (props: ButtonProps) => css`
    border: none;
    cursor: pointer;
    user-select: none;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    ${props._css && props._css}
    ${props._icon && css`
      padding: 8px;
      border-radius: 50%;
    `}
  `
)
export const CSVDownloadButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${colors['Success/Default']};
  transition: 0.3s;
  &:hover {
    background-color: ${colors['Success/Dark']};
  }
  &:disabled {
    background-color: ${colors['Grayscale/Gray Lighter']};
  }
`
