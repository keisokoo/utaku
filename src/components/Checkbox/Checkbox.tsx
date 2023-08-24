import styled from '@emotion/styled/macro'
import classNames from 'classnames'
import React from 'react'
import { BsFillCheckCircleFill, BsFillCircleFill } from 'react-icons/bs'
import { colors } from '../../themes'

const CheckboxWrap = styled.div<{ active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  .checkbox-icon {
    font-size: 16px;
    color: ${colors['Grayscale/Gray Lighter']};
    cursor: pointer;
  }
  &.active {
    .checkbox-icon {
      color: ${colors['Primary/Default']};
    }
  }
`

interface CheckboxProps extends React.HTMLAttributes<HTMLDivElement> {
  active?: boolean
}

const Checkbox = ({ ...props }: CheckboxProps) => {
  return (
    <>
      <CheckboxWrap className={classNames({ active: props.active })} {...props}>
        <div className="checkbox-icon">
          {props.active ? <BsFillCheckCircleFill /> : <BsFillCircleFill />}
        </div>
        {props.children && <div>{props.children}</div>}
      </CheckboxWrap>
    </>
  )
}
export default Checkbox
