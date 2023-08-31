import { groupBy, isEqual, uniqBy } from 'lodash-es'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { UrlRemapItem } from '../../../atoms/settings'
import { WebResponseItem } from '../../../content/types'
import { parseItemWithUrlRemaps } from '../../../utils'

interface TAB_LIST_TYPE extends chrome.tabs.Tab {
  tooltip?: string
}

const useWebRequests = (
  active = true,
  appliedRemapList: UrlRemapItem[] = []
) => {
  const [originalList, set_originalList] = useState<WebResponseItem[]>([])
  const [removedList, set_removedList] = useState<WebResponseItem[]>([])
  const [queueList, set_queueList] = useState<WebResponseItem[]>([])
  const [disposedList, set_disposedList] = useState<WebResponseItem[]>([])
  const [errorList, set_errorList] = useState<WebResponseItem[]>([])
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
      if (!tab?.url?.startsWith('http')) return
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
      chrome.tabs.get(activeInfo.tabId, function (tab) {
        if (chrome.runtime.lastError) console.log(chrome.runtime.lastError)
        if (!tab?.url?.startsWith('http')) return
        set_tabList((prev) =>
          prev.some((tabItem) => tabItem.id === activeInfo.tabId)
            ? prev.map((tabItem) =>
                tabItem.id === activeInfo.tabId
                  ? { ...tabItem, active: true }
                  : { ...tabItem, active: false }
              )
            : [...prev, tab]
        )
      })
    }
    const focusWindow = (windowId: number) => {
      if (windowId > 0) {
        chrome.tabs.query({ active: true, windowId }, (result) => {
          if (chrome.runtime.lastError) console.log(chrome.runtime.lastError)
          if (result[0] && result[0].id)
            if (!result[0].url?.startsWith('http')) return
          set_tabList((prev) =>
            prev.some((tabItem) => tabItem.id === result[0].id)
              ? prev.map((tabItem) =>
                  tabItem.id === result[0].id
                    ? { ...tabItem, active: true }
                    : { ...tabItem, active: false }
                )
              : [...prev, { ...result[0], active: true }]
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
  const removedGroup = useMemo(() => {
    return groupBy(removedList, (curr) => curr.tabId)
  }, [removedList])
  const originalGroup = useMemo(() => {
    return groupBy(originalList, (curr) => curr.tabId)
  }, [originalList])
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

  const handleSourceList = useCallback((item: WebResponseItem[]) => {
    set_queueList(uniqBy(item, (curr) => curr.url))
  }, [])
  const removeQueueItem = useCallback(
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
  const removeDisposedItem = useCallback((item: WebResponseItem) => {
    set_removedList((prev) => {
      if (item.imageInfo?.active) item.imageInfo.active = false
      return uniqBy([...prev, item], (curr) => curr.url)
    })
    set_disposedList((prev) => prev.filter((curr) => curr.url !== item.url))
  }, [])
  const returnRemoved = useCallback((item: WebResponseItem[]) => {
    if (item.length === 0) return
    set_removedList((prev) => {
      const next = prev.filter((curr) => item[0].tabId !== curr.tabId)
      return next
    })
    set_disposedList((prev) => [...prev, ...item])
  }, [])
  const reapplyRemaps = useCallback(
    (tabId?: number) => {
      if (tabId) {
        set_queueList((prev) =>
          prev
            .filter((curr) => curr.tabId === tabId)
            .map((curr) => parseItemWithUrlRemaps(appliedRemapList, curr))
        )
      } else {
        set_queueList((prev) =>
          prev.map((curr) => parseItemWithUrlRemaps(appliedRemapList, curr))
        )
      }
    },
    [appliedRemapList]
  )

  useEffect(() => {
    function getCurrentResponse(req: WebResponseItem) {
      if (req.type === 'image' || req.type === 'media') {
        if (errorList.map((item) => item.url).includes(req.url)) return
        req = parseItemWithUrlRemaps(appliedRemapList, req)
        set_originalList((prev) => uniqBy([...prev, req], (curr) => curr.url))
        set_queueList((prev) => uniqBy([...prev, req], (curr) => curr.url))
        // if (req && req.tabId && typeof req.tabId === 'number' && req.tabId > 0)
        //   chrome.tabs.get(req.tabId).then((tab) => {
        //     if (chrome.runtime.lastError) {
        //       console.log(chrome.runtime.lastError.message)
        //       return
        //     }
        //     set_tabList((prev) => {
        //       if (prev.some((item) => item.id === tab.id)) return prev
        //       return uniqBy([...prev, tab], (curr) => curr.id)
        //     })
        //   })
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
    return () => {
      chrome.webRequest.onHeadersReceived.removeListener(getCurrentResponse)
    }
  }, [active, appliedRemapList, errorList])

  return {
    removedGroup,
    originalGroup,
    errorGroup,
    disposedGroup,
    disposedList,
    errorList,
    queueList,
    tabList,
    tabIdList,
    queueGroup,
    returnRemoved,
    removeDisposedItem,
    handleTooltip,
    clearList,
    removeQueueItem,
    handleSourceList,
    clearListByTabId,
    requeueDisposeList,
    reapplyRemaps,
  }
}

export default useWebRequests
