import React, { useMemo, useState } from 'react'
import { useRecoilState } from 'recoil'
import { settings } from '../../atoms/settings'
import { lang } from '../../utils'
import { GrayScaleFill, PrimaryButton } from '../Buttons'
import ModalBody from '../Modal/ModalBody'
import Editor from './Editor'
import RemapList from './RemapList'
import { RemapBodyMode } from './Remaps.type'

interface RemapsProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {
  applyRemapList: string[]
  emitRemap: (selected: string[]) => void
  onClose?: () => void
}
const Remaps = ({ applyRemapList, emitRemap, ...props }: RemapsProps) => {
  const [mode, set_mode] = useState<RemapBodyMode>(null)
  const [selected, set_selected] = useState<string[]>(applyRemapList)
  const [settingState] = useRecoilState(settings)
  const currentRemap = useMemo(() => {
    if (!mode) return null
    if (typeof mode === 'string') return null
    return settingState.remapList.find((item) => item.id === mode?.id)
  }, [settingState.remapList, mode])
  return (
    <>
      <ModalBody
        title={lang('url_remap_list')}
        btn={
          <>
            {mode !== null && (
              <>
                <GrayScaleFill
                  _mini
                  onClick={() => {
                    set_mode(null)
                  }}
                >
                  {lang('prev')}
                </GrayScaleFill>
              </>
            )}
            {mode === null && (
              <>
                <PrimaryButton
                  _mini
                  onClick={() => {
                    set_mode('add')
                  }}
                >
                  {lang('add')}
                </PrimaryButton>
              </>
            )}
          </>
        }
        {...props}
      >
        {mode === null && (
          <RemapList
            selected={selected}
            setSelected={(val) => set_selected(val)}
            setRemapMode={(val) => set_mode(val)}
            handleApply={() => {
              emitRemap(selected)
              if (props.onClose) props.onClose()
            }}
          />
        )}
        {mode !== null && (
          <Editor
            mode={currentRemap ? 'edit' : 'add'}
            remapItem={currentRemap}
            onClose={() => {
              set_mode(null)
            }}
          />
        )}
      </ModalBody>
    </>
  )
}
export default Remaps
