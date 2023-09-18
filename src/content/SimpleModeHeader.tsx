import { css } from '@emotion/react'
import { produce } from 'immer'
import React from 'react'
import {
  FaCompactDisc,
  FaQuestion,
  FaRedo,
  FaRocket,
  FaTimes,
  FaVectorSquare,
} from 'react-icons/fa'
import { useRecoilState } from 'recoil'
import { modeType, settings } from '../atoms/settings'
import {
  GrayScaleFill,
  GrayScaleText,
  PrimaryButton,
  SecondaryButton,
} from '../components/Buttons'
import GetLimitArea from '../components/LimitArea/GetLimitArea'
import Settings from '../components/Settings/Settings'
import Tooltip from '../components/Tooltip'
import { lang } from '../utils'
import UtakuStyle from './Utaku.styled'
import { ItemType } from './types'

const tooltipStyle = {
  transform: 'translateY(calc(-100% - 4px))',
  borderRadius: '4px',
  boxShadow: '2px 3px 7px 0px #02020252',
}
const tooltipParentCss = css`
  [data-utaku-class='tooltip'] {
    display: none;
  }
  svg {
    transform: rotate(0deg);
    transition: 1s;
  }
  &:hover {
    svg {
      transform: rotate(360deg);
    }
    [data-utaku-class='tooltip'] {
      display: block;
    }
  }
`
interface SimpleModeHeaderProps {
  handleReload: (useRemap?: boolean) => void
  handleUi: (hideUi: boolean) => void
  handleItemList: (itemList: ItemType[]) => void
}
const SimpleModeHeader = ({
  handleReload,
  handleUi,
  handleItemList,
}: SimpleModeHeaderProps) => {
  const [settingState, set_settingState] = useRecoilState(settings)
  return (
    <>
      <UtakuStyle.SettingsRow>
        <UtakuStyle.Row>
          <GrayScaleText
            _mini
            onClick={() => {
              chrome.runtime.sendMessage({
                message: 'utaku-call-unmount',
              })
            }}
            $css={css`
              position: absolute;
              top: 0;
              transform: translate(-50%, -100%);
              left: 50%;
              background-color: rgb(0 0 0 / 50%);
              color: #fff;
              border-radius: 4px 4px 0 0;
              font-size: 10px;
              padding: 2px 8px 2px 6px;
              &:hover {
                background-color: #00000063;
              }
            `}
          >
            <FaTimes />
            {lang('close')}
          </GrayScaleText>
          <Settings />
        </UtakuStyle.Row>
        <UtakuStyle.Center>
          <GetLimitArea
            _icon
            _mini
            emitItemList={(value) => {
              handleItemList(value)
            }}
            emitOnOff={(value) => {
              handleUi(value)
            }}
            $css={tooltipParentCss}
            btnText={
              <>
                <Tooltip data-utaku-class="tooltip" style={tooltipStyle}>
                  {lang('only_selected_areas_are_collected')}
                </Tooltip>
                <FaVectorSquare />
              </>
            }
          />
          <PrimaryButton
            _icon
            _mini
            onClick={() => {
              handleReload()
            }}
            $css={tooltipParentCss}
          >
            <Tooltip data-utaku-class="tooltip" style={tooltipStyle}>
              {lang('reload')}
            </Tooltip>
            <FaRedo />
          </PrimaryButton>
          {!settingState.live.remap && (
            <SecondaryButton
              _icon
              _mini
              onClick={() => {
                handleReload(true)
              }}
              $css={tooltipParentCss}
            >
              <Tooltip data-utaku-class="tooltip" style={tooltipStyle}>
                {lang('re_collect_by_using_remap_configs')}
              </Tooltip>
              <FaCompactDisc />
            </SecondaryButton>
          )}
        </UtakuStyle.Center>
        <UtakuStyle.Right>
          <UtakuStyle.QualityController>
            <UtakuStyle.IconWrap>
              <FaRocket />
            </UtakuStyle.IconWrap>
            {modeType
              .filter((ii) => !!ii)
              .map((type) => (
                <div
                  key={type}
                  data-utaku-active={type === settingState.modeType}
                  onClick={() => {
                    if (type === 'simple') return
                    set_settingState(
                      produce((draft) => {
                        draft.modeType = type
                      })
                    )
                    chrome.runtime.sendMessage({
                      message: 'mode-change',
                      data: type,
                    })
                    window.location.reload()
                  }}
                >
                  {type}
                </div>
              ))}
          </UtakuStyle.QualityController>
          <GrayScaleFill
            _icon
            _mini
            onClick={() => {
              chrome.runtime.sendMessage({
                message: 'open-options',
              })
            }}
          >
            <FaQuestion />
          </GrayScaleFill>
        </UtakuStyle.Right>
      </UtakuStyle.SettingsRow>
    </>
  )
}
export default SimpleModeHeader
