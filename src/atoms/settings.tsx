import { atom } from 'recoil'

export const itemTypes = ['all', 'image', 'media'] as const
export const sizeTypes = ['small', 'medium', 'large'] as const
export const containerTypes = ['hide', 'normal', 'flexbox', 'tile'] as const

export type PathChangeType = {
  index: number
  to: string
}
export type ReplaceType = {
  from: string
  to: string
}
export type UrlRemap = {
  reference_url?: string
  host: string
  params: {
    [k: string]: string
  }
  replace: ReplaceType[]
  path_change: PathChangeType[]
}
export type UrlRemapItem = {
  id: string
  name: string
  item: UrlRemap
}
export const initialUrlRemapItem: UrlRemapItem = {
  id: '',
  name: '',
  item: {
    reference_url: '',
    host: '',
    params: {},
    replace: [],
    path_change: [],
  },
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
  remapList: UrlRemapItem[]
  applyRemapList: string[]
  containerSize: (typeof containerTypes)[number]
}

export const settings = atom<SettingsType>({
  key: 'settings',
  default: {
    sizeType: 'small',
    itemType: 'image',
    sizeLimit: {
      width: 200,
      height: 200,
    },
    folderName: 'utaku',
    folderNameList: [],
    remapList: [],
    applyRemapList: [],
    containerSize: 'normal',
  },
})
