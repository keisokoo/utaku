import { groupBy, isEqual, uniqBy } from 'lodash-es'
import { useCallback, useEffect, useMemo, useState } from 'react'

interface TAB_LIST_TYPE extends chrome.tabs.Tab {
  tooltip?: string
}
export interface ImageResponseDetails
  extends chrome.webRequest.WebResponseHeadersDetails {
  imageInfo?: {
    width: number
    height: number
  }
}
const useWebRequests = (active = true) => {
  const [sourceList, set_sourceList] = useState<ImageResponseDetails[]>([])
  const [videoList, set_videoList] = useState<
    chrome.webRequest.WebResponseHeadersDetails[]
  >([])
  const [tabIdList, set_tabIdList] = useState<number[]>([])
  const [tabList, set_tabList] = useState<TAB_LIST_TYPE[]>([])
  const handleTooltip = (item: TAB_LIST_TYPE, tooltip: string) => {
    set_tabList((prev) =>
      prev.map((curr) => (curr.id === item.id ? { ...curr, tooltip } : curr))
    )
  }

  useEffect(() => {
    const updateOrCreateTab = (
      tabId: number,
      changeInfo: chrome.tabs.TabChangeInfo,
      tab: TAB_LIST_TYPE
    ) => {
      console.log('tab', tab)
      if (!tabId) return
      if (!tab) return
      set_tabList((prev) =>
        prev.some((tabItem) => tabItem.id === tab.id)
          ? prev.map((tabItem) => (tabItem.id === tab.id ? tab : tabItem))
          : [...prev, tab]
      )
    }
    const closeTab = (tabId: number) => {
      if (!tabId) return
      set_tabList((prev) => prev.filter((tabItem) => tabItem.id !== tabId))
    }
    const activeTab = async (activeInfo: chrome.tabs.TabActiveInfo) => {
      if (!activeInfo) return
      set_tabList((prev) =>
        prev.map((tabItem) =>
          tabItem.id === activeInfo.tabId
            ? { ...tabItem, active: true }
            : { ...tabItem, active: false }
        )
      )
    }
    const focusWindow = (windowId: number) => {
      if (windowId > 0) {
        chrome.tabs.query({ active: true, windowId }, (result) => {
          if (result[0] && result[0].id)
            set_tabList((prev) =>
              prev.map((tabItem) =>
                tabItem.id === result[0].id
                  ? { ...tabItem, active: true }
                  : { ...tabItem, active: false }
              )
            )
        })
      }
    }
    chrome.windows.onFocusChanged.addListener(focusWindow)
    chrome.tabs.onActivated.addListener(activeTab)
    chrome.tabs.onUpdated.addListener(updateOrCreateTab)
    chrome.tabs.onRemoved.addListener(closeTab)
    return () => {
      chrome.tabs.onUpdated.removeListener(updateOrCreateTab)
      chrome.tabs.onRemoved.removeListener(closeTab)
      chrome.tabs.onActivated.removeListener(activeTab)
      chrome.windows.onFocusChanged.removeListener(focusWindow)
    }
  }, [])
  const sourceGroup = useMemo(() => {
    const groupByTabId = groupBy(sourceList, (curr) => curr.tabId)
    return Object.keys(groupByTabId).reduce(
      (acc, curr) => {
        acc[curr] = groupByTabId[curr].reduce(
          (prev, current) => {
            prev[current.requestId] = current
            return prev
          },
          {} as {
            [key in string]: ImageResponseDetails
          }
        )
        return acc
      },
      {} as Record<
        keyof typeof groupByTabId,
        {
          [key in string]: ImageResponseDetails
        }
      >
    )
  }, [sourceList])

  useEffect(() => {
    const TabIdList = Object.keys(sourceGroup).map((keyName) => Number(keyName))
    set_tabIdList((prev) => (isEqual(prev, TabIdList) ? prev : TabIdList))
  }, [sourceGroup])

  const clearList = useCallback(() => {
    set_sourceList([])
  }, [])

  const handleSourceList = useCallback((item: ImageResponseDetails[]) => {
    set_sourceList(item)
  }, [])
  const handleRemove = useCallback((url: string) => {
    set_sourceList((prev) => prev.filter((curr) => curr.url !== url))
  }, [])

  useEffect(() => {
    function getCurrentResponse(req: ImageResponseDetails) {
      if (req.type === 'media') {
        set_videoList((prev) => uniqBy([...prev, req], (curr) => curr.url))
      }
      if (req.type === 'image' || req.type === 'media') {
        set_sourceList((prev) => uniqBy([...prev, req], (curr) => curr.url))
        if (req && req.tabId && typeof req.tabId === 'number' && req.tabId > 0)
          chrome.tabs.get(req.tabId).then((tab) => {
            set_tabList((prev) => uniqBy([...prev, tab], (curr) => curr.id))
          })
      }
    }
    const hasListener = chrome.webRequest.onHeadersReceived.hasListeners()
    if (active && !hasListener) {
      chrome.webRequest.onHeadersReceived.addListener(
        getCurrentResponse,
        {
          urls: ['<all_urls>'],
        },
        ['responseHeaders']
      )
    } else if (!active && hasListener) {
      chrome.webRequest.onHeadersReceived.removeListener(getCurrentResponse)
    }
  }, [active])

  return {
    videoList,
    sourceList,
    set_sourceList,
    tabList,
    tabIdList,
    sourceGroup,
    handleTooltip,
    clearList,
    handleRemove,
    handleSourceList,
  }
}

export default useWebRequests
