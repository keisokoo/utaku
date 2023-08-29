
export type WebResponseItem = chrome.webRequest.WebResponseHeadersDetails & {
  imageInfo?: ImageInfo
}
export type DataType = { [key in string]: WebResponseItem }
export type ImageInfo = {
  width: number
  height: number
  thumbnail?: string
  active?: boolean
  replaced?: string
}
export type ItemType = WebResponseItem & {
  imageInfo: ImageInfo
}