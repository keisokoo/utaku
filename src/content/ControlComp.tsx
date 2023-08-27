import classNames from 'classnames'
import { produce } from 'immer'
import { cloneDeep } from 'lodash-es'
import React, { useState } from 'react'
import { FaFilter, FaList } from 'react-icons/fa'
import { useRecoilState } from 'recoil'
import { PrimaryButton, WhiteFill } from '../components/Buttons'
import FilterEditor from '../components/Filter/FilterEditor'
import Modal from '../components/Modal'
import ModalBody from '../components/Modal/ModalBody'
import Tooltip from '../components/Tooltip'
import { lang } from '../utils'
import UtakuStyle, { ModalList } from './Utaku.styled'
import { settings, sizeTypes } from './atoms/settings'
import { itemTypes } from './sources'
import { ItemType } from './types'

interface ControlCompProps {
  tooltip: string
  current: number
  total: number
  itemList: ItemType[]
  handleReplace: (itemList: ItemType[]) => void
}
const ControlComp = ({
  current,
  total,
  tooltip,
  itemList,
  handleReplace,
}: ControlCompProps) => {
  const [settingState, set_settingState] = useRecoilState(settings)
  const { folderName, folderNameList, sizeType, sizeLimit, itemType } =
    settingState

  const [folderNameInput, set_folderNameInput] = useState<string>('')
  const [modalOpen, set_modalOpen] = useState<'folder' | 'more' | null>(null)
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
                        chrome.storage.sync.set({
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
                  <input
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
                      chrome.storage.sync.set({
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
        {modalOpen === 'more' && (
          <FilterEditor
            emitFilter={(value) => {
              try {
                const { from, to, params, host } = value
                const replacedItemList = cloneDeep(itemList).filter((item) => {
                  if (host && !item.url.includes(host)) return false
                  return true
                })
                const nextImagePromises = replacedItemList.map((item) => {
                  if (host && !item.url.includes(host)) return item
                  if (Object.keys(params).length) {
                    const url = new URL(item.url)
                    Object.keys(params).forEach((key) => {
                      url.searchParams.set(key, params[key])
                    })
                    item.url = url.toString()
                  }
                  if (from && item.url.includes(from)) {
                    item.url = item.url.replace(from, to)
                  } else if (!from && to) {
                    item.url = item.url + to
                  }
                  return item
                })
                handleReplace(nextImagePromises)
              } catch (error) {
                console.log('error', error)
              }
            }}
          />
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
                chrome.storage.sync.set({ sizeLimit: nextSizeLimit })
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
                chrome.storage.sync.set({ sizeLimit: nextSizeLimit })
              }}
            />
            <UtakuStyle.IconButton
              onClick={() => {
                set_modalOpen('more')
              }}
            >
              <FaFilter />
            </UtakuStyle.IconButton>
          </UtakuStyle.InputWrap>
        </UtakuStyle.Left>
        <UtakuStyle.Right>
          <UtakuStyle.SizeController>
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
                  chrome.storage.sync.set({ sizeType: type })
                }}
              >
                {type}
              </div>
            ))}
          </UtakuStyle.SizeController>
          <UtakuStyle.QualityController>
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
                  chrome.storage.sync.set({ itemType: type })
                }}
              >
                {type}
              </div>
            ))}
          </UtakuStyle.QualityController>
          <div>
            {'( '}
            <span>
              {current}
              {' / '}
              {total}
            </span>
            {' )'}
          </div>
        </UtakuStyle.Right>
        {tooltip && <Tooltip className="utaku-url-tooltip">{tooltip}</Tooltip>}
      </UtakuStyle.Editor>
    </>
  )
}
export default ControlComp
