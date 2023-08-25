import React from 'react'
interface DisposeVideoProps {
  value: chrome.webRequest.WebResponseHeadersDetails
  disposeVideo: (
    e: React.SyntheticEvent<HTMLVideoElement, Event>,
    value: chrome.webRequest.WebResponseHeadersDetails
  ) => void
}
interface DisposeImageProps {
  value: chrome.webRequest.WebResponseHeadersDetails
  disposeImage: (
    e: React.SyntheticEvent<HTMLImageElement, Event>,
    value: chrome.webRequest.WebResponseHeadersDetails
  ) => void
}
const DisposeVideo = ({ value, disposeVideo }: DisposeVideoProps) => {
  return (
    <video
      src={value.url}
      autoPlay={false}
      muted
      loop
      controls={false}
      onLoadedMetadata={(e) => {
        disposeVideo(e, value)
      }}
    />
  )
}
const DisposeImage = ({ value, disposeImage }: DisposeImageProps) => {
  return (
    <img
      src={value.url}
      alt={value.requestId}
      onLoad={(e) => {
        disposeImage(e, value)
      }}
    />
  )
}
const Dispose = {
  Video: DisposeVideo,
  Image: DisposeImage,
}
export default Dispose
