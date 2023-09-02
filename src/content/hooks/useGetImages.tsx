import { isEqual, sortBy, uniq } from 'lodash-es'
import { useEffect, useState } from 'react'
import { getAllImageUrls, getAllVideoUrls } from './getImages'

export const useGetImages = (exceptSelector?: string) => {
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
    observer.observe(targetNode, config)
    return () => {
      observer.disconnect()
    }
  }, [])
  return [imageList, videoList]
}
