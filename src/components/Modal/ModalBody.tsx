import { SerializedStyles } from '@emotion/react'
import styled from '@emotion/styled'
import React from 'react'
import { FaTimes } from 'react-icons/fa'
import { lang } from '../../utils'
import { GrayScaleOutline } from '../Buttons'

const ModalBodyWrap = styled.div`
  color: #333;
  max-width: calc(100vw - 128px);
  [data-utaku-modal-header] {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 16px 8px;
    [data-utaku-modal-btn] {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 8px;
    }
  }
  [data-utaku-modal-title] {
    font-size: 16px;
    font-weight: 700;
    color: #000;
    text-transform: capitalize;
  }
  [data-utaku-modal-body] {
    padding: 8px 16px 32px;
    max-height: calc(100vh - 64px - 60px);
    overflow-y: auto;
    overflow-x: hidden;
    &[utaku-fixed='true'] {
      height: calc(100vh - 64px - 60px);
      max-height: 800px;
    }
  }
  max-height: 100vh;
  border-radius: 8px;
  min-width: 320px;
  box-shadow: 0 0 8px 0 rgb(0 0 0 / 10%);
  ${(props: ModalBodyProps) => props.$css}
`

interface ModalBodyProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {
  $css?: SerializedStyles | string
  fixed?: boolean
  title?: string
  btn?: React.ReactNode
  removeClose?: boolean
  onClose?: () => void
}
const ModalBody = ({
  fixed,
  btn,
  removeClose,
  onClose,
  children,
  title,
  $css,
  ...props
}: ModalBodyProps) => {
  return (
    <>
      <ModalBodyWrap $css={$css} {...props}>
        <div data-utaku-modal-header={''}>
          <div data-utaku-modal-title={''}>{title}</div>
          <div data-utaku-modal-btn={''}>
            {btn}
            {!removeClose && (
              <GrayScaleOutline _mini onClick={onClose}>
                <FaTimes />
                {lang('close')}
              </GrayScaleOutline>
            )}
          </div>
        </div>
        <div data-utaku-fixed={fixed} data-utaku-modal-body={''}>
          {children}
        </div>
      </ModalBodyWrap>
    </>
  )
}
export default ModalBody
