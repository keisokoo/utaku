import { produce } from 'immer'
import React from 'react'
import { UrlRemapItem } from '../../../atoms/settings'
import { lang } from '../../../utils'
import { GrayScaleOutline } from '../../Buttons'
import { PopupInputStyle } from '../../PopupInput.styled'
import { RemapStyle } from '../Remaps.styled'
import { getIndexByStepName } from '../Remaps.type'

const P = PopupInputStyle
const S = RemapStyle

interface EditReplaceProps {
  affix?: React.ReactNode
  remapItem: UrlRemapItem
  emitValue: (remap: UrlRemapItem) => void
}
const EditReplace = ({ affix, remapItem, emitValue }: EditReplaceProps) => {
  const remap = remapItem.item
  return (
    <>
      <S.Column>
        <S.PartLabel>
          {`${getIndexByStepName('replace') + 1}. `}
          {lang('change_add_text')}
          {affix}
        </S.PartLabel>
        <S.QueryBox>
          <GrayScaleOutline
            _mini
            onClick={() => {
              const clone = produce(remapItem, (draft) => {
                draft.item.replace.push({ from: '', to: '' })
              })
              emitValue(clone)
            }}
          >
            {lang('add')}
          </GrayScaleOutline>
          {remap.replace.map((item, idx) => {
            return (
              <S.InputWrap key={'replace' + idx} className="utaku-flex-center">
                <S.InputBox>
                  <label>
                    {idx + 1}. {lang('replace_url')}
                  </label>
                  <div>
                    <P.UnderlineInput
                      type="text"
                      style={{ width: '100%' }}
                      value={item.from}
                      onChange={(e) => {
                        const clone = produce(remapItem, (draft) => {
                          draft.item.replace[idx].from = e.target.value
                        })
                        emitValue(clone)
                      }}
                      placeholder="from"
                    />
                  </div>
                  <div>
                    <P.UnderlineInput
                      type="text"
                      style={{ width: '100%' }}
                      value={item.to}
                      onChange={(e) => {
                        const clone = produce(remapItem, (draft) => {
                          draft.item.replace[idx].to = e.target.value
                        })
                        emitValue(clone)
                      }}
                      placeholder="to"
                    />
                  </div>
                </S.InputBox>
              </S.InputWrap>
            )
          })}
        </S.QueryBox>
      </S.Column>
    </>
  )
}
export default EditReplace
