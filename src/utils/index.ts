import { cloneDeep } from "lodash-es"
import { UrlRemap, UrlRemapItem } from "../atoms/settings"
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

export function lang(value: string) {
  if (!chrome?.i18n) return value
  return chrome.i18n.getMessage(value)
}
export function isValidUrl(url?: string | null) {
  try {
    if (!url) return false
    new URL(url)
    return true
  } catch (error) {
    return false
  }
}
export function parseUrlRemap(value: UrlRemap, url: string) {
  try {
    const { from, to, params, host } = value
    if (host && !url.includes(host)) return url
    if (Object.keys(params).length) {
      URL
      const urlObj = new URL(url)
      Object.keys(params).forEach((key) => {
        if (params[key]) {
          urlObj.searchParams.set(key, params[key])
        } else {
          urlObj.searchParams.delete(key)
        }
      })
      url = urlObj.toString()
    }
    if (from && url.includes(from)) {
      url = url.replace(from, to)
    } else if (!from && to) {
      url = url + to
    }
    return url
  } catch (error) {
    return url
  }
}
export function parseItemWithUrlRemap(value: UrlRemap, item: WebResponseItem) {
  const nextItem = cloneDeep(item)
  if (value.host && !nextItem.url.includes(value.host)) return nextItem
  nextItem.url = parseUrlRemap(value, nextItem.url)
  return nextItem
}
export function parseItemWithUrlRemaps(urlRemaps: UrlRemapItem[], item: WebResponseItem) {
  let nextItem = cloneDeep(item)
  console.log('urlRemaps', urlRemaps);

  urlRemaps.forEach((value) => {
    nextItem = parseItemWithUrlRemap(value.item, nextItem)
  })
  return nextItem
}
export function parseItemListWithUrlRemaps(urlRemaps: UrlRemapItem[], items: WebResponseItem[]) {
  return items.map((item) => parseItemWithUrlRemaps(urlRemaps, item))
}