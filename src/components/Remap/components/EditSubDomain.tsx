import React from 'react'
import { lang } from '../../../utils'
import { PopupInputStyle } from '../../PopupInput.styled'
import { RemapStyle } from '../Remaps.styled'
import { getIndexByStepName } from '../Remaps.type'

const P = PopupInputStyle
const S = RemapStyle
interface EditSubDomainProps {
  sub_domain: string
  emitValue: (sub_domain: string) => void
}
const EditSubDomain = ({ sub_domain, emitValue }: EditSubDomainProps) => {
  return (
    <>
      <S.Column>
        <S.PartLabel>
          {`${getIndexByStepName('sub_domain') + 1}. `}
          {lang('edit_sub_domain')}
        </S.PartLabel>
        <P.UnderlineInput
          placeholder={lang('input_sub_domain')}
          type="text"
          value={sub_domain}
          onChange={(e) => {
            emitValue(e.target.value)
          }}
        />
      </S.Column>
    </>
  )
}
export default EditSubDomain
