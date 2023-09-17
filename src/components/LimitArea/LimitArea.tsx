import { css } from '@emotion/react'
import { produce } from 'immer'
import React, { useState } from 'react'
import { FaCaretDown, FaEdit, FaPlus, FaTrash } from 'react-icons/fa'
import { useRecoilState } from 'recoil'
import { LimitBySelectorType, settings } from '../../atoms/settings'
import { lang } from '../../utils'
import {
  GrayScaleFill,
  GrayScaleOutline,
  PrimaryButton,
  SecondaryButton,
} from '../Buttons'
import { NoticeType } from '../Modal/Modal.types'
import ModalBody from '../Modal/ModalBody'
import { ListTableStyle } from '../PopupStyles/ListTableStyle'
import { LiveStyles } from '../PopupStyles/LiveStyles'
import { PopupStyles } from '../PopupStyles/PopupStyles'
import Toggle from '../Toggle/Toggle'
import EditLimitArea from './EditLimitArea'

const S = PopupStyles
const L = ListTableStyle
const Live = LiveStyles
interface LimitAreaProps {
  emitOnOff: (bool: boolean) => void
  onClose?: () => void
  setNotice?: (notice: NoticeType) => void
}
const LimitArea = ({ emitOnOff, onClose, setNotice }: LimitAreaProps) => {
  const [settingState, set_settingState] = useRecoilState(settings)
  const { limitBySelector } = settingState
  const [selector, set_selector] = useState<LimitBySelectorType | null>(null)
  const [expanderId, set_expanderId] = useState<string | null>(null)
  return (
    <>
      {selector && (
        <ModalBody
          style={{ width: '800px' }}
          title={lang('edit_limit_area')}
          onClose={() => {
            set_selector(null)
          }}
        >
          <EditLimitArea
            emitOnOff={emitOnOff}
            limitArea={selector}
            onClose={() => {
              set_selector(null)
            }}
          />
        </ModalBody>
      )}
      {!selector && (
        <ModalBody
          style={{ width: '600px' }}
          onClose={onClose}
          title={lang('limit_area_list')}
          btn={
            <>
              <SecondaryButton
                _mini
                onClick={() => {
                  set_selector({
                    id: '',
                    name: '',
                    host: '',
                    active: false,
                    selector: {
                      parent: '',
                      image: '',
                      video: '',
                    },
                  })
                }}
              >
                <FaPlus />
                {lang('add')}
              </SecondaryButton>
            </>
          }
        >
          <L.BodyWrap>
            <div>
              <L.Grid>
                <L.Column data-utaku-grid-item="a">
                  <L.Label>{lang('enable')}</L.Label>
                </L.Column>
                <L.Column data-utaku-grid-item="b">
                  <L.Label>{lang('name')}</L.Label>
                </L.Column>
                <L.Column data-utaku-grid-item="c">
                  <L.Label>{lang('setting')}</L.Label>
                </L.Column>
              </L.Grid>
              <L.List>
                {limitBySelector.length === 0 && (
                  <>
                    <L.NotFound>Not Found Data</L.NotFound>
                  </>
                )}
                {limitBySelector.map((item) => {
                  return (
                    <L.Row key={item.id} data-disabled={!item.active}>
                      <L.Column data-utaku-grid-item="a">
                        <L.StatusBox>
                          <Toggle
                            active={item.active}
                            onClick={() => {
                              const clone = produce(settingState, (draft) => {
                                draft.limitBySelector =
                                  draft.limitBySelector.map((item2) => {
                                    if (item2.id === item.id) {
                                      item2.active = !item2.active
                                    }
                                    return item2
                                  })
                              })
                              set_settingState(clone)
                              chrome.storage.local.set({
                                limitBySelector: clone.limitBySelector,
                              })
                            }}
                          />
                        </L.StatusBox>
                      </L.Column>
                      <L.Column data-utaku-grid-item="b">
                        <L.SummaryBox>
                          <L.SummaryContent>{item.name}</L.SummaryContent>
                          <GrayScaleOutline
                            $css={css`
                              padding: 0px;
                              width: 30px;
                              height: 30px;
                              border-radius: 50%;
                              flex-shrink: 0;
                              &:hover {
                                svg {
                                  transform: rotate(-180deg);
                                }
                              }
                              svg {
                                transition: 0.3s ease-in;
                                transform: rotate(0deg);
                                &[data-reverse='true'] {
                                  transform: rotate(-180deg);
                                  &:hover {
                                    transform: rotate(0deg);
                                  }
                                }
                              }
                            `}
                            onClick={() => {
                              if (expanderId === item.id) {
                                set_expanderId(null)
                              } else {
                                set_expanderId(item.id)
                              }
                            }}
                          >
                            <FaCaretDown
                              data-reverse={expanderId === item.id}
                            />
                          </GrayScaleOutline>
                        </L.SummaryBox>
                      </L.Column>
                      <L.Column data-utaku-grid-item="c">
                        <L.Buttons>
                          <SecondaryButton
                            _mini
                            onClick={() => {
                              set_selector(item)
                            }}
                          >
                            <FaEdit />
                            {lang('edit')}
                          </SecondaryButton>
                          <GrayScaleFill
                            _mini
                            onClick={() => {
                              const clone = produce(settingState, (draft) => {
                                draft.limitBySelector =
                                  draft.limitBySelector.filter(
                                    (item2) => item2.id !== item.id
                                  )
                              })
                              set_settingState(clone)
                              chrome.storage.local.set({
                                limitBySelector: clone.limitBySelector,
                              })
                            }}
                          >
                            <FaTrash />
                            {lang('delete')}
                          </GrayScaleFill>
                        </L.Buttons>
                      </L.Column>
                      <L.Content data-active={expanderId === item.id}>
                        <div>
                          <label>{lang('host')}</label>
                          <div>
                            <S.SelectorItem>{item.host}</S.SelectorItem>
                          </div>
                        </div>
                        <div>
                          <div>
                            {item.selector.parent && (
                              <div>
                                <label>{lang('parent_selector')}</label>
                                <div>
                                  <S.SelectorItem>
                                    {item.selector.parent}
                                  </S.SelectorItem>
                                </div>
                              </div>
                            )}
                            {item.selector.image && (
                              <div>
                                <label>{lang('image_selector')}</label>
                                <div>
                                  <S.SelectorItem>
                                    {item.selector.image}
                                  </S.SelectorItem>
                                </div>
                              </div>
                            )}
                            {item.selector.video && (
                              <div>
                                <label>{lang('video_selector')}</label>
                                <div>
                                  <S.SelectorItem>
                                    {item.selector.video}
                                  </S.SelectorItem>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </L.Content>
                    </L.Row>
                  )
                })}
              </L.List>
            </div>
            <L.Bottom>
              <div>
                <PrimaryButton
                  _mini
                  onClick={() => {
                    const clone = produce(settingState, (draft) => {
                      draft.limitBySelector = draft.limitBySelector.map(
                        (curr) => {
                          curr.active = true
                          return curr
                        }
                      )
                    })
                    set_settingState(clone)
                    chrome.storage.local.set({
                      limitBySelector: clone.limitBySelector,
                    })
                  }}
                >
                  {lang('all_enable')}
                </PrimaryButton>
                <SecondaryButton
                  _mini
                  onClick={() => {
                    const clone = produce(settingState, (draft) => {
                      draft.limitBySelector = draft.limitBySelector.map(
                        (curr) => {
                          curr.active = false
                          return curr
                        }
                      )
                    })
                    set_settingState(clone)
                    chrome.storage.local.set({
                      limitBySelector: clone.limitBySelector,
                    })
                  }}
                >
                  {lang('all_disable')}
                </SecondaryButton>
                <GrayScaleFill
                  _mini
                  onClick={() => {
                    setNotice &&
                      setNotice({
                        title: lang('alert'),
                        content: lang('all_delete_confirm'),
                        onClick: () => {
                          const clone = produce(settingState, (draft) => {
                            draft.limitBySelector = []
                          })
                          set_settingState(clone)
                          chrome.storage.local.set({
                            limitBySelector: clone.limitBySelector,
                          })
                        },
                      })
                  }}
                >
                  {lang('all_delete')}
                </GrayScaleFill>
              </div>
              <div>
                <Live.Status
                  data-active={settingState.live.filter}
                  onClick={() => {
                    const clone = produce(settingState, (draft) => {
                      draft.live.filter = !draft.live.filter
                    })
                    set_settingState(clone)
                    chrome.storage.local.set({ live: clone.live })
                  }}
                >
                  Live mode{' '}
                  {settingState.live.filter ? (
                    <>
                      on
                      <Live.CircleActive />
                    </>
                  ) : (
                    <>
                      off
                      <Live.Circle />
                    </>
                  )}
                </Live.Status>
              </div>
            </L.Bottom>
          </L.BodyWrap>
        </ModalBody>
      )}
    </>
  )
}
export default LimitArea
