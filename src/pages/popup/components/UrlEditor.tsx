import styled from '@emotion/styled'
import React, { useMemo, useState } from 'react'
import { PrimaryButton } from '../../../components/Buttons'
import Checkbox from '../../../components/Checkbox/Checkbox'
import ModalBody from '../../../components/Modal/ModalBody'
import { colors } from '../../../themes'
import { lang } from '../../../utils'
import highlight from '../../../utils/highlight'

const EditorWrap = styled.div`
  display: flex;
  flex-direction: row;
  gap: 16px;
  color: ${colors['Grayscale/Gray Dark']};
  justify-content: space-between;
  & > div {
    width: 320px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    &.utaku-left {
    }
    &.utaku-right {
      max-height: 400px;
      overflow-y: auto;
      justify-content: space-between;
      .utaku-params-edit {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
    }
  }
  label {
    display: block;
    color: #494949;
    font-weight: 700;
    font-size: 14px;
  }
  input {
    width: 100%;
  }
  .filtered-url {
    padding-bottom: 16px;
    border-bottom: 1px solid #dadada;
    padding-top: 8px;
    margin-bottom: 8px;
  }
  .current-url,
  .next-url {
    color: #464646;
    background-color: #dcdcdc;
    padding: 8px 12px;
    max-width: 400px;
    word-break: break-all;
    border-radius: 8px;
    font-size: 12px;
    span.highlight {
      color: ${colors['Secondary/Dark']};
    }
  }
  .next-url {
    background-color: #d6f7d5;
    span.highlight {
      color: ${colors['Secondary/Dark']};
    }
  }
  .utaku-popup-input {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px 8px;
    border: 1px solid #ccc;
    border-radius: 8px;
    .utaku-popup-input-edit {
      flex: 1;
      input {
        width: 100%;
      }
    }
  }
`

export type UrlFilter = {
  host: string
  selected: string[]
  params: URLSearchParams
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
            searchParams.set(key, params.get(key) ?? '')
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
interface UrlEditorProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {
  currentUrl: string
  emitValue?: (value: UrlFilter) => void
}
const UrlEditor: React.FC<UrlEditorProps> = ({
  currentUrl,
  emitValue,
  ...props
}) => {
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
      params: changedUrl.searchParams,
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
  return (
    <ModalBody title={lang('set_url_filter')} {...props}>
      <EditorWrap>
        <div className="utaku-left">
          <div className="filtered-url">
            <label>{lang('edit_url_filter')}</label>
            <input
              type="text"
              value={filteredUrl}
              onChange={(e) => {
                set_filteredUrl(e.target.value)
              }}
            />
          </div>
          <div className="current-url">
            <div>{highlight(currentUrl.toString(), filteredUrl)}</div>
          </div>
          {(selected.length > 0 || selectedReplaceUrl) && (
            <div className="next-url">
              <div>{highlight(changedUrl.toString(), replaceUrl.to)}</div>
            </div>
          )}
        </div>
        <div className="utaku-right">
          <div className="utaku-query-edit">
            <label>{lang('edit_query')}</label>
            <div className="utaku-params-edit">
              {Object.keys(searchParams).map((key) => (
                <div key={key} className="utaku-popup-input">
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
                  <div className="utaku-popup-input-edit">
                    <label>{key}</label>
                    <input
                      type="text"
                      value={searchParams[key]}
                      onChange={(e) =>
                        handleSearchParamChange(key, e.target.value)
                      }
                      disabled={!selected.includes(key)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="utaku-replace-url">
            <label>{lang('change_add_text')}</label>
            <div className="utaku-popup-input">
              <Checkbox
                active={selectedReplaceUrl}
                onClick={() => {
                  set_selectedReplaceUrl(!selectedReplaceUrl)
                }}
              />
              <div className="utaku-popup-input-edit">
                <label>Replace url</label>
                <input
                  type="text"
                  value={replaceUrl.from}
                  onChange={(e) =>
                    set_replaceUrl({ ...replaceUrl, from: e.target.value })
                  }
                  disabled={!selectedReplaceUrl}
                  placeholder="from"
                />
                <input
                  type="text"
                  value={replaceUrl.to}
                  onChange={(e) =>
                    set_replaceUrl({ ...replaceUrl, to: e.target.value })
                  }
                  disabled={!selectedReplaceUrl}
                  placeholder="to"
                />
              </div>
            </div>
          </div>
        </div>
      </EditorWrap>
      <PrimaryButton
        _css={`
        margin-top: 16px;
        width: 100%;
      `}
        onClick={EmitUrlFilter}
      >
        적용
      </PrimaryButton>
    </ModalBody>
  )
}

export default UrlEditor
