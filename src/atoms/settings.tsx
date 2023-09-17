import { isArray } from 'lodash-es'
import { atom } from 'recoil'

export const itemTypes = ['all', 'image', 'media'] as const
export const sizeTypes = ['small', 'medium', 'large'] as const
export const modeType = ['simple', 'enhanced', null] as const
export const containerTypes = ['hide', 'normal', 'flexbox', 'tile'] as const
export const viewModeTypes = ['container', 'size', 'item'] as const

export const defaultMode = 'simple'

export type PathChangeType = {
  index: number
  to: string
}
export type ReplaceType = {
  from: string
  to: string
}
export type UrlRemap = {
  reference_url: string
  initiator?: string
  host: string
  domain: string
  sub_domain: string
  params: {
    [k: string]: string
  }
  path_change: PathChangeType[]
  replace: ReplaceType[]
}
export type LimitBySelectorType = {
  id: string
  name: string
  host: string
  selector: {
    image: string
    video: string
    parent: string
  }
  active?: boolean
}
export type UrlRemapItem = {
  id: string
  name: string
  item: UrlRemap
  active?: boolean
}
export const initialUrlRemapItem: UrlRemapItem = {
  id: '',
  name: '',
  item: {
    reference_url: '',
    host: '',
    domain: '',
    sub_domain: '',
    params: {},
    replace: [],
    path_change: [],
  },
}
export type RemapSettingsType = {
  remapList: UrlRemapItem[]
  limitBySelector: LimitBySelectorType[]
}
export const isRemapSettingsType = (
  item: RemapSettingsType
): item is RemapSettingsType => {
  if (!item) return false
  if (!item.remapList) return false
  if (!item.limitBySelector) return false
  if (!isArray(item.remapList)) return false
  if (!isArray(item.limitBySelector)) return false
  const forCheckRemapItem = item.remapList?.[0]
  if (forCheckRemapItem) {
    if (!('id' in forCheckRemapItem)) return false
    if (!('name' in forCheckRemapItem)) return false
    if (!('item' in forCheckRemapItem)) return false
    if (!('host' in forCheckRemapItem.item)) return false
    if (!('host' in forCheckRemapItem.item)) return false
    if (!('sub_domain' in forCheckRemapItem.item)) return false
    if (!('params' in forCheckRemapItem.item)) return false
    if (!('replace' in forCheckRemapItem.item)) return false
    if (!('path_change' in forCheckRemapItem.item)) return false
  }
  const forCheckLimitBySelector = item.limitBySelector?.[0]
  if (forCheckLimitBySelector) {
    if (!('id' in forCheckLimitBySelector)) return false
    if (!('name' in forCheckLimitBySelector)) return false
    if (!('host' in forCheckLimitBySelector)) return false
    if (!('selector' in forCheckLimitBySelector)) return false
    if (!('image' in forCheckLimitBySelector.selector)) return false
    if (!('video' in forCheckLimitBySelector.selector)) return false
    if (!('parent' in forCheckLimitBySelector.selector)) return false
  }
  return true
}
export type SettingsType = {
  [key: string]: unknown
  containerSize: (typeof containerTypes)[number]
  sizeType: (typeof sizeTypes)[number]
  itemType: (typeof itemTypes)[number]
  modeType: (typeof modeType)[number] | null
  viewMode: (typeof viewModeTypes)[number][]
  sizeLimit: {
    width: number
    height: number
  }
  folderName: string
  folderNameList: string[]
  remapList: UrlRemapItem[]
  limitBySelector: LimitBySelectorType[]
  live: {
    remap?: boolean
    filter?: boolean
  }
  extraOptions: {
    useSvgElement?: boolean
    useAnchorElement?: boolean
    remappedOnly?: boolean
    remapOnSelect?: boolean
  }
}
export const defaultSettings: SettingsType = {
  sizeType: 'small',
  itemType: 'image',
  modeType: null,
  viewMode: ['container'],
  sizeLimit: {
    width: 100,
    height: 100,
  },
  folderName: 'utaku',
  folderNameList: [],
  remapList: [],
  containerSize: 'normal',
  limitBySelector: [],
  live: {
    remap: false,
    filter: false,
  },
  extraOptions: {
    useSvgElement: false,
    useAnchorElement: false,
    remappedOnly: false,
    remapOnSelect: true,
  },
}
export const settings = atom<SettingsType>({
  key: 'settings',
  default: { ...defaultSettings },
})
