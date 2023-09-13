import { cloneDeep } from 'lodash-es'
import React from 'react'
import { UrlRemapItem } from '../../../atoms/settings'
import {
  extractDomain,
  extractSubDomain,
  isValidUrl,
  lang,
} from '../../../utils'
import { RemapStyle } from '../Remaps.styled'
import { getIndexByStepName } from '../Remaps.type'

const S = RemapStyle
interface URLReferenceProps {
  remapItem: UrlRemapItem
  emitValue: (remap: UrlRemapItem) => void
  mode: 'add' | 'edit'
}
const URLReference = ({ remapItem, mode, emitValue }: URLReferenceProps) => {
  const remap = remapItem.item
  return (
    <>
      <S.Column>
        <S.PartLabel>
          {`${getIndexByStepName('reference_url') + 1}. `}
          {lang('url_reference')}
          {mode === 'add' && !isValidUrl(remap.reference_url) && (
            <>
              <S.ErrorText>{lang('no_valid_reference_url')}</S.ErrorText>
            </>
          )}
        </S.PartLabel>
        <S.CurrentUrl
          value={remap.reference_url}
          onChange={(e) => {
            const clone = cloneDeep(remapItem)
            clone.item.reference_url = e.target.value
            if (extractDomain(e.target.value) && mode !== 'edit') {
              clone.item.host = new URL(e.target.value).host
              clone.item.domain = extractDomain(e.target.value)!
              clone.item.sub_domain = extractSubDomain(e.target.value) ?? ''
            }
            emitValue(clone)
          }}
          placeholder={lang('reference_url_description')}
        />
      </S.Column>
    </>
  )
}
export default URLReference
