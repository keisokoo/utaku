import React from 'react'

import { produce } from 'immer'
import { useRecoilState } from 'recoil'
import { settings } from '../../atoms/settings'
import { lang } from '../../utils'
import {
  GrayScaleFill,
  PrimaryButton,
  SecondaryButton,
  WhiteFill,
} from '../Buttons'
import { NoticeType } from '../Modal/Modal.types'
import { ListTableStyle } from '../PopupStyles/ListTableStyle'
import { LiveStyles } from '../PopupStyles/LiveStyles'
import Toggle from '../Toggle/Toggle'
import { RemapBodyMode } from './Remaps.type'

const L = ListTableStyle
const Live = LiveStyles
interface RemapListProps {
  setRemapMode: (mode: RemapBodyMode) => void
  setNotice?: (notice: NoticeType) => void
}
const RemapList = ({ setRemapMode, setNotice }: RemapListProps) => {
  const [settingState, set_settingState] = useRecoilState(settings)
  return (
    <L.BodyWrap>
      <div>
        <L.Grid>
          <L.Column className="a">
            <L.Label>{lang('enable')}</L.Label>
          </L.Column>
          <L.Column className="b">
            <L.Label>{lang('name')}</L.Label>
          </L.Column>
          <L.Column className="c">
            <L.Label>{lang('setting')}</L.Label>
          </L.Column>
        </L.Grid>
        <L.List>
          {settingState.remapList.length === 0 && (
            <L.NotFound>{lang('empty_remap')}</L.NotFound>
          )}
          {settingState.remapList.map((item) => {
            return (
              <L.Row key={item.id} data-disabled={!item.active}>
                <L.Column className="a">
                  <L.StatusBox>
                    <Toggle
                      active={item.active}
                      onClick={() => {
                        const clone = produce(settingState, (draft) => {
                          draft.remapList = draft.remapList.map((curr) => {
                            if (curr.id === item.id) {
                              curr.active = !curr.active
                            }
                            return curr
                          })
                        })
                        set_settingState(clone)
                        chrome.storage.local.set({
                          remapList: clone.remapList,
                        })
                      }}
                    />
                  </L.StatusBox>
                </L.Column>
                <L.Column className="b">
                  <L.SummaryBox>
                    <L.SummaryContent>{item.name}</L.SummaryContent>
                  </L.SummaryBox>
                </L.Column>
                <L.Column className="c">
                  <L.Buttons>
                    <GrayScaleFill
                      _mini
                      onClick={() => {
                        setRemapMode({ id: item.id })
                      }}
                    >
                      {lang('edit')}
                    </GrayScaleFill>
                    <WhiteFill
                      _mini
                      onClick={() => {
                        set_settingState({
                          ...settingState,
                          remapList: settingState.remapList.filter(
                            (curr) => curr.id !== item.id
                          ),
                        })
                        if (chrome?.storage)
                          chrome.storage.local.set({
                            remapList: settingState.remapList.filter(
                              (curr) => curr.id !== item.id
                            ),
                          })
                      }}
                    >
                      {lang('delete')}
                    </WhiteFill>
                  </L.Buttons>
                </L.Column>
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
                draft.remapList = draft.remapList.map((curr) => {
                  curr.active = true
                  return curr
                })
              })
              set_settingState(clone)
              chrome.storage.local.set({
                remapList: clone.remapList,
              })
            }}
          >
            {lang('all_enable')}
          </PrimaryButton>
          <SecondaryButton
            _mini
            onClick={() => {
              const clone = produce(settingState, (draft) => {
                draft.remapList = draft.remapList.map((curr) => {
                  curr.active = false
                  return curr
                })
              })
              set_settingState(clone)
              chrome.storage.local.set({
                remapList: clone.remapList,
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
                      draft.remapList = []
                    })
                    set_settingState(clone)
                    chrome.storage.local.set({
                      remapList: clone.remapList,
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
            data-active={settingState.live.remap}
            onClick={() => {
              const clone = produce(settingState, (draft) => {
                draft.live.remap = !draft.live.remap
              })
              set_settingState(clone)
              chrome.storage.local.set({
                live: clone.live,
              })
            }}
          >
            Live mode{' '}
            {settingState.live.remap ? (
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
  )
}
export default RemapList
