import React from 'react'

import { useRecoilState } from 'recoil'
import { settings } from '../../atoms/settings'
import { lang } from '../../utils'
import { GrayScaleFill, SecondaryButton, WhiteFill } from '../Buttons'
import Checkbox from '../Checkbox/Checkbox'
import { RemapStyle } from './Remaps.styled'
import { RemapBodyMode } from './Remaps.type'
const F = RemapStyle
interface RemapListProps {
  selected: string[]
  setSelected: (selected: string[]) => void
  setRemapMode: (mode: RemapBodyMode) => void
  handleApply: () => void
}
const RemapList = ({
  selected,
  setRemapMode,
  setSelected,
  handleApply,
}: RemapListProps) => {
  const [settingState, set_settingState] = useRecoilState(settings)
  return (
    <>
      <F.NameList>
        {settingState.remapList.length === 0 && (
          <F.ItemRow>
            <F.Name>{lang('empty_remap')}</F.Name>
          </F.ItemRow>
        )}
        {settingState.remapList.map((item) => {
          return (
            <F.ItemRow key={item.name}>
              <F.Row>
                <Checkbox
                  active={selected.includes(item.name)}
                  onClick={() => {
                    if (selected.includes(item.name)) {
                      setSelected(selected.filter((curr) => curr !== item.name))
                    } else {
                      setSelected([...selected, item.name])
                    }
                  }}
                />
                <F.Name>{item.name}</F.Name>
              </F.Row>
              <F.Buttons>
                <GrayScaleFill
                  _mini
                  onClick={() => {
                    setRemapMode({ name: item.name })
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
                        (curr) => curr.name !== item.name
                      ),
                    })
                    if (chrome?.storage)
                      chrome.storage.sync.set({
                        remapList: settingState.remapList.filter(
                          (curr) => curr.name !== item.name
                        ),
                      })
                  }}
                >
                  {lang('delete')}
                </WhiteFill>
              </F.Buttons>
            </F.ItemRow>
          )
        })}
      </F.NameList>
      <F.BottomList>
        <SecondaryButton
          _mini
          onClick={() => {
            handleApply()
          }}
        >
          {lang('apply')}
        </SecondaryButton>
      </F.BottomList>
    </>
  )
}
export default RemapList
