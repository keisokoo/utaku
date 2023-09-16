import React from 'react'
import { FaQuestionCircle } from 'react-icons/fa'
import { ListTableStyle } from '../PopupStyles/ListTableStyle'

const L = ListTableStyle
interface ExtraRowItemProps {
  label: string
  content: string | JSX.Element
  tooltip?: string
  handleTooltip?: (tooltip: string | null) => void
}
const ExtraRowItem = ({
  label,
  content,
  tooltip,
  handleTooltip,
}: ExtraRowItemProps) => {
  return (
    <L.FlexRow>
      <L.FlexItem>
        <label>{label}</label>
        <L.DotLine />
        <div>
          {content}
          <FaQuestionCircle
            {...(tooltip &&
              handleTooltip && {
                onMouseEnter: () => {
                  handleTooltip(tooltip)
                },
                onMouseLeave: () => {
                  handleTooltip(null)
                },
              })}
          />
        </div>
      </L.FlexItem>
    </L.FlexRow>
  )
}
export default ExtraRowItem
