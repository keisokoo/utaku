import { ItemType } from "../content/types"

function toAbsoluteURL(baseURL: string, collectedURL: string): string {
  try {
    if (!baseURL) return collectedURL
    if (collectedURL.startsWith('//')) {
      return new URL(baseURL).protocol + collectedURL
    }
    if (collectedURL.startsWith('/') || collectedURL.startsWith('.')) {
      return new URL(collectedURL, baseURL).toString()
    }
    return collectedURL
  } catch (error) {
    return collectedURL
  }
}

export const toItemType = (url: string, type: 'image' | 'media') => {
  if (window !== undefined) {
    url = toAbsoluteURL(window.location.href, url)
  }
  return {
    url: url,
    type: type,
    initiator: window.location.origin,
    imageInfo: {
      width: 0,
      height: 0,
      active: false,
    },
  } as ItemType
}