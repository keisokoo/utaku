import styled from '@emotion/styled'
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
  &[data-utaku-active='true'] {
    color: ${colors['Primary/Default']};
  }
`

interface CheckboxProps extends React.HTMLAttributes<HTMLDivElement> {
  active?: boolean
}

const Checkbox = ({ ...props }: CheckboxProps) => {
  return (
    <>
      <CheckboxWrap data-utaku-active={props.active} {...props}>
        <CheckboxIcon data-utaku-active={props.active}>
          {props.active ? <BsFillCheckCircleFill /> : <BsFillCircleFill />}
        </CheckboxIcon>
        {props.children && <div data-utaku-label={''}>{props.children}</div>}
      </CheckboxWrap>
    </>
  )
}
export default Checkbox
