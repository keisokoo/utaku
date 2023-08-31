import classNames from 'classnames'
import { produce } from 'immer'
import { sortBy } from 'lodash-es'
import React, { Fragment, useMemo, useState } from 'react'
import { useSetRecoilState } from 'recoil'
import { v4 } from 'uuid'
import {
  UrlRemapItem,
  initialUrlRemapItem,
  settings,
} from '../../atoms/settings'
import { isValidUrl, lang, parseUrlRemap } from '../../utils'
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
  const referrer = useMemo(() => {
    if (!currentRemap?.item?.reference_url) return null
    if (!isValidUrl(currentRemap?.item?.reference_url)) return null
    return new URL(currentRemap.item.reference_url)
  }, [currentRemap.item])
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
          {remappedUrl && isValidUrl(remap.reference_url) && (
            <>
              <label>{lang('changed_result')}</label>
              <S.NextUrl>
                <div>{remappedUrl?.toString()}</div>
              </S.NextUrl>
            </>
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
          <S.PartLabel>3. {lang('path_changer')}</S.PartLabel>
          <S.QueryBox>
            {!referrer?.pathname && <div>{lang('no_valid_reference_url')}</div>}
            {referrer?.pathname && (
              <>
                <S.PathName>
                  {referrer.pathname
                    .split('/')
                    .filter((ii) => !!ii)
                    .map((dt, idx) => {
                      const changed = currentRemap.item.path_change?.find(
                        (ii) => ii.index === idx
                      )
                      return (
                        <Fragment key={dt}>
                          <span>/</span>
                          <span
                            className={classNames({
                              highlight: changed,
                            })}
                          >
                            {changed?.to ? changed?.to : dt}
                          </span>
                        </Fragment>
                      )
                    })}
                </S.PathName>
                <S.Chips>
                  {referrer?.pathname &&
                    referrer.pathname
                      .split('/')
                      .filter((ii) => !!ii)
                      .map((path, idx) => (
                        <S.Chip
                          key={idx}
                          data-active={
                            currentRemap.item.path_change?.find(
                              (ii) => ii.index === idx
                            )
                              ? 'true'
                              : 'false'
                          }
                          onClick={() => {
                            set_currentRemap(
                              produce((draft) => {
                                if (!draft.item.path_change)
                                  draft.item.path_change = []
                                if (
                                  draft.item.path_change.find(
                                    (ii) => ii.index === idx
                                  )
                                ) {
                                  draft.item.path_change =
                                    draft.item.path_change.filter(
                                      (ii) => ii.index !== idx
                                    )
                                  return
                                }
                                draft.item.path_change.push({
                                  index: idx,
                                  to: path ?? '',
                                })
                              })
                            )
                          }}
                        >
                          <span>{path}</span>
                        </S.Chip>
                      ))}
                </S.Chips>
                <S.Divider />
              </>
            )}
            {sortBy(remap.path_change, (item) => item.index).map((item) => {
              const pathItem = remap.path_change.find(
                (ii) => ii.index === item.index
              )
              if (!pathItem) return null
              return (
                <S.InputWrap
                  key={'changer' + item.index}
                  className="utaku-flex-center"
                >
                  <S.InputBox className="utaku-flex-center">
                    <S.QueryStatus>
                      <div>{lang('path_index')}: </div>
                      <label>{item.index}</label>
                    </S.QueryStatus>
                    <S.SpaceBetween>
                      <P.FilledInput
                        type="text"
                        style={{ flex: 1 }}
                        value={pathItem.to}
                        onChange={(e) => {
                          set_currentRemap(
                            produce((draft) => {
                              const draftItem = draft.item.path_change.find(
                                (ii) => ii.index === item.index
                              )
                              if (draftItem) draftItem.to = e.target.value
                            })
                          )
                        }}
                        placeholder={lang('input_query_content')}
                      />
                      <S.Chip
                        onClick={() => {
                          set_currentRemap(
                            produce((draft) => {
                              draft.item.path_change =
                                draft.item.path_change.filter(
                                  (ii) => ii.index !== item.index
                                )
                            })
                          )
                        }}
                      >
                        {lang('delete')}
                      </S.Chip>
                    </S.SpaceBetween>
                  </S.InputBox>
                </S.InputWrap>
              )
            })}
          </S.QueryBox>
        </S.Column>
        <S.Column>
          <S.PartLabel>4. {lang('change_add_text')}</S.PartLabel>
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
                  draft.remapList.push({ ...currentRemap, id: v4() })
                }
              })
            )
            chrome.storage.local.get('remapList', (result) => {
              if (result.remapList) {
                if (mode === 'edit' && remapItem) {
                  const idx = result.remapList.findIndex(
                    (curr: UrlRemapItem) => curr.id === remapItem.id
                  )
                  result.remapList[idx] = currentRemap
                } else {
                  result.remapList.push({ ...currentRemap, id: v4() })
                }
                chrome.storage.local.set({ remapList: [...result.remapList] })
              } else {
                chrome.storage.local.set({
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
