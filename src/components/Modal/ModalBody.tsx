import styled from '@emotion/styled/macro'
import React from 'react'
import { lang } from '../../utils'
import { GrayScaleOutline } from '../Buttons'

const ModalBodyWrap = styled.div`
  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 16px 8px;
  }
  .modal-title {
    font-size: 16px;
    font-weight: 700;
    color: #000;
    text-transform: capitalize;
  }
  .modal-body {
    padding: 8px 16px 32px;
    max-height: calc(100vh - 64px - 60px);
    overflow-y: auto;
  }
  max-height: 100vh;
  border-radius: 8px;
  min-width: 320px;
  box-shadow: 0 0 8px 0 rgb(0 0 0 / 10%);
`

interface ModalBodyProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {
  title?: string
  onClose?: () => void
}
const ModalBody = ({ onClose, children, title, ...props }: ModalBodyProps) => {
  return (
    <>
      <ModalBodyWrap>
        <div className="modal-header" {...props}>
          <div className="modal-title">{title}</div>
          <GrayScaleOutline className="close" onClick={onClose}>
            {lang('close')}
          </GrayScaleOutline>
        </div>
        <div className="modal-body">{children}</div>
      </ModalBodyWrap>
    </>
  )
}
export default ModalBody
