import { isEqual, sortBy, uniq } from 'lodash-es'
import { useEffect, useState } from 'react'
import { ItemType } from '../types'
import { getAllImageUrls, getAllVideoUrls } from './getImages'

export const toItemType = (url: string, type: 'image' | 'media') => {
  return {
    url: url,
    type: type,
    imageInfo: {
      width: 0,
      height: 0,
      active: false,
    },
  } as ItemType
}
export const useGetImages = (exceptSelector?: string, active?: boolean) => {
  const [imageList, setImageList] = useState<string[]>(
    getAllImageUrls(exceptSelector)
  )
  const [videoList, setVideoList] = useState<string[]>(
    getAllVideoUrls(exceptSelector)
  )
  useEffect(() => {
    const targetNode = document.body
    const config = { attributes: true, childList: true, subtree: true }
    const callback: MutationCallback = (mutationList) => {
      for (const mutation of mutationList) {
        if (mutation.type === 'childList' || mutation.type === 'attributes') {
          setImageList((prev) => {
            const nextImages = uniq([
              ...prev,
              ...getAllImageUrls(exceptSelector),
            ])
            if (
              isEqual(
                sortBy(prev, (item) => item),
                sortBy(nextImages, (item) => item)
              )
            ) {
              return prev
            }
            return nextImages
          })
          setVideoList((prev) => {
            const nextVideos = uniq([
              ...prev,
              ...getAllVideoUrls(exceptSelector),
            ])
            if (
              isEqual(
                sortBy(prev, (item) => item),
                sortBy(nextVideos, (item) => item)
              )
            ) {
              return prev
            }
            return nextVideos
          })
        }
      }
    }
    const observer = new MutationObserver(callback)
    if (active) {
      observer.observe(targetNode, config)
    } else {
      observer.disconnect()
    }
    return () => {
      observer.disconnect()
    }
  }, [active])
  return [
    imageList.map((item) => toItemType(item, 'image')),
    videoList.map((item) => toItemType(item, 'media')),
  ] as [ItemType[], ItemType[]]
}
