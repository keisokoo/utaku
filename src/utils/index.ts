import { cloneDeep } from "lodash-es"
import { UrlRemap, UrlRemapItem, initialUrlRemapItem } from "../atoms/settings"
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
    if (host && !url.includes(host)) return url
    const current_domain = extractDomain(url)
    const current_sub_domain = extractSubDomain(url)
    if (current_domain && current_sub_domain !== sub_domain) {
      if (current_sub_domain) url = url.replace(current_sub_domain, sub_domain)
      if (!current_sub_domain) {
        const urlObj = new URL(url)
        urlObj.hostname = sub_domain + '.' + current_domain
        url = urlObj.toString()
      }
    }
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
  if (value.host && !nextItem.url.includes(value.host)) return nextItem
  nextItem.url = parseUrlRemap(value, nextItem.url)
  return nextItem
}
export function parseItemWithUrlRemaps(urlRemaps: UrlRemapItem[], item: WebResponseItem) {
  let nextItem = cloneDeep(item)
  urlRemaps.forEach((value) => {
    nextItem = parseItemWithUrlRemap(value.item, nextItem)
  })
  return nextItem
}
export function parseItemListWithUrlRemaps(urlRemaps: UrlRemapItem[], items: WebResponseItem[]) {
  return items.map((item) => parseItemWithUrlRemaps(urlRemaps, item))
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