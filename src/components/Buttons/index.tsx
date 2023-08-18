import { css } from '@emotion/react'
import React from 'react'
import { buttonAssets, ButtonStyle } from './Buttons.styles'
import { ButtonTemplateProps } from './Buttons.types'

export const PrimaryButton = ({
  _css,
  _mini,
  ...props
}: ButtonTemplateProps) => {
  return (
    <ButtonStyle
      _css={css`
        ${buttonAssets({
          _mini,
          disabledType: 'fill',
          backgroundColor: 'Primary/Default',
          hoverBackgroundColor: 'Primary/Dark',
          textColor: 'White/White off',
        })}
        ${_css && _css}
      `}
      {...props}
    >
      {props.children}
    </ButtonStyle>
  )
}

export const SecondaryButton = ({
  _css,
  _mini,
  ...props
}: ButtonTemplateProps) => {
  return (
    <ButtonStyle
      _css={css`
        ${buttonAssets({
          _mini,
          disabledType: 'fill',
          backgroundColor: 'Secondary/Default',
          hoverBackgroundColor: 'Secondary/Dark',
          textColor: 'White/White off',
        })}

        ${_css && _css}
      `}
      {...props}
    >
      {props.children}
    </ButtonStyle>
  )
}
export const DangerButton = ({
  _css,
  _mini,
  ...props
}: ButtonTemplateProps) => {
  return (
    <ButtonStyle
      _css={css`
        ${buttonAssets({
          _mini,
          disabledType: 'fill',
          backgroundColor: 'Danger/Default',
          hoverBackgroundColor: 'Danger/Dark',
          textColor: 'White/White off',
        })}

        ${_css && _css}
      `}
      {...props}
    >
      {props.children}
    </ButtonStyle>
  )
}
export const WhiteFill = ({ _css, _mini, ...props }: ButtonTemplateProps) => {
  return (
    <ButtonStyle
      _css={css`
        ${buttonAssets({
          _mini,
          disabledType: 'fill',
          backgroundColor: 'White/White off',
          hoverBackgroundColor: 'White/White 50%',
          textColor: 'Grayscale/Gray Dark',
        })}

        ${_css && _css}
      `}
      {...props}
    >
      {props.children}
    </ButtonStyle>
  )
}
export const GrayScaleFill = ({
  _css,
  _mini,
  ...props
}: ButtonTemplateProps) => {
  return (
    <ButtonStyle
      _css={css`
        ${buttonAssets({
          _mini,
          disabledType: 'fill',
          backgroundColor: 'Grayscale/Gray Default',
          hoverBackgroundColor: 'Grayscale/Gray Dark',
          textColor: 'White/White off',
        })}

        ${_css && _css}
      `}
      {...props}
    >
      {props.children}
    </ButtonStyle>
  )
}
export const GrayScaleText = ({
  _css,
  _mini,
  ...props
}: ButtonTemplateProps) => {
  return (
    <ButtonStyle
      _css={css`
        ${buttonAssets({
          _mini,
          disabledType: 'text',
          hoverBackgroundColor: 'Grayscale/Background Dark',
          textColor: 'Grayscale/Gray Default',
          hoverTextColor: 'Grayscale/Gray Dark',
        })}
        ${_css && _css}
      `}
      {...props}
    >
      {props.children}
    </ButtonStyle>
  )
}

export const GrayScaleOutline = ({
  _css,
  _mini,
  _icon,
  ...props
}: ButtonTemplateProps) => {
  return (
    <ButtonStyle
      _css={css`
        ${_icon
          ? css`
              width: 40px;
              height: 40px;
            `
          : ''}
        ${buttonAssets({
          _mini,
          disabledType: _icon ? 'icon' : 'fill',
          borderColor: 'Grayscale/Gray Light',
          backgroundColor: 'White/White off',
          hoverBackgroundColor: 'Grayscale/Background Dark',
          textColor: 'Grayscale/Gray Dark',
        })}
        ${_css && _css}
      `}
      {...props}
    >
      {props.children}
    </ButtonStyle>
  )
}
