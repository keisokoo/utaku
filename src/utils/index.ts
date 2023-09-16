import { cloneDeep, isArray } from "lodash-es"
import { v4 } from "uuid"
import { LimitBySelectorType, SettingsType, UrlRemap, UrlRemapItem, defaultMode, initialUrlRemapItem } from "../atoms/settings"
import { WebResponseItem } from "../content/types"

export function getTransformXY(el: HTMLElement) {
  const transform = window.getComputedStyle(el).transform
  if (transform === 'none') {
    return { x: 0, y: 0 }
  }
  const matrix = transform.match(/^matrix\((.+)\)$/)
  if (!matrix) {
    return { x: 0, y: 0 }
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_a, _b, _c, _d, e, f] = matrix[1]
    .split(',')
    .map((item) => parseFloat(item))
  return { x: e, y: f }
}
export function adjustPositionOnResize(el: HTMLButtonElement) {
  const position = getTransformXY(el)
  let nextX = position.x
  let nextY = position.y

  const scrollBarWidth =
    document.documentElement.scrollWidth - window.innerWidth
  const maxX = window.innerWidth - el.offsetWidth + scrollBarWidth
  const maxY = window.innerHeight - el.offsetHeight

  nextX = Math.min(maxX, Math.max(0, nextX))
  nextY = Math.min(maxY, Math.max(0, nextY))

  el.style.transform = `translate(${nextX}px, ${nextY}px)`
}
export function lang(value: string, ...content: string[]) {
  if (!chrome?.i18n) return value
  return chrome.i18n.getMessage(value, content)
}
export function isValidUrl(url?: string | null) {
  try {
    if (!url) return false
    const currentUrl = new URL(url)
    return currentUrl?.hostname ? true : false
  } catch (error) {
    return false
  }
}
export function urlToRemapItem(url: string): UrlRemapItem {
  try {
    if (url.startsWith('//')) url = 'https:' + url
    const currentUrl = new URL(url)
    return {
      ...initialUrlRemapItem,
      item: {
        ...initialUrlRemapItem.item,
        reference_url: url,
        host: currentUrl.host,
        domain: extractDomain(url) ?? '',
        sub_domain: extractSubDomain(url) ?? '',
        params: Object.fromEntries(
          currentUrl.searchParams
        ),
      },
    }
  } catch (error) {
    return initialUrlRemapItem
  }
}
export function extractDomain(url: string): string | null {
  if (!isValidUrl(url)) return null
  const parsedUrl = new URL(url);
  const hostname = parsedUrl.hostname;
  const match = hostname.match(/([^.]+\.)?([^.]+\..+)$/);

  return match ? match[2] : null;
}
export function extractSubDomain(url: string) {
  if (!isValidUrl(url)) return null
  const parsedUrl = new URL(url);
  const hostname = parsedUrl.hostname;
  const match = hostname.match(/([^.]+\.)?([^.]+\..+)$/);
  const subDomain = match ? match[1] : null;
  return subDomain ? subDomain.replace(/\.$/, '') : null;
}
export function parseUrlRemap(value: UrlRemap, url: string) {
  try {
    const { params, host, path_change, replace, sub_domain } = value

    if (host && !url.includes(host)) {
      return url
    }
    const current_domain = extractDomain(url)
    const current_sub_domain = extractSubDomain(url)

    const hasUrlInQueries = Object.values(params).some((value) => value.includes('#{url}'))

    if (hasUrlInQueries) {
      let queryUrl = url
      const urlParams = new URL(queryUrl).searchParams
      const urlParamKeys = Object.entries(params).filter(([, value]) => value.includes('#{url}')).map(([key]) => key)[0]
      const regex = /#\{url\}\[(\d+)\]/;
      const matchCount = params[urlParamKeys].match(regex)?.[1]

      const allValues: string[] = []

      urlParams.forEach((value, key) => {
        if (key === urlParamKeys && isValidUrl(value)) allValues.push(value)
      })
      if (allValues.length < 1) return url
      if (matchCount !== undefined && allValues.length > 1 && !isNaN(parseInt(matchCount))) {
        queryUrl = allValues[parseInt(matchCount)] ?? allValues[allValues.length - 1] ?? url
      } else {
        queryUrl = allValues[allValues.length - 1] ?? url
      }
      if (queryUrl && extractDomain(queryUrl) === current_domain) {
        return queryUrl
      } else {
        return url
      }
    }
    if (current_domain && current_sub_domain !== sub_domain) {
      if (current_sub_domain) url = url.replace(current_sub_domain, sub_domain)
      if (!current_sub_domain) {
        const urlObj = new URL(url)
        urlObj.hostname = sub_domain + '.' + current_domain
        url = urlObj.toString()
      }
    }
    if (Object.keys(params).length) {
      const urlObj = new URL(url)
      Object.keys(params).forEach((key) => {
        if (params[key].includes(`#{url}`)) return
        if (params[key]) {
          urlObj.searchParams.set(key, params[key])
        } else {
          urlObj.searchParams.delete(key)
        }
      })
      url = urlObj.toString()
    }
    if (path_change) {
      const urlObj = new URL(url)
      const refererPath = urlObj.pathname.split('/').filter(ii => !!ii).map((dt, idx) => {
        const changed = path_change?.find(
          (ii) => ii.index === idx
        )
        return changed ? changed.to : dt
      }
      ).join('/');
      urlObj.pathname = '/' + refererPath
      url = urlObj.toString()
    }
    if (replace.length > 0) {
      replace.forEach((value) => {
        const { from, to } = value
        if (from && url.includes(from)) {
          url = url.replace(from, to)
        } else if (!from && to) {
          url = url + to
        }
      })
    }
    return url
  } catch (error) {
    return url
  }
}
export function parseItemWithUrlRemap(value: UrlRemap, item: WebResponseItem) {
  const nextItem = cloneDeep(item)
  if (value.host && !nextItem.url.includes(value.host)) {
    return nextItem
  }
  nextItem.url = parseUrlRemap(value, nextItem.url)
  return nextItem
}
export function parseItemWithUrlRemaps(urlRemaps: UrlRemapItem, item: WebResponseItem) {
  let nextItem = cloneDeep(item)
  nextItem = parseItemWithUrlRemap(urlRemaps.item, nextItem)
  return nextItem
}
export function parseItemWithUrlRemapItems(urlRemaps: UrlRemapItem[], item: WebResponseItem) {
  let nextItem = cloneDeep(item)
  urlRemaps.forEach((urlRemap) => {
    nextItem = parseItemWithUrlRemap(urlRemap.item, nextItem)
  })
  return nextItem
}
export function parseItemListWithUrlRemaps(urlRemaps: UrlRemapItem[], items: WebResponseItem[]) {
  if (urlRemaps.length < 1) return items
  return items.map((item) => {
    return parseItemWithUrlRemapItems(urlRemaps, item)
  })
}

