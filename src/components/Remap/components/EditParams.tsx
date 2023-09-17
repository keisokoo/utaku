import { produce } from 'immer'
import React, { useMemo, useState } from 'react'
import { UrlRemapItem } from '../../../atoms/settings'
import { isValidUrl, lang, urlToRemapItem } from '../../../utils'
import { GrayScaleFill } from '../../Buttons'
import { PopupInputStyle } from '../../PopupInput.styled'
import { RemapStyle } from '../Remaps.styled'
import { getIndexByStepName } from '../Remaps.type'

const P = PopupInputStyle
const S = RemapStyle

interface EditParamsProps {
  remapItem: UrlRemapItem
  emitValue: (remap: UrlRemapItem) => void
}
const EditParams = ({ remapItem, emitValue }: EditParamsProps) => {
  const [query, set_query] = useState<string>('')
  const remap = remapItem.item
  const referrer = useMemo(() => {
    if (!remapItem?.item?.reference_url) return null
    if (!isValidUrl(remapItem?.item?.reference_url)) return null
    return new URL(remapItem.item.reference_url)
  }, [remapItem.item])
  const referrerParams = useMemo(() => {
    if (!referrer) return null
    return urlToRemapItem(referrer.toString()).item.params
  }, [referrer])
  return (
    <>
      <S.Column>
        <S.PartLabel>
          {`${getIndexByStepName('params') + 1}. `}
          {lang('edit_query')}
        </S.PartLabel>
        <S.QueryBox>
          <S.InputBox>
            <label>{lang('add_query')}</label>
            <S.SpaceBetween>
              <P.FilledInput
                style={{ flex: 1 }}
                type="text"
                value={query}
                onChange={(e) => set_query(e.target.value)}
                placeholder={lang('input_query_description')}
              />
              <GrayScaleFill
                _mini
                disabled={!query}
                onClick={() => {
                  set_query('')
                  const clone = produce(remapItem, (draft) => {
                    draft.item.params[query] = ''
                  })
                  emitValue(clone)
                }}
              >
                {lang('add')}
              </GrayScaleFill>
            </S.SpaceBetween>
          </S.InputBox>
          <S.Divider />
          <S.Column style={{ gap: '16px' }}>
            {Object.keys(remap.params).map((key) => (
              <S.InputWrap key={key} data-utaku-class="utaku-flex-center">
                <S.InputBox>
                  <S.QueryStatus>
                    <div>
                      {referrerParams?.[key] !== undefined ? (
                        <>
                          {remap.params[key]
                            ? lang('query_change')
                            : lang('query_remove')}
                        </>
                      ) : (
                        <div>{lang('query_append')}</div>
                      )}
                    </div>
                  </S.QueryStatus>
                  <S.SpaceBetween>
                    <S.QueryKey>{key} </S.QueryKey>
                    <P.FilledInput
                      type="text"
                      style={{ flex: 1 }}
                      value={remap.params[key]}
                      onChange={(e) => {
                        const clone = produce(remapItem, (draft) => {
                          draft.item.params[key] = e.target.value
                        })
                        emitValue(clone)
                      }}
                      placeholder={lang('input_query_content')}
                    />
                    <S.Chip
                      onClick={() => {
                        const clone = produce(remapItem, (draft) => {
                          delete draft.item.params[key]
                        })
                        emitValue(clone)
                      }}
                    >
                      {lang('delete')}
                    </S.Chip>
                  </S.SpaceBetween>
                  <S.QueryResult data-utaku-query-result={''}>
                    {referrer &&
                    remapItem.item.params[key] !== referrerParams?.[key] ? (
                      <>
                        {referrerParams?.[key] !== undefined ? (
                          <>
                            <div>
                              <label>Before</label>
                              <div>
                                <>
                                  {key}={referrerParams?.[key]}
                                </>
                              </div>
                            </div>
                            <div data-utaku-query-result="after">
                              <label>After</label>
                              <div>
                                {remapItem.item.params[key] ? (
                                  <>
                                    {key}={remapItem.item.params[key]}
                                  </>
                                ) : (
                                  'Deleted.'
                                )}
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            <div data-utaku-query-result="after">
                              <label>Append</label>
                              {remapItem.item.params[key] && (
                                <div>
                                  {key}={remapItem.item.params[key]}
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </>
                    ) : (
                      <div>Not changed.</div>
                    )}
                  </S.QueryResult>
                </S.InputBox>
              </S.InputWrap>
            ))}
          </S.Column>
        </S.QueryBox>
      </S.Column>
    </>
  )
}
export default EditParams
