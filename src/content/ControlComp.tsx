import classNames from 'classnames'
import { produce } from 'immer'
import React, { useState } from 'react'
import { FaList, FaPhotoVideo, FaSlidersH, FaTh } from 'react-icons/fa'
import { useRecoilState } from 'recoil'
import {
  containerTypes,
  settings,
  sizeTypes,
  viewModeTypes,
} from '../atoms/settings'
import { PrimaryButton, WhiteFill } from '../components/Buttons'
import LoadingImage from '../components/ItemBox/LoadingImage'
import Modal from '../components/Modal'
import ModalBody from '../components/Modal/ModalBody'
import { LiveStyles } from '../components/PopupStyles/LiveStyles'
import Tooltip from '../components/Tooltip'
import { lang } from '../utils'
import UtakuStyle, { ModalList } from './Utaku.styled'
import { itemTypes } from './sources'

const Live = LiveStyles
interface ControlCompProps {
  tooltip: string
  current: number
  total: number
  queue: number
  toggleActive: () => void
  active: boolean
}
const ControlComp = ({
  active,
  toggleActive,
  current,
  queue,
  total,
  tooltip,
}: ControlCompProps) => {
  const [settingState, set_settingState] = useRecoilState(settings)
  const {
    folderName,
    folderNameList,
    sizeType,
    sizeLimit,
    itemType,
    containerSize,
    viewMode,
  } = settingState

  const [folderNameInput, set_folderNameInput] = useState<string>('')
  const [modalOpen, set_modalOpen] = useState<'folder' | null>(null)
  const handleViewMode = (type: (typeof viewModeTypes)[number]) => {
    const nextViewMode = viewMode.includes(type)
      ? viewMode.filter((item) => item !== type)
      : ([...viewMode, type] as (typeof viewModeTypes)[number][])
    set_settingState(
      produce((draft) => {
        draft.viewMode = nextViewMode
      })
    )
    chrome.storage.local.set({ viewMode: nextViewMode })
  }
  return (
    <>
      <Modal
        open={modalOpen !== null}
        onClose={() => {
          set_modalOpen(null)
        }}
      >
        {modalOpen === 'folder' && (
          <ModalBody title="folder">
            <ModalList.NameList>
              {folderNameList.length === 0 && (
                <ModalList.Row>
                  <div>
                    <span>{lang('no_folder')}</span>
                  </div>
                </ModalList.Row>
              )}
              {folderNameList.map((name) => (
                <ModalList.Row
                  key={name}
                  className={classNames({ active: name === folderName })}
                >
                  <ModalList.Name>{name}</ModalList.Name>
                  <ModalList.Buttons>
                    {name !== folderName && (
                      <PrimaryButton
                        _mini={true}
                        onClick={() => {
                          set_settingState(
                            produce((draft) => {
                              draft.folderName = name
                            })
                          )
                          chrome.runtime.sendMessage(
                            { message: 'setFolderName', data: name },
                            () => {
                              if (chrome.runtime.lastError)
                                console.log(chrome.runtime.lastError)
                            }
                          )
                          set_modalOpen(null)
                        }}
                      >
                        {lang('apply')}
                      </PrimaryButton>
                    )}
                    <WhiteFill
                      _mini={true}
                      onClick={() => {
                        const nextFolderNameList = folderNameList.filter(
                          (item) => {
                            return item !== name
                          }
                        )
                        set_settingState(
                          produce((draft) => {
                            draft.folderNameList = nextFolderNameList
                          })
                        )
                        chrome.storage.local.set({
                          folderNameList: nextFolderNameList,
                        })
                      }}
                    >
                      {lang('delete')}
                    </WhiteFill>
                  </ModalList.Buttons>
                </ModalList.Row>
              ))}
            </ModalList.NameList>
            <ModalList.BottomList>
              <ModalList.Row>
                <ModalList.Name>
                  <UtakuStyle.Input
                    placeholder="Folder Name"
                    type="text"
                    value={folderNameInput}
                    onChange={(e) => {
                      set_folderNameInput(e.target.value)
                    }}
                  />
                </ModalList.Name>
                <ModalList.Buttons>
                  <PrimaryButton
                    _mini={true}
                    onClick={() => {
                      if (settingState.folderNameList.includes(folderNameInput))
                        return alert(lang('already_exists_name'))
                      const nextFolderNameList = [
                        ...folderNameList,
                        folderNameInput,
                      ]
                      set_settingState(
                        produce((draft) => {
                          draft.folderNameList = nextFolderNameList
                        })
                      )
                      chrome.storage.local.set({
                        folderNameList: nextFolderNameList,
                      })
                      chrome.runtime.sendMessage(
                        { message: 'set-folderName', data: nextFolderNameList },
                        () => {
                          if (chrome.runtime.lastError)
                            console.log(chrome.runtime.lastError)
                        }
                      )
                      set_folderNameInput('')
                    }}
                  >
                    {lang('add')}
                  </PrimaryButton>
                </ModalList.Buttons>
              </ModalList.Row>
            </ModalList.BottomList>
          </ModalBody>
        )}
      </Modal>
      <UtakuStyle.Editor>
        <UtakuStyle.Left>
          <UtakuStyle.InputWrap>
            <span>Folder:</span>
            <UtakuStyle.Input
              value={folderName}
              onChange={(e) => {
                set_settingState(
                  produce((draft) => {
                    draft.folderName = e.target.value
                  })
                )
                set_settingState(
                  produce((draft) => {
                    draft.folderName = e.target.value
                  })
                )
                if (settingState.modeType === 'simple') {
                  chrome.storage.local.set({
                    folderName: e.target.value,
                  })
                  chrome.runtime.sendMessage(
                    { message: 'set-folderName', data: e.target.value },
                    () => {
                      if (chrome.runtime.lastError)
                        console.log(chrome.runtime.lastError)
                    }
                  )
                }
                if (settingState.modeType === 'enhanced') {
                  chrome.runtime.sendMessage(
                    { message: 'setFolderName', data: e.target.value },
                    () => {
                      if (chrome.runtime.lastError)
                        console.log(chrome.runtime.lastError)
                    }
                  )
                }
              }}
            />
            <UtakuStyle.IconButton
              onClick={() => {
                set_modalOpen('folder')
              }}
            >
              <FaList />
            </UtakuStyle.IconButton>
          </UtakuStyle.InputWrap>
          <UtakuStyle.InputWrap>
            <span>Size:</span>
            <UtakuStyle.Input
              type={'number'}
              min={1}
              value={sizeLimit.width}
              onChange={(e) => {
                const nextSizeLimit = {
                  ...sizeLimit,
                  width: Number(e.target.value),
                }
                set_settingState(
                  produce((draft) => {
                    draft.sizeLimit = nextSizeLimit
                  })
                )
                chrome.storage.local.set({ sizeLimit: nextSizeLimit })
              }}
            />
            <span>×</span>
            <UtakuStyle.Input
              type={'number'}
              min={1}
              value={sizeLimit.height}
              onChange={(e) => {
                const nextSizeLimit = {
                  ...sizeLimit,
                  height: Number(e.target.value),
                }
                set_settingState(
                  produce((draft) => {
                    draft.sizeLimit = nextSizeLimit
                  })
                )
                chrome.storage.local.set({ sizeLimit: nextSizeLimit })
              }}
            />
          </UtakuStyle.InputWrap>
        </UtakuStyle.Left>
        <UtakuStyle.Right>
          {queue > 0 && (
            <LoadingImage
              data-item-size={settingState.sizeType}
              data-wrapper-size={settingState.containerSize}
              length={queue}
            />
          )}
          <UtakuStyle.SizeController>
            <UtakuStyle.IconWrap
              data-active={viewMode.includes('container')}
              onClick={() => {
                handleViewMode('container')
              }}
            >
              <FaTh />
            </UtakuStyle.IconWrap>
            {viewMode.includes('container') && (
              <>
                {containerTypes.map((type) => (
                  <div
                    key={type}
                    className={type === containerSize ? 'active' : ''}
                    onClick={() => {
                      set_settingState(
                        produce((draft) => {
                          draft.containerSize = type
                        })
                      )
                      chrome.storage.local.set({ containerSize: type })
                    }}
                  >
                    {type}
                  </div>
                ))}
              </>
            )}
          </UtakuStyle.SizeController>
          <UtakuStyle.SizeController>
            <UtakuStyle.IconWrap
              data-active={viewMode.includes('size')}
              onClick={() => {
                handleViewMode('size')
              }}
            >
              <FaSlidersH />
            </UtakuStyle.IconWrap>
            {viewMode.includes('size') && (
              <>
                {sizeTypes.map((type) => (
                  <div
                    key={type}
                    className={type === sizeType ? 'active' : ''}
                    onClick={() => {
                      set_settingState(
                        produce((draft) => {
                          draft.sizeType = type
                        })
                      )
                      chrome.storage.local.set({ sizeType: type })
                    }}
                  >
                    {type}
                  </div>
                ))}
              </>
            )}
          </UtakuStyle.SizeController>
          <UtakuStyle.QualityController>
            <UtakuStyle.IconWrap
              data-active={viewMode.includes('item')}
              onClick={() => {
                handleViewMode('item')
              }}
            >
              <FaPhotoVideo />
            </UtakuStyle.IconWrap>
            {viewMode.includes('item') && (
              <>
                {itemTypes.map((type) => (
                  <div
                    key={type}
                    className={type === itemType ? 'active' : ''}
                    onClick={() => {
                      set_settingState(
                        produce((draft) => {
                          draft.itemType = type
                        })
                      )
                      chrome.storage.local.set({ itemType: type })
                    }}
                  >
                    {type}
                  </div>
                ))}
              </>
            )}
          </UtakuStyle.QualityController>
          <UtakuStyle.ItemLength>
            <div>
              {'( '}
              <span>
                {current}
                {' / '}
                {total}
              </span>
              {' )'}
            </div>
          </UtakuStyle.ItemLength>
          {settingState.modeType === 'enhanced' && (
            <div onClick={toggleActive}>
              {active && <Live.CircleActive />}
              {!active && <Live.Circle />}
            </div>
          )}
        </UtakuStyle.Right>
        {tooltip && <Tooltip className="utaku-url-tooltip">{tooltip}</Tooltip>}
      </UtakuStyle.Editor>
    </>
  )
}
export default ControlComp
