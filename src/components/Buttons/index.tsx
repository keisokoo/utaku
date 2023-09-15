import { css } from '@emotion/react'
import React from 'react'
import { buttonAssets, ButtonStyle } from './Buttons.styles'
import { ButtonTemplateProps } from './Buttons.types'

export const PrimaryButton = ({
  $css,
  _mini,
  ...props
}: ButtonTemplateProps) => {
  return (
    <ButtonStyle
      $css={css`
        ${buttonAssets({
          _mini,
          disabledType: 'fill',
          backgroundColor: 'Primary/Default',
          hoverBackgroundColor: 'Primary/Dark',
          textColor: 'White/White off',
        })}
        ${$css && $css}
      `}
      {...props}
    >
      {props.children}
    </ButtonStyle>
  )
}

export const SecondaryButton = ({
  $css,
  _mini,
  ...props
}: ButtonTemplateProps) => {
  return (
    <ButtonStyle
      $css={css`
        ${buttonAssets({
          _mini,
          disabledType: 'fill',
          backgroundColor: 'Secondary/Default',
          hoverBackgroundColor: 'Secondary/Dark',
          textColor: 'White/White off',
        })}

        ${$css && $css}
      `}
      {...props}
    >
      {props.children}
    </ButtonStyle>
  )
}
export const DangerButton = ({
  $css,
  _mini,
  ...props
}: ButtonTemplateProps) => {
  return (
    <ButtonStyle
      $css={css`
        ${buttonAssets({
          _mini,
          disabledType: 'fill',
          backgroundColor: 'Danger/Default',
          hoverBackgroundColor: 'Danger/Dark',
          textColor: 'White/White off',
        })}

        ${$css && $css}
      `}
      {...props}
    >
      {props.children}
    </ButtonStyle>
  )
}
export const WhiteFill = ({ $css, _mini, ...props }: ButtonTemplateProps) => {
  return (
    <ButtonStyle
      $css={css`
        ${buttonAssets({
          _mini,
          disabledType: 'fill',
          backgroundColor: 'White/White off',
          hoverBackgroundColor: 'White/White 50%',
          textColor: 'Grayscale/Gray Dark',
        })}

        ${$css && $css}
      `}
      {...props}
    >
      {props.children}
    </ButtonStyle>
  )
}
export const GrayScaleFill = ({
  $css,
  _mini,
  ...props
}: ButtonTemplateProps) => {
  return (
    <ButtonStyle
      $css={css`
        ${buttonAssets({
          _mini,
          disabledType: 'fill',
          backgroundColor: 'Grayscale/Gray Default',
          hoverBackgroundColor: 'Grayscale/Gray Dark',
          textColor: 'White/White off',
        })}

        ${$css && $css}
      `}
      {...props}
    >
      {props.children}
    </ButtonStyle>
  )
}
export const GrayScaleText = ({
  $css,
  _mini,
  ...props
}: ButtonTemplateProps) => {
  return (
    <ButtonStyle
      $css={css`
        ${buttonAssets({
          _mini,
          disabledType: 'text',
          hoverBackgroundColor: 'Grayscale/Background Dark',
          textColor: 'Grayscale/Gray Default',
          hoverTextColor: 'Grayscale/Gray Dark',
        })}
        ${$css && $css}
      `}
      {...props}
    >
      {props.children}
    </ButtonStyle>
  )
}

export const GrayScaleOutline = ({
  $css,
  _mini,
  _icon,
  ...props
}: ButtonTemplateProps) => {
  return (
    <ButtonStyle
      $css={css`
        ${buttonAssets({
          _mini,
          disabledType: _icon ? 'icon' : 'fill',
          borderColor: 'Grayscale/Gray Light',
          backgroundColor: 'White/White off',
          hoverTextColor: 'White/White off',
          hoverBackgroundColor: 'Grayscale/Background Dark',
          textColor: 'Grayscale/Gray Dark',
        })}

        ${$css && $css}
      `}
      {...props}
    >
      {props.children}
    </ButtonStyle>
  )
}
