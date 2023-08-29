import styled from '@emotion/styled'
import classNames from 'classnames'
import React from 'react'
import { BsFillCheckCircleFill, BsFillCircleFill } from 'react-icons/bs'
import { colors } from '../../themes'

const CheckboxWrap = styled.div<{ active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
`
const CheckboxIcon = styled.div`
  font-size: 16px;
  color: ${colors['Grayscale/Gray Lighter']};
  cursor: pointer;
  display: flex;
  align-items: center;
  &.active {
    color: ${colors['Primary/Default']};
  }
`

interface CheckboxProps extends React.HTMLAttributes<HTMLDivElement> {
  active?: boolean
}

const Checkbox = ({ ...props }: CheckboxProps) => {
  return (
    <>
      <CheckboxWrap className={classNames({ active: props.active })} {...props}>
        <CheckboxIcon
          className={classNames({ active: props.active }, 'checkbox-icon')}
        >
          {props.active ? <BsFillCheckCircleFill /> : <BsFillCircleFill />}
        </CheckboxIcon>
        {props.children && (
          <div className="checkbox-label">{props.children}</div>
        )}
      </CheckboxWrap>
    </>
  )
}
export default Checkbox
