import { css } from '@emotion/react'
import classNames from 'classnames'
import { produce } from 'immer'
import { uniqBy } from 'lodash-es'
import React, { useState } from 'react'
import { FaCaretDown, FaCaretUp, FaCog, FaQuestionCircle } from 'react-icons/fa'
import { useRecoilState } from 'recoil'
import {
  RemapSettingsType,
  isRemapSettingsType,
  settings,
} from '../../atoms/settings'
import {
  exportSettingsByJson,
  lang,
  limitBySelectorRequireCheckAndParsing,
  mergeByIds,
  remapListRequireCheckAndParsing,
} from '../../utils'
import { masterSettings } from '../../utils/sources'
import { GrayScaleOutline, PrimaryButton, WhiteFill } from '../Buttons'
import FileButton from '../FileButton/FileButton'
import LimitArea from '../LimitArea/LimitArea'
import Modal from '../Modal/Modal'
import { NoticeType } from '../Modal/Modal.types'
import ModalBody from '../Modal/ModalBody'
import { ListTableStyle } from '../PopupStyles/ListTableStyle'
import { LiveStyles } from '../PopupStyles/LiveStyles'
import { PopupStyles } from '../PopupStyles/PopupStyles'
import Remaps from '../Remap/Remaps'
import Toggle from '../Toggle/Toggle'
import Tooltip from '../Tooltip'
import ExtraRowItem from './ExtraRowItem'
const S = PopupStyles
const L = ListTableStyle
const Live = LiveStyles
interface SettingsProps {
  target?: string
}
const Settings = ({ target }: SettingsProps) => {
  const [onOff, set_onOff] = useState<boolean>(false)
  const [settingState, set_settingState] = useRecoilState(settings)
  const [openModal, set_openModal] = useState<boolean>(false)
  const [settingModal, set_settingModal] = useState<
    'remaps' | null | 'limit-selector'
  >(null)
  const [tooltipText, set_tooltipText] = useState<string | null>(null)
  const [extraSetting, set_extraSetting] = useState<boolean>(false)
  const [notice, set_notice] = useState<null | NoticeType>(null)

  if (notice) {
    return (
      <Modal
        {...(target && { target })}
        open={notice !== null}
        onClose={() => set_notice(null)}
      >
        <ModalBody
          $css={css`
            min-width: 400px;
            .modal-header {
              padding-top: 32px;
              .modal-title {
                font-size: 20px;
              }
            }
            .modal-body {
              padding-bottom: 16px;
              & > div:first-of-type {
                text-align: center;
                padding: 16px 0;
                white-space: pre-line;
              }
            }
          `}
          title={notice.title}
          removeClose={true}
          onClose={() => set_notice(null)}
        >
          <div>{notice.content}</div>
          <S.NoticeBottom>
            <GrayScaleOutline
              onClick={() => {
                set_notice(null)
              }}
            >
              {lang('cancel')}
            </GrayScaleOutline>
            <PrimaryButton
              onClick={() => {
                notice.onClick()
                set_notice(null)
              }}
            >
              {lang('confirm')}
            </PrimaryButton>
          </S.NoticeBottom>
        </ModalBody>
      </Modal>
    )
  }
  return (
    <>
      {settingModal && (
        <Modal
          {...(target && { target })}
          className={classNames({ hide: onOff })}
          open={true}
          onClose={() => set_settingModal(null)}
        >
          {settingModal === 'remaps' && (
            <Remaps setNotice={(val) => set_notice(val)} />
          )}
          {settingModal === 'limit-selector' && (
            <LimitArea
              emitOnOff={set_onOff}
              setNotice={(val) => set_notice(val)}
            />
          )}
        </Modal>
      )}
      {settingModal === null && (
        <Modal
          {...(target && { target })}
          open={openModal}
          onClose={() => set_openModal(false)}
        >
          <ModalBody
            title="설정"
            style={{ width: '600px' }}
            onClose={() => set_openModal(false)}
          >
            <>
              <L.FlexTitle>
                <h1>{lang('setting_title')}</h1>
                <FaQuestionCircle
                  onMouseEnter={() => {
                    set_tooltipText(lang('settings_tooltip'))
                  }}
                  onMouseLeave={() => {
                    set_tooltipText(null)
                  }}
                />
              </L.FlexTitle>
              <S.SettingsWrap>
                <L.Wrap>
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
                  <L.List>
                    <L.SettingsRow>
                      <L.SettingColumn
                        className="a"
                        data-active={settingState.live.remap}
                        onClick={() => {
                          const clone = produce(settingState, (draft) => {
                            draft.live.remap = !draft.live.remap
                          })
                          set_settingState(clone)
                          chrome.storage.sync.set({
                            live: clone.live,
                          })
                        }}
                      >
                        {settingState.live.remap && (
                          <>
                            <Live.CircleActive />
                            live on
                          </>
                        )}
                        {!settingState.live.remap && (
                          <>
                            <Live.Circle />
                            live off
                          </>
                        )}
                      </L.SettingColumn>
                      <L.SettingColumn
                        className="b"
                        onClick={() => {
                          set_settingModal('remaps')
                        }}
                      >
                        <L.SummaryBox>
                          <L.SummaryContent>{lang('remaps')}</L.SummaryContent>
                          <L.CountBox>
                            (
                            {
                              settingState.remapList.filter(
                                (item) => item.active
                              ).length
                            }
                            /{settingState.remapList.length})
                          </L.CountBox>
                        </L.SummaryBox>
                      </L.SettingColumn>
                    </L.SettingsRow>
                    <L.SettingsRow>
                      <L.SettingColumn
                        className="a"
                        data-active={settingState.live.filter}
                        onClick={() => {
                          const clone = produce(settingState, (draft) => {
                            draft.live.filter = !draft.live.filter
                          })
                          set_settingState(clone)
                          chrome.storage.sync.set({
                            live: clone.live,
                          })
                        }}
                      >
                        {settingState.live.filter && (
                          <>
                            <Live.CircleActive />
                            live on
                          </>
                        )}
                        {!settingState.live.filter && (
                          <>
                            <Live.Circle />
                            live off
                          </>
                        )}
                      </L.SettingColumn>
                      <L.SettingColumn
                        className="b"
                        onClick={() => {
                          set_settingModal('limit-selector')
                        }}
                      >
                        <L.SummaryBox>
                          <L.SummaryContent>
                            {lang('limit_filters')}
                          </L.SummaryContent>
                          <L.CountBox>
                            (
                            {
                              settingState.limitBySelector.filter(
                                (item) => item.active
                              ).length
                            }
                            /{settingState.limitBySelector.length})
                          </L.CountBox>
                        </L.SummaryBox>
                      </L.SettingColumn>
                    </L.SettingsRow>
                  </L.List>
                </L.Wrap>
              </S.SettingsWrap>
              {extraSetting && (
                <>
                  <L.FlexTitle>
                    <h1>{lang('extra_setting')}</h1>
                  </L.FlexTitle>
                  <S.SettingsWrap>
                    <L.Wrap>
                      <L.SettingColumn>
                        <ExtraRowItem
                          label={lang('collect_svg_element')}
                          content={
                            <Toggle
                              active={settingState.extraOptions.useSvgElement}
                              onClick={() => {
                                const clone = produce(settingState, (draft) => {
                                  draft.extraOptions.useSvgElement =
                                    !draft.extraOptions.useSvgElement
                                })
                                set_settingState(clone)
                                chrome.storage.sync.set({
                                  extraOptions: clone.extraOptions,
                                })
                              }}
                            />
                          }
                          tooltip={lang('collect_svg_element_tooltip')}
                          handleTooltip={(str) => {
                            set_tooltipText(str)
                          }}
                        />
                        <ExtraRowItem
                          label={lang('collect_anchor_element')}
                          content={
                            <Toggle
                              active={
                                settingState.extraOptions.useAnchorElement
                              }
                              onClick={() => {
                                const clone = produce(settingState, (draft) => {
                                  draft.extraOptions.useAnchorElement =
                                    !draft.extraOptions.useAnchorElement
                                })
                                set_settingState(clone)
                                chrome.storage.sync.set({
                                  extraOptions: clone.extraOptions,
                                })
                              }}
                            />
                          }
                          tooltip={lang('collect_anchor_element_tooltip')}
                          handleTooltip={(str) => {
                            set_tooltipText(str)
                          }}
                        />
                        <ExtraRowItem
                          label={lang('use_remap_on_select')}
                          content={
                            <Toggle
                              active={settingState.extraOptions.remapOnSelect}
                              onClick={() => {
                                const clone = produce(settingState, (draft) => {
                                  draft.extraOptions.remapOnSelect =
                                    !draft.extraOptions.remapOnSelect
                                })
                                set_settingState(clone)
                                chrome.storage.sync.set({
                                  extraOptions: clone.extraOptions,
                                })
                              }}
                            />
                          }
                          tooltip={lang('collect_remap_on_select_tooltip')}
                          handleTooltip={(str) => {
                            set_tooltipText(str)
                          }}
                        />
                        <ExtraRowItem
                          label={lang('replace_to_master_setting')}
                          content={
                            <GrayScaleOutline
                              _mini
                              onClick={() => {
                                set_notice({
                                  title: lang('alert'),
                                  content: (
                                    <>
                                      <S.NoticeContents>
                                        {lang(
                                          'replace_to_master_setting_tooltip'
                                        )}
                                      </S.NoticeContents>
                                    </>
                                  ),
                                  onClick: () => {
                                    const clone = produce(
                                      settingState,
                                      (draft) => {
                                        draft.remapList =
                                          masterSettings.remapList
                                        draft.limitBySelector =
                                          masterSettings.limitBySelector
                                      }
                                    )
                                    set_settingState(clone)
                                    chrome.storage.sync.set({
                                      remapList: clone.remapList,
                                      limitBySelector: clone.limitBySelector,
                                    })
                                  },
                                })
                              }}
                            >
                              {lang('replace_to_master_setting')}
                            </GrayScaleOutline>
                          }
                          tooltip={lang('replace_to_master_setting_tooltip')}
                          handleTooltip={(str) => {
                            set_tooltipText(str)
                          }}
                        />
                      </L.SettingColumn>
                    </L.Wrap>
                  </S.SettingsWrap>
                </>
              )}
              <L.Bottom>
                <div>
                  <GrayScaleOutline
                    _mini
                    onClick={() => {
                      const clone = {
                        remapList: settingState.remapList,
                        limitBySelector: settingState.limitBySelector,
                      }
                      exportSettingsByJson(clone)
                    }}
                  >
                    {lang('export_settings')}
                  </GrayScaleOutline>
                  <FileButton
                    _mini
                    accept=".json"
                    onChange={(event) => {
                      if (!event?.currentTarget?.files) return
                      const file = event.currentTarget.files[0]

                      if (
                        file.type !== 'application/json' ||
                        !file.name.endsWith('.json')
                      ) {
                        alert('Please select a JSON file.')
                        return
                      }
                      const reader = new FileReader()
                      reader.onload = function (e) {
                        if (!e.target) return
                        const importedSettingsJSON = e.target.result as string
                        const importedSettings = JSON.parse(
                          importedSettingsJSON
                        ) as RemapSettingsType
                        const checkType = isRemapSettingsType(importedSettings)
                        if (checkType) {
                          const remapParsed = remapListRequireCheckAndParsing(
                            importedSettings.remapList
                          )
                          const limitBySelectorParsed =
                            limitBySelectorRequireCheckAndParsing(
                              importedSettings.limitBySelector
                            )
                          if (remapParsed.errorCount > 0) {
                            alert(remapParsed.errorResult.join('\n'))
                          }
                          if (limitBySelectorParsed.errorCount > 0) {
                            alert(limitBySelectorParsed.errorResult.join('\n'))
                          }
                          const parsed = {
                            remapList: uniqBy(
                              remapParsed.result,
                              (item) => item.id
                            ),
                            limitBySelector: uniqBy(
                              limitBySelectorParsed.result,
                              (item) => item.id
                            ),
                          }
                          const clone = produce(settingState, (draft) => {
                            draft.remapList = mergeByIds(
                              settingState.remapList,
                              parsed.remapList
                            )
                            draft.limitBySelector = mergeByIds(
                              settingState.limitBySelector,
                              parsed.limitBySelector
                            )
                          })
                          set_settingState(clone)
                          chrome.storage.sync.set({
                            remapList: clone.remapList,
                            limitBySelector: clone.limitBySelector,
                          })
                        }
                      }

                      reader.readAsText(file)
                    }}
                  >
                    {lang('import_settings')}
                    <FaQuestionCircle
                      onMouseEnter={() => {
                        set_tooltipText(lang('import_settings_tooltip'))
                      }}
                      onMouseLeave={() => {
                        set_tooltipText(null)
                      }}
                    />
                  </FileButton>
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
              </L.Bottom>
            </>
          </ModalBody>
        </Modal>
      )}
      <WhiteFill
        _mini
        onClick={() => {
          set_openModal(true)
        }}
      >
        {settingState.live.filter || settingState.live.remap ? (
          <Live.CircleActive />
        ) : (
          <FaCog />
        )}
        {lang('setting')}
      </WhiteFill>
      <Live.Wrap style={{ display: 'none' }}>
        <label>Live</label>
        <Live.Status
          onClick={() => {
            set_openModal(true)
          }}
          data-active={settingState.live.filter || settingState.live.remap}
        >
          {settingState.live.filter || settingState.live.remap ? (
            <>
              {Object.keys(settingState.live)
                .filter((item) => {
                  return settingState.live[
                    item as keyof typeof settingState.live
                  ]
                })
                .join(', ')}
            </>
          ) : (
            'Off'
          )}
        </Live.Status>
      </Live.Wrap>
    </>
  )
}
export default Settings
