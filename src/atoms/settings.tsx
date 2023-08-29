import { atom } from 'recoil'

export const itemTypes = ['all', 'image', 'media'] as const
export const sizeTypes = ['small', 'medium', 'large'] as const

export type UrlRemap = {
  reference_url?: string
  host: string
  params: {
    [k: string]: string
  }
  from: string
  to: string
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
    from: '',
    to: '',
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
    remapList: [],
    applyRemapList: [],
  },
})