export function migrationRemapList(remapList: UrlRemapItem[]) {
  return remapList.map((curr: UrlRemapItem) => {
    const oldCurrItem = curr.item as typeof curr.item & {
      from: string
      to: string
    }
    if (!!oldCurrItem.from || !!oldCurrItem.to) {
      oldCurrItem.replace = oldCurrItem.replace
        ? [
          ...oldCurrItem.replace,
          { from: oldCurrItem.from, to: oldCurrItem.to },
        ]
        : [{ from: oldCurrItem.from, to: oldCurrItem.to }]
    }
    if (
      oldCurrItem.reference_url &&
      extractSubDomain(oldCurrItem.reference_url) &&
      oldCurrItem.sub_domain === undefined
    ) {
      oldCurrItem.sub_domain =
        extractSubDomain(oldCurrItem.reference_url) ?? ''
      oldCurrItem.domain =
        extractSubDomain(oldCurrItem.reference_url) ?? ''
    }
    curr.item = oldCurrItem
    return curr
  })
}
export const isURLRemapItem = (value: unknown): value is UrlRemapItem => {
  if (typeof value !== 'object' || value === null) return false
  if (!('item' in value)) return false
  if (!('id' in value)) return false
  if (!('name' in value)) return false
  if ('item' in value && 'id' in value && 'name' in value) return true
  return false
}
export const isLimitBySelectorType = (value: unknown): value is LimitBySelectorType => {
  if (typeof value !== 'object' || value === null) return false
  if (!('host' in value)) return false
  if (!('selector' in value)) return false
  if ('host' in value && 'selector' in value) return true
  return false
}

