import styled from '@emotion/styled'
import { produce } from 'immer'
import React, { useEffect, useMemo, useState } from 'react'
import { useRecoilState } from 'recoil'
import { settings } from '../../content/atoms/settings'
import { lang } from '../../utils'
import highlight from '../../utils/highlight'
import { PrimaryButton, SecondaryButton } from '../Buttons'
import Checkbox from '../Checkbox/Checkbox'
import ModalBody from '../Modal/ModalBody'
import { PopupInputStyle } from './PopupInput.styled'
import UrlEditorStyles from './UrlEditor.styled'
const ButtonWrap = styled.div`
  margin-top: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  & > button {
    flex: 1;
  }
`
const P = PopupInputStyle
export type UrlFilter = {
  host: string
  selected: string[]
  params: {
    [k: string]: string
  }
  from: string
  to: string
}

export const filterList = (
  list: chrome.webRequest.WebResponseHeadersDetails[],
  filter: UrlFilter | null
) => {
  if (!list) return list
  if (list.length < 1) return list
  if (!filter) return list
  const results = Object.values(list).map((item) => {
    if (filter && item.url.includes(filter.host)) {
      let url = new URL(item.url)
      const { host, params, selected, from, to } = filter
      if (host && url.host !== host) return item
      if (selected) {
        const searchParams = new URLSearchParams(url.search)
        selected.forEach((key) => {
          if (searchParams.has(key)) {
            searchParams.set(key, params[key] ?? '')
          }
        })
        url.search = searchParams.toString()
      }
      if ((from || to) && url) {
        const searchParams = new URLSearchParams(url.search)
        if (from && searchParams.has(from)) {
          url = new URL(url.toString().replace(from, to))
        } else if (!from && to) {
          url = new URL(url.toString() + to)
        }
      }
      item.url = url.toString()
    }
    return item
  })
  return results
}
const S = UrlEditorStyles
interface UrlEditorProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {
  currentUrl: string
  emitValue?: (value: UrlFilter) => void
  onClose?: () => void
}
const UrlEditor: React.FC<UrlEditorProps> = ({
  currentUrl,
  emitValue,
  ...props
}) => {
  const [settingState, set_settingState] = useRecoilState(settings)
  const [filter, set_filter] = useState<UrlFilter | null>(null)
  const [filterName, set_filterName] = useState<string>('')
  const [url, setUrl] = useState(new URL(currentUrl))
  const [filteredUrl, set_filteredUrl] = useState(new URL(currentUrl).host)
  const [searchParams, set_searchParams] = useState(
    Object.fromEntries(url.searchParams.entries())
  )
  const [selected, set_selected] = useState<string[]>([])
  const [replaceUrl, set_replaceUrl] = useState<{ from: string; to: string }>({
    from: '',
    to: '',
  })
  const [selectedReplaceUrl, set_selectedReplaceUrl] = useState<boolean>(false)
  const changedUrl = useMemo(() => {
    let nextUrl = new URL(currentUrl)
    const nextSearchParams = new URLSearchParams(nextUrl.search)
    selected.forEach((key) => {
      nextSearchParams.set(key, searchParams[key])
    })
    nextUrl.search = nextSearchParams.toString()
    if (selectedReplaceUrl) {
      if (replaceUrl.from && nextUrl.toString().includes(replaceUrl.from)) {
        nextUrl = new URL(
          nextUrl.toString().replace(replaceUrl.from, replaceUrl.to)
        )
      } else if (!replaceUrl.from && replaceUrl.to) {
        nextUrl = new URL(nextUrl.toString() + replaceUrl.to)
      }
    }
    return nextUrl
  }, [currentUrl, selected, selectedReplaceUrl, replaceUrl, searchParams])

  const EmitUrlFilter = () => {
    const urlFilter: UrlFilter = {
      host: changedUrl.host,
      selected,
      params: searchParams,
      from: replaceUrl.from,
      to: replaceUrl.to,
    }
    emitValue && emitValue(urlFilter)
  }
  const handleSearchParamChange = (key: string, value: string) => {
    const newSearchParams = { ...searchParams, [key]: value }
    set_searchParams(newSearchParams)

    // URL 객체 업데이트
    const newUrl = new URL(url.toString())
    Object.entries(newSearchParams).forEach(([k, v]) =>
      newUrl.searchParams.set(k, v)
    )
    setUrl(newUrl)
  }
  useEffect(() => {
    console.log('searchParams', searchParams)
  }, [searchParams])
  return (
    <ModalBody
      title={lang('set_url_filter')}
      btn={
        <>
          {filter && (
            <SecondaryButton
              _mini
              onClick={() => {
                set_filter(null)
              }}
            >
              {lang('prev')}
            </SecondaryButton>
          )}
          {!filter && (
            <SecondaryButton
              _mini
              _css={'width: 120px;'}
              disabled={!(selected.length > 0 || selectedReplaceUrl)}
              onClick={() => {
                const urlFilter = {
                  host: changedUrl.host,
                  selected,
                  params: searchParams,
                  from: replaceUrl.from,
                  to: replaceUrl.to,
                }
                set_filter(urlFilter)
              }}
            >
              {lang('add')}
            </SecondaryButton>
          )}
        </>
      }
      {...props}
    >
      {filter ? (
        <S.Wrapper>
          <S.Column>
            <S.Row>
              <S.PartLabel>{lang('edit_url_filter')}</S.PartLabel>
              <div>{filter.host}</div>
            </S.Row>
            {selected.map((item) => {
              return (
                <S.Row key={item}>
                  <label>{item}</label>
                  {filter.params[item] && <div>{filter.params[item]}</div>}
                </S.Row>
              )
            })}
            {selectedReplaceUrl && (
              <S.Row>
                <label>Replace url</label>
                <div>
                  {filter.from}
                  {' -> '}
                  {filter.to}
                </div>
              </S.Row>
            )}
          </S.Column>
          <S.InputWrap className="utaku-flex-center">
            <S.InputBox>
              <label>{lang('edit_filter_name')}</label>
              <P.UnderlineInput
                type="text"
                value={filterName}
                onChange={(e) => set_filterName(e.target.value)}
              />
            </S.InputBox>
          </S.InputWrap>
        </S.Wrapper>
      ) : (
        <S.Wrapper>
          <S.CurrentUrl>
            <div>{highlight(currentUrl.toString(), filteredUrl)}</div>
          </S.CurrentUrl>
          {(selected.length > 0 || selectedReplaceUrl) && (
            <S.NextUrl>
              <div>{highlight(changedUrl.toString(), replaceUrl.to)}</div>
            </S.NextUrl>
          )}
          <S.FilteredUrl>
            <S.PartLabel>{lang('edit_url_filter')}</S.PartLabel>
            <P.UnderlineInput
              type="text"
              value={filteredUrl}
              onChange={(e) => {
                set_filteredUrl(e.target.value)
              }}
            />
          </S.FilteredUrl>
          {Object.keys(searchParams).length > 0 && (
            <S.QueryBox>
              <S.PartLabel>{lang('edit_query')}</S.PartLabel>
              <S.QueryColumn>
                {Object.keys(searchParams).map((key) => (
                  <S.InputWrap key={key} className="utaku-flex-center">
                    <Checkbox
                      active={selected.includes(key)}
                      onClick={() => {
                        if (selected.includes(key)) {
                          set_selected(selected.filter((item) => item !== key))
                        } else {
                          set_selected([...selected, key])
                        }
                      }}
                    />
                    <S.InputBox className="utaku-flex-center">
                      <label>{key}</label>
                      <P.UnderlineInput
                        type="text"
                        value={searchParams[key]}
                        onChange={(e) =>
                          handleSearchParamChange(key, e.target.value)
                        }
                        disabled={!selected.includes(key)}
                      />
                    </S.InputBox>
                  </S.InputWrap>
                ))}
              </S.QueryColumn>
            </S.QueryBox>
          )}
          <S.ReplaceBox>
            <S.PartLabel>{lang('change_add_text')}</S.PartLabel>
            <S.InputWrap className="utaku-flex-center">
              <Checkbox
                active={selectedReplaceUrl}
                onClick={() => {
                  set_selectedReplaceUrl(!selectedReplaceUrl)
                }}
              />
              <S.InputBox>
                <label>Replace url</label>
                <P.UnderlineInput
                  type="text"
                  value={replaceUrl.from}
                  onChange={(e) =>
                    set_replaceUrl({ ...replaceUrl, from: e.target.value })
                  }
                  disabled={!selectedReplaceUrl}
                  placeholder="from"
                />
                <P.UnderlineInput
                  type="text"
                  value={replaceUrl.to}
                  onChange={(e) =>
                    set_replaceUrl({ ...replaceUrl, to: e.target.value })
                  }
                  disabled={!selectedReplaceUrl}
                  placeholder="to"
                />
              </S.InputBox>
            </S.InputWrap>
          </S.ReplaceBox>
        </S.Wrapper>
      )}
      <ButtonWrap>
        {!filter && (
          <>
            <PrimaryButton
              disabled={!(selected.length > 0 || selectedReplaceUrl)}
              onClick={EmitUrlFilter}
            >
              적용
            </PrimaryButton>
          </>
        )}
        {filter && (
          <>
            <PrimaryButton
              disabled={
                !filterName ||
                !!settingState.filterList.find(
                  (item) => item.name === filterName
                )
              }
              onClick={() => {
                if (!filterName) {
                  return alert(lang('input_name'))
                }
                if (
                  settingState.filterList.find(
                    (item) => item.name === filterName
                  )
                )
                  return alert(lang('already_exists_name'))
                const currentFilter = {
                  name: filterName,
                  item: filter,
                }
                set_settingState(
                  produce((draft) => {
                    draft.filterList = [...draft.filterList, currentFilter]
                  })
                )
                chrome.storage.sync.get('filterList', (result) => {
                  if (result.filterList) {
                    const nextUrlFilter = [...result.filterList, currentFilter]
                    chrome.storage.sync.set({ filterList: nextUrlFilter })
                  } else {
                    chrome.storage.sync.set({ filterList: [currentFilter] })
                  }
                })
                if (props.onClose) props.onClose()
                return
              }}
            >
              {settingState.filterList.find((item) => item.name === filterName)
                ? lang('already_exists_name')
                : '저장'}
            </PrimaryButton>
          </>
        )}
      </ButtonWrap>
    </ModalBody>
  )
}

export default UrlEditor
