import React, { useMemo, useState } from 'react'
import { FaPlus } from 'react-icons/fa'
import { useRecoilState } from 'recoil'
import { settings } from '../../atoms/settings'
import { lang } from '../../utils'
import { SecondaryButton } from '../Buttons'
import { NoticeType } from '../Modal/Modal.types'
import ModalBody from '../Modal/ModalBody'
import RemapList from './RemapList'
import { RemapBodyMode } from './Remaps.type'
import StepEditor from './StepEditor'

interface RemapsProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {
  onClose?: () => void
  setNotice?: (notice: NoticeType) => void
}
const Remaps = ({ onClose, setNotice, ...props }: RemapsProps) => {
  const [mode, set_mode] = useState<RemapBodyMode>(null)
  const [settingState] = useRecoilState(settings)
  const currentRemap = useMemo(() => {
    if (!mode) return null
    if (typeof mode === 'string') return null
    return settingState.remapList.find((item) => item.id === mode?.id)
  }, [settingState.remapList, mode])
  return (
    <>
      {/* 목록 */}
      {mode === null && (
        <ModalBody
          title={lang('url_remap_list')}
          fixed={!!currentRemap}
          style={{ width: '600px' }}
          onClose={() => {
            onClose && onClose()
          }}
          btn={
            <>
              <SecondaryButton
                _mini
                onClick={() => {
                  set_mode('add')
                }}
              >
                <FaPlus />
                {lang('add')}
              </SecondaryButton>
            </>
          }
          {...props}
        >
          <RemapList
            setNotice={setNotice}
            setRemapMode={(val) => set_mode(val)}
          />
        </ModalBody>
      )}
      {/* 추가, 편집 */}
      {mode !== null && (
        <ModalBody
          title={currentRemap ? lang('url_remap_edit') : lang('url_remap_add')}
          fixed={!!currentRemap}
          onClose={() => {
            set_mode(null)
          }}
          {...props}
        >
          <StepEditor
            mode={currentRemap ? 'edit' : 'add'}
            remapItem={currentRemap}
            onClose={() => {
              set_mode(null)
            }}
          />
        </ModalBody>
      )}
    </>
  )
}
export default Remaps