export const syncSettings = (prev: SettingsType, settings: SettingsType) => {
  const result = { ...cloneDeep(prev), ...settings }
  if (!settings.modeType) {
    settings.modeType = defaultMode
    chrome.storage.local.set({ modeType: defaultMode })
  }
  return result
}
export const exportSettingsByJson = (settings: object) => {
  const result = { ...cloneDeep(settings) }
  const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `settings_${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
export const importSettingsByJson = (json: string) => {
  try {
    const result = JSON.parse(json) as SettingsType
    return result
  } catch (error) {
    return null
  }
}
export const remapListRequireCheckAndParsing = (remapList: UrlRemapItem[]): {
  errorCount: number
  total: number
  result: UrlRemapItem[]
  errorResult: string[]
} => {
  const checkedItems = remapList.map((item, idx) => {
    if (!item.item) return `${item.id ?? idx}_item is required`
    if (!item.item.host) return `${item.id ?? idx}_host is required`
    if (!item.item.reference_url) return `${item.id ?? idx}_reference_url is required`
    if (typeof item.item.sub_domain !== 'string') return `${item.id ?? idx}_sub_domain must be string`
    // if (typeof item.item.initiator !== 'string') return `${item.id ?? idx}_initiator must be string`
    if (typeof item.item.params !== 'object') return `${item.id ?? idx}_params must be object - {key: value}`
    if (!isArray(item.item.path_change)) return `${item.id ?? idx}_path_change must be object array - {index: number, to: string}[]`
    if (!isArray(item.item.replace)) return `${item.id ?? idx}_replace must be object array - {from: string, to: string}[]`
    if (Object.values(item.item.params).length > 0) {
      if (typeof Object.values(item.item.params)[0] !== 'string') return `${item.id ?? idx}_params.value must be string`
    }
    if (item.item.path_change.length > 0) {
      if (typeof item.item.path_change[0].index !== 'number') return `${item.id ?? idx}_path_change.index must be number`
      if (typeof item.item.path_change[0].to !== 'string') return `${item.id ?? idx}_path_change.to must be string`
    }
    if (item.item.replace.length > 0) {
      if (typeof item.item.replace[0].from !== 'string') return `${item.id ?? idx}_replace.from must be string`
      if (typeof item.item.replace[0].to !== 'string') return `${item.id ?? idx}_replace.to must be string`
    }
    if (!item.id) item.id = v4()
    if (!item.name) item.name = 'New_Remap_' + Date.now()
    return item
  })
  const result = checkedItems.filter((item) => typeof item !== 'string') as UrlRemapItem[]
  const errorResult = checkedItems.filter((item) => typeof item === 'string') as string[]
  return {
    errorCount: errorResult.length,
    total: remapList.length,
    result,
    errorResult
  }
}
export const limitBySelectorRequireCheckAndParsing = (limitBySelector: LimitBySelectorType[]): {
  errorCount: number
  total: number
  result: LimitBySelectorType[]
  errorResult: string[]
} => {
  const checkedItems = limitBySelector.map((item, idx) => {
    if (!item.host) return `${item.id ?? idx}_host is required`
    if (!item.selector) return `${item.id ?? idx}_selector is required`
    if (!item.selector.parent) return `${item.id ?? idx}_selector.parent is required`
    if (typeof item.selector.image !== 'string') return `${item.id ?? idx}_selector.image must be string`
    if (typeof item.selector.video !== 'string') return `${item.id ?? idx}_selector.video must be string`
    if (typeof item.selector.parent !== 'string') return `${item.id ?? idx}_selector.parent must be string`
    if (!item.id) item.id = v4()
    if (!item.name) item.name = 'New_Filter_' + Date.now()
    return item
  }
  )
  const result = checkedItems.filter((item) => typeof item !== 'string') as LimitBySelectorType[]
  const errorResult = checkedItems.filter((item) => typeof item === 'string') as string[]
  return {
    errorCount: errorResult.length,
    total: limitBySelector.length,
    result,
    errorResult
  }
}
export function mergeByIds<T extends { id: string },>(arr1: T[], arr2: T[]): T[] {
  const idToItemMap: { [id: string]: T } = {};
  for (const item of arr1) {
    idToItemMap[item.id] = { ...item };
  }
  for (const item of arr2) {
    if (idToItemMap[item.id]) {
      Object.assign(idToItemMap[item.id], item);
    } else {
      idToItemMap[item.id] = { ...item };
    }
  }
  return Object.values(idToItemMap);
}

export async function copyToClipboard(text: string): Promise<string> {
  if (window !== undefined && window.navigator?.clipboard && window.isSecureContext) {
    return new Promise((res, rej) => {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          res(text)
        })
        .catch(() => {
          rej('error')
        })
    })
  } else {
    const El = document.createElement('textarea')
    El.style.position = 'absolute'
    El.style.opacity = '0'
    document.body.appendChild(El)
    El.value = text
    El.focus()
    El.select()
    return new Promise((res, rej) => {
      document.execCommand('copy') ? res(text) : rej('error')
      El.remove()
    })
  }
}