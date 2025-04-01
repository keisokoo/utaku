import React from 'react'
import { ItemType } from './types'
interface DisposeVideoProps {
  value: ItemType
  disposeVideo: (
    e: React.SyntheticEvent<HTMLVideoElement, Event>,
    value: ItemType
  ) => void
  onError?: (e: React.SyntheticEvent<HTMLVideoElement, Event>) => void
}
interface DisposeImageProps {
  value: ItemType
  disposeImage: (
    e: React.SyntheticEvent<HTMLImageElement, Event>,
    value: ItemType
  ) => void
  onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void
}
export const DisposeVideo = ({
  value,
  onError,
  disposeVideo,
}: DisposeVideoProps) => {
  return (
    <video
      src={value.url}
      autoPlay={false}
      muted
      loop
      controls={false}
      onCanPlay={(e) => {
        disposeVideo(e, value)
      }}
      onLoadedMetadata={(e) => {
        disposeVideo(e, value)
      }}
      onError={(e) => {
        onError && onError(e)
      }}
    />
  )
}
export const DisposeImage = ({
  value,
  onError,
  disposeImage,
}: DisposeImageProps) => {
  return (
    <img
      src={value.url}
      alt={value.requestId}
      onLoad={(e) => {
        disposeImage(e, value)
      }}
      onError={(e) => {
        onError && onError(e)
      }}
    />
  )
}
const Dispose = {
  Video: DisposeVideo,
  Image: DisposeImage,
}
export default Dispose
