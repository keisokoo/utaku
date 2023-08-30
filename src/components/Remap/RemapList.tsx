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
            <F.ItemRow key={item.id}>
              <F.Row>
                <Checkbox
                  active={selected.includes(item.id)}
                  onClick={() => {
                    if (selected.includes(item.id)) {
                      setSelected(selected.filter((curr) => curr !== item.id))
                    } else {
                      setSelected([...selected, item.id])
                    }
                  }}
                />
                <F.Name>{item.name}</F.Name>
              </F.Row>
              <F.Buttons>
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
                      applyRemapList: settingState.applyRemapList.filter(
                        (curr) => curr !== item.id
                      ),
                    })
                    if (chrome?.storage)
                      chrome.storage.local.set({
                        remapList: settingState.remapList.filter(
                          (curr) => curr.id !== item.id
                        ),
                        applyRemapList: settingState.applyRemapList.filter(
                          (curr) => curr !== item.id
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
