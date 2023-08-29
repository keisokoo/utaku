import { produce } from 'immer'
import React, { useMemo, useState } from 'react'
import { useSetRecoilState } from 'recoil'
import { v4 } from 'uuid'
import {
  UrlRemapItem,
  initialUrlRemapItem,
  settings,
} from '../../atoms/settings'
import { isValidUrl, lang, parseUrlRemap } from '../../utils'
import highlight from '../../utils/highlight'
import { GrayScaleFill, SecondaryButton } from '../Buttons'
import { PopupInputStyle } from './PopupInput.styled'
import { RemapStyle } from './Remaps.styled'

const P = PopupInputStyle
const S = RemapStyle
interface EditorProps {
  mode: 'add' | 'edit'
  remapItem?: UrlRemapItem | null
  onClose?: () => void
}
const Editor = ({ mode, onClose, remapItem }: EditorProps) => {
  const [currentRemap, set_currentRemap] = useState<UrlRemapItem>(
    remapItem ?? initialUrlRemapItem
  )
  const set_settingState = useSetRecoilState(settings)
  const [query, set_query] = React.useState<string>('')
  const remap = currentRemap.item
  const remappedUrl = useMemo(() => {
    if (!currentRemap?.item?.reference_url) return null
    if (!isValidUrl(currentRemap?.item?.reference_url)) return null
    return parseUrlRemap(currentRemap.item, currentRemap.item.reference_url)
  }, [currentRemap.item])
  return (
    <>
      <S.EditorList>
        <S.Column>
          <S.PartLabel>{lang('url_reference')}</S.PartLabel>
          <S.CurrentUrl
            value={remap.reference_url}
            onChange={(e) => {
              set_currentRemap(
                produce((draft) => {
                  draft.item.reference_url = e.target.value
                })
              )
            }}
            placeholder={lang('reference_url_description')}
          />
          {remappedUrl &&
            isValidUrl(remap.reference_url) &&
            currentRemap.item?.params &&
            Object.keys(currentRemap.item.params).length > 0 && (
              <S.NextUrl>
                <div>{highlight(remappedUrl?.toString(), remap?.to)}</div>
              </S.NextUrl>
            )}
        </S.Column>
        <S.Column>
          <S.PartLabel>{lang('edit_remap_name')}</S.PartLabel>
          <P.UnderlineInput
            placeholder={lang('input_remap_name')}
            type="text"
            value={currentRemap.name}
            onChange={(e) => {
              set_currentRemap(
                produce((draft) => {
                  draft.name = e.target.value
                })
              )
            }}
          />
        </S.Column>
        <S.Column>
          <S.PartLabel>1. {lang('edit_url_match')}</S.PartLabel>
          <P.UnderlineInput
            placeholder={lang('input_url_match')}
            type="text"
            value={remap.host}
            onChange={(e) => {
              set_currentRemap(
                produce((draft) => {
                  draft.item.host = e.target.value
                })
              )
            }}
          />
        </S.Column>
        <S.Column>
          <S.PartLabel>2. {lang('edit_query')}</S.PartLabel>
          <S.QueryBox className="utaku-flex-center">
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
                    set_currentRemap(
                      produce((draft) => {
                        draft.item.params[query] = ''
                      })
                    )
                  }}
                >
                  {lang('add')}
                </GrayScaleFill>
              </S.SpaceBetween>
            </S.InputBox>
            <S.Divider />
            <S.Column style={{ gap: '16px' }}>
              {Object.keys(remap.params).map((key) => (
                <S.InputWrap key={key} className="utaku-flex-center">
                  <S.InputBox className="utaku-flex-center">
                    <S.QueryStatus>
                      <label>{key}</label>
                      <div>
                        {remap.params[key]
                          ? lang('query_change')
                          : lang('query_remove')}
                      </div>
                    </S.QueryStatus>
                    <S.SpaceBetween>
                      <P.FilledInput
                        type="text"
                        style={{ flex: 1 }}
                        value={remap.params[key]}
                        onChange={(e) => {
                          set_currentRemap(
                            produce((draft) => {
                              draft.item.params[key] = e.target.value
                            })
                          )
                        }}
                        placeholder={lang('input_query_content')}
                      />
                      <S.Chip
                        onClick={() => {
                          set_currentRemap(
                            produce((draft) => {
                              delete draft.item.params[key]
                            })
                          )
                        }}
                      >
                        {lang('delete')}
                      </S.Chip>
                    </S.SpaceBetween>
                  </S.InputBox>
                </S.InputWrap>
              ))}
            </S.Column>
          </S.QueryBox>
        </S.Column>
        <S.Column>
          <S.PartLabel>3. {lang('change_add_text')}</S.PartLabel>
          <S.InputWrap className="utaku-flex-center">
            <S.InputBox>
              <label>{lang('replace_url')}</label>
              <div>
                <P.UnderlineInput
                  type="text"
                  style={{ width: '100%' }}
                  value={remap.from}
                  onChange={(e) =>
                    set_currentRemap(
                      produce((draft) => {
                        draft.item.from = e.target.value
                      })
                    )
                  }
                  placeholder="from"
                />
              </div>
              <div>
                <P.UnderlineInput
                  type="text"
                  style={{ width: '100%' }}
                  value={remap.to}
                  onChange={(e) =>
                    set_currentRemap(
                      produce((draft) => {
                        draft.item.to = e.target.value
                      })
                    )
                  }
                  placeholder="to"
                />
              </div>
            </S.InputBox>
          </S.InputWrap>
        </S.Column>
      </S.EditorList>
      <S.BottomList>
        <SecondaryButton
          _mini
          disabled={currentRemap.name === '' || currentRemap.item.host === ''}
          onClick={() => {
            set_settingState(
              produce((draft) => {
                if (mode === 'edit' && remapItem) {
                  draft.remapList = draft.remapList.map((curr) => {
                    if (curr.id === remapItem.id) {
                      return currentRemap
                    }
                    return curr
                  })
                } else {
                  draft.remapList.push(currentRemap)
                }
              })
            )
            chrome.storage.sync.get('remapList', (result) => {
              if (result.remapList) {
                if (mode === 'edit' && remapItem) {
                  const idx = result.remapList.findIndex(
                    (curr: UrlRemapItem) => curr.id === remapItem.id
                  )
                  result.remapList[idx] = currentRemap
                } else {
                  result.remapList.push({ ...currentRemap, id: v4() })
                }
                chrome.storage.sync.set({ remapList: [...result.remapList] })
              } else {
                chrome.storage.sync.set({
                  remapList: [{ ...currentRemap, id: v4() }],
                })
              }
            })
            onClose && onClose()
          }}
        >
          {mode === 'edit' ? lang('save') : lang('add')}
        </SecondaryButton>
      </S.BottomList>
    </>
  )
}
export default Editor
