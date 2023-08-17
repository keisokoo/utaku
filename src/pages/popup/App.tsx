import React, { useEffect } from 'react'
import useWebRequests from './hooks/useWebRequests'

const objectKeys = <T extends object>(item: T) => {
  return Object.keys(item) as Array<keyof T>
}
const objectEntries = <T extends object>(item: T) => {
  return Object.entries(item) as Array<[keyof T, T[keyof T]]>
}

const App = (): JSX.Element => {
  const results = useWebRequests(true)
  const { sourceGroup } = results
  useEffect(() => {
    const onMessage = (
      request: string,
      sender: chrome.runtime.MessageSender,
      sendResponse: (response?: {
        data: {
          [x: string]: chrome.webRequest.WebResponseHeadersDetails
        }
        downloaded: string[]
      }) => void
    ) => {
      const senderTabId = sender?.tab?.id
      if (!senderTabId) return
      if (request === 'get-items') {
        const data = sourceGroup[senderTabId]
        sendResponse({ data, downloaded: [] })
      }
    }
    if (!chrome.runtime.onMessage.hasListener(onMessage)) {
      chrome.runtime.onMessage.addListener(onMessage)
    }
    return () => {
      if (chrome.runtime.onMessage.hasListener(onMessage)) {
        chrome.runtime.onMessage.removeListener(onMessage)
      }
    }
  }, [sourceGroup])
  useEffect(() => {
    console.log('results', results.sourceGroup)
  }, [results])
  return (
    <div>
      <h1>Popup Page!</h1>
      <p>허 참 어이가 없네?!</p>
      <div>
        {objectKeys(sourceGroup).map((result) => {
          const item = sourceGroup[result]
          return (
            <div key={String(result)}>
              <div>
                {String(result)}
                <span>{Object.keys(item).length}</span>
              </div>
              <div>
                {objectEntries(item).map(([key, value]) => {
                  return <div key={key}>{value.url}</div>
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default App
