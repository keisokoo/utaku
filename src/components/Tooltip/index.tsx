import React from 'react'
import TooltipStyle from './Tooltip.styles'
import { TooltipProps } from './Tooltip.types'

const Tooltip = ({ children, ...props }: TooltipProps) => {
  return (
    <>
      {children && <TooltipStyle.Wrap {...props}>{children}</TooltipStyle.Wrap>}
    </>
  )
}
export default Tooltip
