
export type RequestItem = chrome.webRequest.WebResponseHeadersDetails
export type DataType = { [key in string]: RequestItem }
export type ImageInfo = {
  width: number
  height: number
  thumbnail?: string
  active?: boolean
  replaced?: string
}
export type ItemType = RequestItem & {
  imageInfo: ImageInfo
}