import styled from '@emotion/styled'
import React from 'react'

const ToggleWrap = styled.div`
  width: 40px;
  height: 20px;
  border-radius: 10px;
  background-color: #ccc;
  position: relative;
  cursor: pointer;
  &::after {
    content: '';
    position: absolute;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background-color: #fff;
    top: 2px;
    left: 2px;
    transition: 0.2s;
  }
  &[data-active='true'] {
    background-color: #00b333;
    &::after {
      left: calc(100% - 18px);
    }
  }
`

interface ToggleProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {
  active?: boolean
}
const Toggle = ({ active, ...props }: ToggleProps) => {
  return (
    <>
      <ToggleWrap data-active={active} {...props} />
    </>
  )
}
export default Toggle
