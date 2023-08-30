import classNames from 'classnames'
import { produce } from 'immer'
import React, { useState } from 'react'
import { FaList, FaPhotoVideo, FaSlidersH, FaTh } from 'react-icons/fa'
import { useRecoilState } from 'recoil'
import { containerTypes, settings, sizeTypes } from '../atoms/settings'
import { PrimaryButton, WhiteFill } from '../components/Buttons'
import Modal from '../components/Modal'
import ModalBody from '../components/Modal/ModalBody'
import Tooltip from '../components/Tooltip'
import { lang } from '../utils'
import UtakuStyle, { ModalList } from './Utaku.styled'
import { itemTypes } from './sources'

interface ControlCompProps {
  tooltip: string
  current: number
  total: number
  toggleActive: () => void
  active: boolean
}
const ControlComp = ({
  active,
  toggleActive,
  current,
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
  } = settingState

  const [folderNameInput, set_folderNameInput] = useState<string>('')
  const [modalOpen, set_modalOpen] = useState<'folder' | null>(null)
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
                chrome.runtime.sendMessage(
                  { message: 'setFolderName', data: e.target.value },
                  () => {
                    if (chrome.runtime.lastError)
                      console.log(chrome.runtime.lastError)
                  }
                )
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
          <UtakuStyle.SizeController>
            <UtakuStyle.IconWrap>
              <FaTh />
            </UtakuStyle.IconWrap>
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
          </UtakuStyle.SizeController>
          <UtakuStyle.SizeController>
            <UtakuStyle.IconWrap>
              <FaSlidersH />
            </UtakuStyle.IconWrap>
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
          </UtakuStyle.SizeController>
          <UtakuStyle.QualityController>
            <UtakuStyle.IconWrap>
              <FaPhotoVideo />
            </UtakuStyle.IconWrap>
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
          <div onClick={toggleActive}>
            {active && <UtakuStyle.CircleActive />}
            {!active && <UtakuStyle.Circle />}
          </div>
        </UtakuStyle.Right>
        {tooltip && <Tooltip className="utaku-url-tooltip">{tooltip}</Tooltip>}
      </UtakuStyle.Editor>
    </>
  )
}
export default ControlComp
