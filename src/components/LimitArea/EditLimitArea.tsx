import { produce } from 'immer'
import React, { useState } from 'react'
import {
  FaCaretDown,
  FaCaretUp,
  FaHome,
  FaQuestion,
  FaVectorSquare,
} from 'react-icons/fa'
import { useRecoilState } from 'recoil'
import { v4 } from 'uuid'
import { LimitBySelectorType, settings } from '../../atoms/settings'
import { lang } from '../../utils'
import { GrayScaleOutline, PrimaryButton, WhiteFill } from '../Buttons'
import { PopupInputStyle } from '../PopupInput.styled'
import { EditTableStyles } from '../PopupStyles/EditTableStyles'
import { PopupStyles, questionCss } from '../PopupStyles/PopupStyles'
import Tooltip from '../Tooltip'
import GetLimitArea from './GetLimitArea'

const S = PopupStyles
const P = PopupInputStyle
const E = EditTableStyles
interface EditLimitAreaProps {
  limitArea: LimitBySelectorType
  onClose?: () => void
  emitOnOff: (bool: boolean) => void
}
const EditLimitArea = ({
  limitArea: _limitArea,
  emitOnOff,
  onClose,
}: EditLimitAreaProps) => {
  const [settingState, set_settingState] = useRecoilState(settings)
  const [limitArea, set_limitArea] = useState<LimitBySelectorType>(_limitArea)
  const [extraSetting, set_extraSetting] = useState<boolean>(false)

  const [tooltipText, set_tooltipText] = useState<string | null>(null)
  return (
    <>
      <S.EditItemColumn>
        {tooltipText && (
          <Tooltip
            style={{
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          >
            {tooltipText}
          </Tooltip>
        )}
        <E.List>
          <E.ListItem>
            <label>{lang('name')}</label>
            <div>
              <P.FilledInput
                type="text"
                value={limitArea.name}
                placeholder={lang('input_name')}
                onChange={(e) => {
                  const clone = produce(limitArea, (draft) => {
                    draft.name = e.target.value
                  })
                  set_limitArea(clone)
                }}
              />
              <GrayScaleOutline
                {...questionCss}
                onMouseEnter={() => {
                  set_tooltipText(lang('guide_filter_name_input'))
                }}
                onMouseLeave={() => {
                  set_tooltipText(null)
                }}
              >
                <FaQuestion />
              </GrayScaleOutline>
            </div>
          </E.ListItem>
          <E.ListItem>
            <label>{lang('host')}</label>
            <div>
              <P.FilledInput
                type="text"
                value={limitArea.host}
                placeholder={lang('limit_area_host_placeholder')}
                onChange={(e) => {
                  const clone = produce(limitArea, (draft) => {
                    draft.host = e.target.value
                  })
                  set_limitArea(clone)
                }}
              />
              <WhiteFill
                _mini
                onClick={() => {
                  const clone = produce(limitArea, (draft) => {
                    draft.host = window.location.host
                  })
                  set_limitArea(clone)
                }}
              >
                <FaHome /> {lang('current_host')}
              </WhiteFill>
              <GrayScaleOutline
                {...questionCss}
                onMouseEnter={() => {
                  set_tooltipText(lang('limit_area_host_tooltip'))
                }}
                onMouseLeave={() => {
                  set_tooltipText(null)
                }}
              >
                <FaQuestion />
              </GrayScaleOutline>
            </div>
          </E.ListItem>
          <E.ListItem>
            <label>{lang('parent_selector')}</label>
            <div>
              <P.FilledInput
                type="text"
                value={limitArea.selector.parent}
                placeholder={lang('limit_area_parent_selector_placeholder')}
                onChange={(e) => {
                  const clone = produce(limitArea, (draft) => {
                    draft.selector.parent = e.target.value
                  })
                  set_limitArea(clone)
                }}
              />
              <GetLimitArea
                _mini
                btnText={
                  <>
                    <FaVectorSquare /> {lang('select_area')}
                  </>
                }
                emitOnOff={(bool) => {
                  emitOnOff(bool)
                }}
                emitLimitSelector={(selector) => {
                  set_limitArea(
                    produce((draft) => {
                      draft.selector = selector.selector
                    })
                  )
                }}
              />
              <GrayScaleOutline
                {...questionCss}
                onMouseEnter={() => {
                  set_tooltipText(lang('limit_area_parent_selector_tooltip'))
                }}
                onMouseLeave={() => {
                  set_tooltipText(null)
                }}
              >
                <FaQuestion />
              </GrayScaleOutline>
            </div>
          </E.ListItem>
          {extraSetting && (
            <>
              <E.ListItem>
                <label>{lang('image_selector')}</label>
                <div>
                  <P.FilledInput
                    type="text"
                    value={limitArea.selector.image}
                    placeholder={lang('limit_area_image_selector_placeholder')}
                    onChange={(e) => {
                      const clone = produce(limitArea, (draft) => {
                        draft.selector.image = e.target.value
                      })
                      set_limitArea(clone)
                    }}
                  />
                  <GrayScaleOutline
                    {...questionCss}
                    onMouseEnter={() => {
                      set_tooltipText(lang('limit_area_image_selector_tooltip'))
                    }}
                    onMouseLeave={() => {
                      set_tooltipText(null)
                    }}
                  >
                    <FaQuestion />
                  </GrayScaleOutline>
                </div>
              </E.ListItem>
              <E.ListItem>
                <label>{lang('video_selector')}</label>
                <div>
                  <P.FilledInput
                    type="text"
                    value={limitArea.selector.video}
                    placeholder={lang('limit_area_video_selector_placeholder')}
                    onChange={(e) => {
                      const clone = produce(limitArea, (draft) => {
                        draft.selector.video = e.target.value
                      })
                      set_limitArea(clone)
                    }}
                  />
                  <GrayScaleOutline
                    {...questionCss}
                    onMouseEnter={() => {
                      set_tooltipText(lang('limit_area_video_selector_tooltip'))
                    }}
                    onMouseLeave={() => {
                      set_tooltipText(null)
                    }}
                  >
                    <FaQuestion />
                  </GrayScaleOutline>
                </div>
              </E.ListItem>
            </>
          )}
        </E.List>
        <S.BottomWrap>
          <div>
            <PrimaryButton
              _mini
              disabled={
                !limitArea.name || !limitArea.host || !limitArea.selector.parent
              }
              onClick={() => {
                const clone = produce(settingState, (draft) => {
                  if (!limitArea.id) {
                    const sameHosts = settingState.limitBySelector.filter(
                      (item) => item.host === limitArea.host
                    )
                    const checkSameValue = sameHosts.some(
                      (item) =>
                        item.selector.parent === limitArea.selector.parent &&
                        item.selector.image === limitArea.selector.image &&
                        item.selector.video === limitArea.selector.video
                    )
                    if (sameHosts.length > 0 && checkSameValue) {
                      return alert(lang('alert_same_value'))
                    }
                    draft.limitBySelector.push({
                      ...limitArea,
                      id: v4(),
                      active: true,
                    })
                  } else {
                    draft.limitBySelector = draft.limitBySelector.map(
                      (item) => {
                        if (item.id === limitArea.id) {
                          return limitArea
                        }
                        return item
                      }
                    )
                  }
                })
                set_settingState(clone)
                chrome.storage.local.set({
                  limitBySelector: clone.limitBySelector,
                })
                onClose && onClose()
              }}
            >
              {lang('save')}
            </PrimaryButton>
          </div>
          <div>
            <WhiteFill
              _mini
              onClick={() => {
                set_extraSetting((prev) => !prev)
              }}
            >
              {extraSetting ? <FaCaretUp /> : <FaCaretDown />}
              {lang('extra_setting')}
            </WhiteFill>
          </div>
        </S.BottomWrap>
      </S.EditItemColumn>
    </>
  )
}
export default EditLimitArea
