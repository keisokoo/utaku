import classNames from 'classnames'
import { produce } from 'immer'
import React, { useMemo, useState } from 'react'
import { FaInfoCircle } from 'react-icons/fa'
import { useRecoilState } from 'recoil'
import { v4 } from 'uuid'
import {
  UrlRemapItem,
  initialUrlRemapItem,
  settings,
} from '../../atoms/settings'
import { isValidUrl, lang, parseUrlRemap } from '../../utils'
import { PrimaryButton, SecondaryButton, WhiteFill } from '../Buttons'
import { RemapStyle } from './Remaps.styled'
import { StepNameType, stepList } from './Remaps.type'
import EditParams from './components/EditParams'
import EditPathname from './components/EditPathname'
import EditReplace from './components/EditReplace'
import EditSubDomain from './components/EditSubDomain'
import MatchURL from './components/MatchURL'
import RemapName from './components/RemapName'
import URLReference from './components/URLReference'

const S = RemapStyle
interface EditorProps {
  mode: 'add' | 'edit'
  remapItem?: UrlRemapItem | null
  onClose?: () => void
}

const stepGuide = (target: StepNameType) => {
  const guideList = {
    reference_url: lang('reference_url_guidance'),
    name: lang('name_guidance'),
    host: lang('host_guidance'),
    sub_domain: lang('sub_domain_guidance'),
    params: lang('params_guidance'),
    path_change: lang('path_change_guidance'),
    replace: lang('replace_guidance'),
  } as { [key in StepNameType]: string }
  return guideList[target]
}

const stepRequired = {
  reference_url: true,
  name: true,
  host: true,
  sub_domain: false,
  params: false,
  path_change: false,
  replace: false,
} as { [key in StepNameType]: boolean }
const Editor = ({ mode, onClose, remapItem }: EditorProps) => {
  const [steps, set_steps] = useState<number>(0)
  const [currentRemap, set_currentRemap] = useState<UrlRemapItem>(
    remapItem ?? initialUrlRemapItem
  )
  const [viewResult, set_viewResult] = useState<boolean>(false)
  const [settingState, set_settingState] = useRecoilState(settings)
  const remap = currentRemap.item
  const remappedUrl = useMemo(() => {
    if (!currentRemap?.item?.reference_url) return null
    if (!isValidUrl(currentRemap?.item?.reference_url)) return null
    return parseUrlRemap(currentRemap.item, currentRemap.item.reference_url)
  }, [currentRemap.item])
  const nextDisabled = useMemo(() => {
    if (stepRequired[stepList[steps]]) {
      if (stepList[steps] === 'reference_url') {
        return !isValidUrl(currentRemap.item.reference_url)
      }
      if (stepList[steps] === 'name') {
        return currentRemap.name === ''
      }
      if (stepList[steps] === 'host') {
        return currentRemap.item.host === ''
      }
    }
    return false
  }, [steps, currentRemap])

  return (
    <S.EditorWrap>
      <div>
        <S.EditorList>
          {(stepList[steps] === 'name' || mode === 'edit') && (
            <RemapName
              name={currentRemap.name}
              emitValue={(value) => {
                set_currentRemap(
                  produce((draft) => {
                    draft.name = value
                  })
                )
              }}
            />
          )}
          {(stepList[steps] === 'reference_url' || mode === 'edit') && (
            <URLReference
              mode={mode}
              remapItem={currentRemap}
              emitValue={(value) => {
                set_currentRemap(value)
              }}
            />
          )}
          {(stepList[steps] === 'host' || mode === 'edit') && (
            <MatchURL
              host={remap.host}
              emitValue={(value) => {
                set_currentRemap(
                  produce((draft) => {
                    draft.item.host = value
                  })
                )
              }}
            />
          )}
          {(stepList[steps] === 'sub_domain' || mode === 'edit') && (
            <EditSubDomain
              sub_domain={remap.sub_domain}
              emitValue={(value) => {
                set_currentRemap(
                  produce((draft) => {
                    draft.item.sub_domain = value
                  })
                )
              }}
            />
          )}
          {(stepList[steps] === 'params' || mode === 'edit') && (
            <EditParams
              remapItem={currentRemap}
              emitValue={(value) => {
                set_currentRemap(value)
              }}
            />
          )}
          {(stepList[steps] === 'path_change' || mode === 'edit') && (
            <EditPathname
              remapItem={currentRemap}
              emitValue={(value) => {
                set_currentRemap(value)
              }}
            />
          )}
          {(stepList[steps] === 'replace' || mode === 'edit') && (
            <EditReplace
              remapItem={currentRemap}
              emitValue={(value) => {
                set_currentRemap(value)
              }}
            />
          )}
          <S.Guidance className={classNames(mode)}>
            <FaInfoCircle />
            <div>{stepList[steps] && stepGuide(stepList[steps])}</div>
          </S.Guidance>
        </S.EditorList>
      </div>
      <S.BottomList>
        {viewResult && remappedUrl && isValidUrl(remap.reference_url) && (
          <S.NextUrl className={classNames(mode)}>
            <div>{remappedUrl?.toString()}</div>
          </S.NextUrl>
        )}
        <S.ButtonList>
          {mode === 'edit' && (
            <S.Row>
              <SecondaryButton
                _mini
                disabled={
                  currentRemap.item.reference_url === '' ||
                  currentRemap.name === '' ||
                  currentRemap.item.host === ''
                }
                onClick={() => {
                  const clone = produce(settingState, (draft) => {
                    draft.remapList = draft.remapList.map((curr) => {
                      if (currentRemap && curr.id === currentRemap.id) {
                        return currentRemap
                      }
                      return curr
                    })
                  })
                  set_settingState(clone)
                  chrome.storage.sync.set({ remapList: clone.remapList })
                  onClose && onClose()
                }}
              >
                {lang('save')}
              </SecondaryButton>
            </S.Row>
          )}
          {mode === 'add' && (
            <S.Row>
              <PrimaryButton
                _mini
                disabled={steps === 0}
                onClick={() => {
                  set_steps(steps - 1 < 0 ? 0 : steps - 1)
                }}
              >
                {lang('prev')}
              </PrimaryButton>
              <SecondaryButton
                _mini
                onClick={() => {
                  set_steps(
                    steps + 1 > stepList.length - 1
                      ? stepList.length - 1
                      : steps + 1
                  )
                }}
                disabled={nextDisabled || steps >= stepList.length - 1}
              >
                {lang('next')}
              </SecondaryButton>
              {steps >= stepList.length - 1 && mode === 'add' && (
                <SecondaryButton
                  _mini
                  disabled={
                    currentRemap.name === '' || currentRemap.item.host === ''
                  }
                  onClick={() => {
                    set_settingState(
                      produce((draft) => {
                        draft.remapList.push({ ...currentRemap, id: v4() })
                      })
                    )
                    chrome.storage.sync.set({
                      remapList: [{ ...currentRemap, id: v4() }],
                    })
                    onClose && onClose()
                  }}
                >
                  {lang('enter')}
                </SecondaryButton>
              )}
            </S.Row>
          )}
          <S.Row>
            {remappedUrl && isValidUrl(remap.reference_url) && (
              <WhiteFill
                _mini
                onClick={() => {
                  set_viewResult((prev) => !prev)
                }}
              >
                {lang('view_result')}
              </WhiteFill>
            )}
          </S.Row>
        </S.ButtonList>
      </S.BottomList>
    </S.EditorWrap>
  )
}
export default Editor
