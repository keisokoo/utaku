import React from 'react'
import { lang } from '../../../utils'
import { PopupInputStyle } from '../../PopupInput.styled'
import { RemapStyle } from '../Remaps.styled'
import { getIndexByStepName } from '../Remaps.type'

const P = PopupInputStyle
const S = RemapStyle

interface RemapNameProps {
  name: string
  emitValue: (remap: string) => void
}
const RemapName = ({ name, emitValue }: RemapNameProps) => {
  return (
    <>
      <S.Column>
        <S.PartLabel>
          {`${getIndexByStepName('name') + 1}. `}
          {lang('edit_remap_name')}
        </S.PartLabel>
        <P.UnderlineInput
          placeholder={lang('input_remap_name')}
          type="text"
          value={name}
          onChange={(e) => {
            emitValue(e.target.value)
          }}
        />
      </S.Column>
    </>
  )
}
export default RemapName
