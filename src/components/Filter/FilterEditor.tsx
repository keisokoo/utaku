import { produce } from 'immer'
import React, { useEffect, useState } from 'react'
import { useRecoilState } from 'recoil'
import { UrlFilter, settings } from '../../content/atoms/settings'
import { lang } from '../../utils'
import {
  GrayScaleFill,
  PrimaryButton,
  SecondaryButton,
  WhiteFill,
} from '../Buttons'
import ModalBody from '../Modal/ModalBody'
import { FilterStyle } from './FilterEditor.styled'
import { PopupInputStyle } from './PopupInput.styled'
import UrlEditorStyles from './UrlEditor.styled'
const P = PopupInputStyle
const F = FilterStyle
const S = UrlEditorStyles
interface FilterEditorProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {
  emitFilter: (filter: UrlFilter) => void
  onClose?: () => void
}
const FilterEditor = ({ emitFilter, ...props }: FilterEditorProps) => {
  const [settingState, set_settingState] = useRecoilState(settings)
  const [filterName, set_filterName] = useState<string>('')
  const [filteredUrl, set_filteredUrl] = useState('')
  const [filterKey, set_filterKey] = useState<string>('')
  const [searchParams, set_searchParams] = useState<{
    [k: string]: string
  }>({})
  const [replaceUrl, set_replaceUrl] = useState<{ from: string; to: string }>({
    from: '',
    to: '',
  })
  const [mode, set_mode] = useState<'add' | { name: string } | null>(null)
  useEffect(() => {
    // sample settings filter
    if (process.env.NODE_ENV === 'watch')
      set_settingState(
        produce((draft) => {
          draft.filterList = [
            {
              name: 'sample',
              item: {
                host: 'sample.com',
                selected: ['sample'],
                params: {
                  sample: '',
                },
                from: '',
                to: '',
              },
            },
            {
              name: 'sample1',
              item: {
                host: 'sample.com',
                selected: ['sample'],
                params: {
                  sample: '',
                },
                from: '',
                to: '',
              },
            },
            {
              name: 'sample2',
              item: {
                host: 'sample.com',
                selected: ['sample'],
                params: {
                  sample: '',
                },
                from: '',
                to: '',
              },
            },
            {
              name: 'sample3',
              item: {
                host: 'sample.com',
                selected: ['sample'],
                params: {
                  sample: '',
                },
                from: '',
                to: '',
              },
            },
            {
              name: 'sample4',
              item: {
                host: 'sample.com',
                selected: ['sample'],
                params: {
                  sample: '',
                },
                from: '',
                to: '',
              },
            },
            {
              name: 'sample5648487sample5648487sample5648487',
              item: {
                host: 'sample.com',
                selected: ['sample'],
                params: {
                  sample: '',
                },
                from: '',
                to: '',
              },
            },
          ]
        })
      )
  }, [])
  useEffect(() => {
    if (typeof mode === 'object' && mode !== null) {
      const filterItem = settingState.filterList.find(
        (item) => item.name === mode.name
      )
      if (filterItem) {
        set_filteredUrl(filterItem.item.host)
        set_searchParams(filterItem.item.params)
        set_replaceUrl({ from: filterItem.item.from, to: filterItem.item.to })
        set_filterName(filterItem.name)
      }
    } else {
      set_filteredUrl('')
      set_searchParams({})
      set_replaceUrl({ from: '', to: '' })
      set_filterName('')
    }
    set_filterKey('')
    return () => {
      set_filterKey('')
      set_filteredUrl('')
      set_searchParams({})
      set_replaceUrl({ from: '', to: '' })
      set_filterName('')
    }
  }, [mode])
  return (
    <ModalBody
      title={lang('url_filter_list')}
      btn={
        <>
          {mode !== null && (
            <SecondaryButton
              _mini
              onClick={() => {
                set_mode(null)
              }}
            >
              {lang('prev')}
            </SecondaryButton>
          )}
          {mode === null && (
            <SecondaryButton
              _mini
              onClick={() => {
                set_mode('add')
              }}
            >
              {lang('add')}
            </SecondaryButton>
          )}
        </>
      }
      {...props}
    >
      {mode !== null && (
        <S.Wrapper>
          <S.FilteredUrl>
            <S.PartLabel>{lang('name')}</S.PartLabel>
            <P.UnderlineInput
              placeholder={lang('input_content')}
              type="text"
              value={filterName}
              onChange={(e) => {
                set_filterName(e.target.value)
              }}
            />
          </S.FilteredUrl>
          <S.FilteredUrl>
            <S.PartLabel>{lang('edit_url_filter')}</S.PartLabel>
            <P.UnderlineInput
              placeholder={lang('input_content')}
              type="text"
              value={filteredUrl}
              onChange={(e) => {
                set_filteredUrl(e.target.value)
              }}
            />
          </S.FilteredUrl>
          <S.QueryBox>
            <S.PartLabel>{lang('edit_query')}</S.PartLabel>
            <S.QueryColumn>
              {Object.keys(searchParams).map((key) => (
                <S.InputWrap key={key}>
                  <S.InputBox>
                    <label>{key}</label>
                    <P.UnderlineInput
                      placeholder={lang('input_content')}
                      type="text"
                      value={searchParams[key]}
                      onChange={(e) => {
                        const newSearchParams = {
                          ...searchParams,
                          [key]: e.target.value,
                        }
                        set_searchParams(newSearchParams)
                      }}
                    />
                  </S.InputBox>
                  <WhiteFill
                    _mini
                    onClick={() => {
                      const newSearchParams = {
                        ...searchParams,
                      }
                      delete newSearchParams[key]
                      set_searchParams(newSearchParams)
                    }}
                  >
                    {lang('delete')}
                  </WhiteFill>
                </S.InputWrap>
              ))}
              <S.InputWrap>
                <S.InputBox>
                  <label>{lang('add_query')}</label>
                  <P.UnderlineInput
                    placeholder={lang('input_content')}
                    type="text"
                    value={filterKey}
                    onChange={(e) => {
                      set_filterKey(e.target.value)
                    }}
                  />
                </S.InputBox>
                <PrimaryButton
                  _mini={true}
                  onClick={() => {
                    if (searchParams[filterKey] !== undefined)
                      return alert('이미 존재하는 키입니다.')
                    const newSearchParams = {
                      ...searchParams,
                      [filterKey]: '',
                    }
                    set_searchParams(newSearchParams)
                    set_filterKey('')
                  }}
                >
                  {lang('add')}
                </PrimaryButton>
              </S.InputWrap>
            </S.QueryColumn>
          </S.QueryBox>
          <S.ReplaceBox>
            <S.PartLabel>{lang('change_add_text')}</S.PartLabel>
            <S.InputWrap>
              <S.InputBox>
                <label>Replace url</label>
                <P.UnderlineInput
                  type="text"
                  value={replaceUrl.from}
                  onChange={(e) =>
                    set_replaceUrl({ ...replaceUrl, from: e.target.value })
                  }
                  placeholder={lang('input_content')}
                />
                <P.UnderlineInput
                  type="text"
                  value={replaceUrl.to}
                  onChange={(e) =>
                    set_replaceUrl({ ...replaceUrl, to: e.target.value })
                  }
                  placeholder={lang('input_content')}
                />
              </S.InputBox>
            </S.InputWrap>
          </S.ReplaceBox>
          <PrimaryButton
            disabled={
              !Object.keys(searchParams).length &&
              !(replaceUrl.from || replaceUrl.to)
            }
            onClick={() => {
              if (mode) {
                if (!filterName) return alert(lang('input_name'))
                const nextItem = {
                  name: filterName,
                  item: {
                    host: filteredUrl,
                    selected: Object.keys(searchParams),
                    params: searchParams,
                    from: replaceUrl.from,
                    to: replaceUrl.to,
                  },
                }
                if (mode === 'add') {
                  if (
                    settingState.filterList.find(
                      (item) => item.name === filterName
                    )
                  ) {
                    return alert(lang('already_exist'))
                  }
                  set_settingState(
                    produce((draft) => {
                      draft.filterList.push(nextItem)
                    })
                  )
                  if (chrome?.storage)
                    chrome.storage.sync.set({
                      filterList: [...settingState.filterList, nextItem],
                    })
                } else {
                  set_settingState(
                    produce((draft) => {
                      const filterItem = draft.filterList.find(
                        (item) => item.name === mode.name
                      )
                      if (filterItem) {
                        filterItem.name = filterName
                        filterItem.item = {
                          host: filteredUrl,
                          selected: Object.keys(searchParams),
                          params: searchParams,
                          from: replaceUrl.from,
                          to: replaceUrl.to,
                        }
                      }
                    })
                  )
                  if (chrome?.storage)
                    chrome.storage.sync.set({
                      filterList: settingState.filterList.map((item) => {
                        if (item.name === mode.name) {
                          item = nextItem
                        }
                        return item
                      }),
                    })
                }
              }
              set_mode(null)
            }}
          >
            {mode === 'add' ? lang('add') : lang('edit')}
          </PrimaryButton>
        </S.Wrapper>
      )}
      {mode === null && (
        <F.NameList>
          {settingState.filterList.length === 0 && (
            <F.Row>
              <F.Name>{lang('empty_filter')}</F.Name>
            </F.Row>
          )}
          {settingState.filterList.map((item) => {
            return (
              <F.Row key={item.name}>
                <F.Name>{item.name}</F.Name>
                <F.Buttons>
                  <PrimaryButton
                    _mini
                    onClick={() => {
                      emitFilter(item.item)
                      if (props.onClose) props.onClose()
                    }}
                  >
                    {lang('apply')}
                  </PrimaryButton>
                  <GrayScaleFill
                    _mini
                    onClick={() => {
                      set_mode({ name: item.name })
                    }}
                  >
                    {lang('edit')}
                  </GrayScaleFill>
                  <WhiteFill
                    _mini
                    onClick={() => {
                      set_settingState({
                        ...settingState,
                        filterList: settingState.filterList.filter(
                          (curr) => curr.name !== item.name
                        ),
                      })
                      if (chrome?.storage)
                        chrome.storage.sync.set({
                          filterList: settingState.filterList.filter(
                            (curr) => curr.name !== item.name
                          ),
                        })
                    }}
                  >
                    {lang('delete')}
                  </WhiteFill>
                </F.Buttons>
              </F.Row>
            )
          })}
        </F.NameList>
      )}
    </ModalBody>
  )
}
export default FilterEditor
