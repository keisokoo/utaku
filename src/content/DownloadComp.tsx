import React from 'react'
import {
  FaCheckCircle,
  FaCircle,
  FaFileDownload,
  FaTrash,
} from 'react-icons/fa'
import { useRecoilState } from 'recoil'
import { settings } from '../atoms/settings'
import {
  GrayScaleFill,
  PrimaryButton,
  SecondaryButton,
  WhiteFill,
} from '../components/Buttons'
import UtakuStyle from './Utaku.styled'
import { ItemType } from './types'

interface DownloadCompProps {
  itemList: ItemType[]
  handleItemList: (itemList: ItemType[]) => void
  handleDownload: (all?: boolean) => void
  disabledTrashDeselected: boolean
  disabledTrashSelected: boolean
  disabledAllDeSelect: boolean
  disabledAllSelect: boolean
}
const DownloadComp = ({
  itemList,
  handleItemList,
  handleDownload,
  disabledTrashDeselected,
  disabledTrashSelected,
  disabledAllDeSelect,
  disabledAllSelect,
}: DownloadCompProps) => {
  const [settingState] = useRecoilState(settings)
  return (
    <>
      <UtakuStyle.Controller>
        <UtakuStyle.Left>
          <WhiteFill
            _mini
            onClick={(e) => {
              e.stopPropagation()
              if (settingState.modeType === 'simple') {
                handleItemList([])
                return
              }
              if (settingState.modeType === 'enhanced') {
                chrome.runtime.sendMessage({
                  message: 'delete-all-disposed',
                })
                return
              }
            }}
          >
            <FaTrash /> All
          </WhiteFill>
          <WhiteFill
            _mini
            disabled={disabledTrashDeselected}
            onClick={(e) => {
              e.stopPropagation()
              if (settingState.modeType === 'simple') {
                handleItemList(
                  itemList
                    .filter((item) => item.imageInfo.active)
                    .map((item) => {
                      item.imageInfo.active = false
                      return item
                    })
                )
                return
              }
              if (settingState.modeType === 'enhanced') {
                const onlyDeSelected = itemList.filter(
                  (item) => !item.imageInfo.active
                )
                chrome.runtime.sendMessage({
                  message: 'delete-from-disposed',
                  data: onlyDeSelected,
                })
                return
              }
            }}
          >
            <FaTrash />
            Deselected
          </WhiteFill>
          <WhiteFill
            _mini
            disabled={disabledTrashSelected}
            onClick={(e) => {
              e.stopPropagation()
              if (settingState.modeType === 'simple') {
                handleItemList(
                  itemList
                    .filter((item) => !item.imageInfo.active)
                    .map((item) => {
                      item.imageInfo.active = false
                      return item
                    })
                )
                return
              }
              if (settingState.modeType === 'enhanced') {
                const onlySelected = itemList.filter(
                  (item) => item.imageInfo.active
                )
                chrome.runtime.sendMessage({
                  message: 'delete-from-disposed',
                  data: onlySelected,
                })
                return
              }
            }}
          >
            <FaTrash />
            Selected
          </WhiteFill>
        </UtakuStyle.Left>
        <UtakuStyle.Center>
          <GrayScaleFill
            _mini
            disabled={disabledAllDeSelect}
            onClick={(e) => {
              e.stopPropagation()
              handleItemList(
                itemList.map((item) => {
                  item.imageInfo = {
                    ...item.imageInfo,
                    active: false,
                  }
                  return item
                })
              )
            }}
          >
            <FaCircle />
            All
          </GrayScaleFill>
          <GrayScaleFill
            _mini
            disabled={disabledAllSelect}
            onClick={(e) => {
              e.stopPropagation()
              handleItemList(
                itemList.map((item) => {
                  item.imageInfo = {
                    ...item.imageInfo,
                    active: true,
                  }
                  return item
                })
              )
            }}
          >
            <FaCheckCircle />
            All
          </GrayScaleFill>
        </UtakuStyle.Center>
        <UtakuStyle.Right>
          <SecondaryButton
            _mini
            disabled={!itemList?.some((item) => item.imageInfo?.active)}
            onClick={(e) => {
              e.stopPropagation()
              handleDownload()
            }}
          >
            <FaFileDownload />
            Selected
          </SecondaryButton>
          <PrimaryButton
            _mini
            onClick={(e) => {
              e.stopPropagation()
              handleDownload(true)
            }}
          >
            <FaFileDownload />
            All
          </PrimaryButton>
        </UtakuStyle.Right>
      </UtakuStyle.Controller>
    </>
  )
}
export default DownloadComp
