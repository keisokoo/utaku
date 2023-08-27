import { atom } from 'recoil'

export const itemTypes = ['all', 'image', 'media'] as const
export const sizeTypes = ['small', 'medium', 'large'] as const

export type UrlFilter = {
  host: string
  selected: string[]
  params: {
    [k: string]: string
  }
  from: string
  to: string
}
type UrlFilterItem = {
  name: string
  item: UrlFilter
}
export interface SettingsType {
  sizeType: (typeof sizeTypes)[number]
  itemType: (typeof itemTypes)[number]
  sizeLimit: {
    width: number
    height: number
  }
  folderName: string
  folderNameList: string[]
  filterList: UrlFilterItem[]
}

export const settings = atom<SettingsType>({
  key: 'settings',
  default: {
    sizeType: 'small',
    itemType: 'image',
    sizeLimit: {
      width: 500,
      height: 500,
    },
    folderName: 'utaku',
    folderNameList: [],
    filterList: [],
  },
})
