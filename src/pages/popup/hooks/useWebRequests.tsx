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
  const [queueList, set_queueList] = useState<ImageResponseDetails[]>([])
  const [disposedList, set_disposedList] = useState<ImageResponseDetails[]>([])
  const [errorList, set_errorList] = useState<
    chrome.webRequest.WebResponseHeadersDetails[]
  >([])
  const [tabIdList, set_tabIdList] = useState<number[]>([])
  const [tabList, set_tabList] = useState<TAB_LIST_TYPE[]>([])

  const clearListByTabId = useCallback((tabId: number) => {
    set_queueList((prev) => prev.filter((curr) => curr.tabId !== tabId))
    set_disposedList((prev) => prev.filter((curr) => curr.tabId !== tabId))
    set_errorList((prev) => prev.filter((curr) => curr.tabId !== tabId))
  }, [])

  const requeueDisposeList = useCallback(
    (tabId: number) => {
      set_queueList((prev) => [
        ...prev,
        ...disposedList.filter((curr) => curr.tabId === tabId),
      ])
    },
    [disposedList]
  )
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
  const disposedGroup = useMemo(() => {
    return groupBy(disposedList, (curr) => curr.tabId)
  }, [disposedList])
  const errorGroup = useMemo(() => {
    return groupBy(errorList, (curr) => curr.tabId)
  }, [errorList])
  const queueGroup = useMemo(() => {
    return groupBy(queueList, (curr) => curr.tabId)
  }, [queueList])

  useEffect(() => {
    const TabIdList = Object.keys(queueGroup).map((keyName) => Number(keyName))
    set_tabIdList((prev) => (isEqual(prev, TabIdList) ? prev : TabIdList))
  }, [queueGroup])

  const clearList = useCallback(() => {
    set_queueList([])
  }, [])

  const handleSourceList = useCallback((item: ImageResponseDetails[]) => {
    set_queueList(uniqBy(item, (curr) => curr.url))
  }, [])
  const handleRemove = useCallback(
    (
      item: chrome.webRequest.WebResponseHeadersDetails & {
        error: boolean
      }
    ) => {
      set_queueList((prev) => prev.filter((curr) => curr.url !== item.url))
      if (item.error) {
        set_errorList((prev) => uniqBy([...prev, item], (curr) => curr.url))
      } else {
        set_disposedList((prev) => uniqBy([...prev, item], (curr) => curr.url))
      }
    },
    []
  )

  useEffect(() => {
    function getCurrentResponse(req: ImageResponseDetails) {
      if (req.type === 'image' || req.type === 'media') {
        set_queueList((prev) => uniqBy([...prev, req], (curr) => curr.url))
        if (req && req.tabId && typeof req.tabId === 'number' && req.tabId > 0)
          chrome.tabs.get(req.tabId).then((tab) => {
            if (chrome.runtime.lastError) {
              console.log(chrome.runtime.lastError.message)
              return
            }
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
    errorGroup,
    disposedGroup,
    disposedList,
    errorList,
    queueList,
    set_queueList,
    tabList,
    tabIdList,
    queueGroup,
    handleTooltip,
    clearList,
    handleRemove,
    handleSourceList,
    clearListByTabId,
    requeueDisposeList,
  }
}

export default useWebRequests
