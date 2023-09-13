import styled from '@emotion/styled'
import classNames from 'classnames'
import React from 'react'
import { lang } from '../../utils'
import { GrayScaleOutline } from '../Buttons'

const ModalBodyWrap = styled.div`
  color: #333;
  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 16px 8px;
    .modal-btn {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 8px;
    }
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
    overflow-x: hidden;
    &.fixed {
      height: calc(100vh - 64px - 60px);
      max-height: 800px;
    }
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
  fixed?: boolean
  title?: string
  btn?: React.ReactNode
  onClose?: () => void
}
const ModalBody = ({
  fixed,
  btn,
  onClose,
  children,
  title,
  ...props
}: ModalBodyProps) => {
  return (
    <>
      <ModalBodyWrap>
        <div className="modal-header" {...props}>
          <div className="modal-title">{title}</div>
          <div className="modal-btn">
            {btn}
            <GrayScaleOutline _mini className="close" onClick={onClose}>
              {lang('close')}
            </GrayScaleOutline>
          </div>
        </div>
        <div className={classNames({ fixed }, 'modal-body')}>{children}</div>
      </ModalBodyWrap>
    </>
  )
}
export default ModalBody
