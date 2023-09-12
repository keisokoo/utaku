import classNames from 'classnames'
import { produce } from 'immer'
import { sortBy } from 'lodash-es'
import React, { Fragment, useMemo } from 'react'
import { UrlRemapItem } from '../../../atoms/settings'
import { isValidUrl, lang } from '../../../utils'
import { PopupInputStyle } from '../PopupInput.styled'
import { RemapStyle } from '../Remaps.styled'
import { getIndexByStepName } from '../Remaps.type'

const P = PopupInputStyle
const S = RemapStyle
interface EditPathnameProps {
  remapItem: UrlRemapItem
  emitValue: (remap: UrlRemapItem) => void
}
const EditPathname = ({ remapItem, emitValue }: EditPathnameProps) => {
  const remap = remapItem.item
  const referrer = useMemo(() => {
    if (!remapItem?.item?.reference_url) return null
    if (!isValidUrl(remapItem?.item?.reference_url)) return null
    return new URL(remapItem.item.reference_url)
  }, [remapItem.item])
  const pathnameArray = useMemo(() => {
    if (!referrer) return []
    return referrer.pathname.split('/').filter((ii) => !!ii)
  }, [referrer])
  return (
    <>
      <S.Column>
        <S.PartLabel>
          {`${getIndexByStepName('path_change') + 1}. `}
          {lang('path_changer')}
        </S.PartLabel>
        <S.QueryBox>
          {!referrer?.pathname && <div>{lang('no_valid_reference_url')}</div>}
          {referrer?.pathname && (
            <>
              <S.PathName>
                {pathnameArray.map((dt, idx) => {
                  const changed = remapItem.item.path_change?.find(
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
                  pathnameArray.map((path, idx) => (
                    <S.Chip
                      key={idx}
                      data-active={
                        remapItem.item.path_change?.find(
                          (ii) => ii.index === idx
                        )
                          ? 'true'
                          : 'false'
                      }
                      onClick={() => {
                        const clone = produce(remapItem, (draft) => {
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
                        emitValue(clone)
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
                        const clone = produce(remapItem, (draft) => {
                          const draftItem = draft.item.path_change.find(
                            (ii) => ii.index === item.index
                          )
                          if (draftItem) draftItem.to = e.target.value
                        })
                        emitValue(clone)
                      }}
                      placeholder={lang('input_query_content')}
                    />
                    <S.Chip
                      onClick={() => {
                        const clone = produce(remapItem, (draft) => {
                          draft.item.path_change =
                            draft.item.path_change.filter(
                              (ii) => ii.index !== item.index
                            )
                        })
                        emitValue(clone)
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
    </>
  )
}
export default EditPathname
