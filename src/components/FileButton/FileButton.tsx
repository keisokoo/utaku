import { SerializedStyles, css } from '@emotion/react'
import styled from '@emotion/styled'
import React, { useRef } from 'react'
import { v4 } from 'uuid'
import { buttonAssets } from '../Buttons/Buttons.styles'
interface ButtonProps {
  $css: SerializedStyles
  _mini?: boolean
  _icon?: boolean
}
const ButtonStyle = styled.label(
  (props: ButtonProps) => css`
    border: none;
    cursor: pointer;
    user-select: none;
    display: flex;
    align-items: center;
    white-space: nowrap;
    justify-content: center;
    gap: 4px;
    ${props.$css && props.$css}
    ${props._icon &&
    css`
      padding: 8px;
      border-radius: 50%;
    `}
  `
)

interface FileButtonProps
  extends React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  > {
  $css?: SerializedStyles | string
  _mini?: boolean
  _icon?: boolean
  children?: React.ReactNode
}
const FileButton = ({
  $css,
  _mini,
  _icon,
  children,
  ...props
}: FileButtonProps) => {
  const id = useRef(v4())
  return (
    <>
      <input
        type="file"
        id={`file_${id.current}`}
        style={{ display: 'none' }}
        {...props}
      />
      <ButtonStyle
        htmlFor={`file_${id.current}`}
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
      >
        {children}
      </ButtonStyle>
    </>
  )
}
export default FileButton
