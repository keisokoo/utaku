import React from 'react'
import { lang } from '../../../utils'
import { PopupInputStyle } from '../../PopupInput.styled'
import { RemapStyle } from '../Remaps.styled'
import { getIndexByStepName } from '../Remaps.type'

const P = PopupInputStyle
const S = RemapStyle
interface MatchURLProps {
  host: string
  emitValue: (host: string) => void
}
const MatchURL = ({ host, emitValue }: MatchURLProps) => {
  return (
    <>
      <S.Column>
        <S.PartLabel>
          {`${getIndexByStepName('host') + 1}. `}
          {lang('edit_url_match')}
        </S.PartLabel>
        <P.UnderlineInput
          placeholder={lang('input_url_match')}
          type="text"
          value={host}
          onChange={(e) => {
            emitValue(e.target.value)
          }}
        />
      </S.Column>
    </>
  )
}
export default MatchURL
