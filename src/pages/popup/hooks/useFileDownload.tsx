import { uniq } from 'lodash-es'
import { useCallback, useEffect, useState } from 'react'
type CONFLICT_ACTION = 'overwrite' | 'uniquify'
const useFileDownload = (
  endCallback?: (item: chrome.downloads.DownloadItem) => void,
  disabled?: boolean
) => {
  const [conflictAction, set_conflictAction] =
    useState<CONFLICT_ACTION>('uniquify')
  const [downloadedItem, set_downloadedItem] = useState<string[]>([])
  const [folderName, set_folderName] = useState<string>('utaku')
  const handleFolderName = useCallback((name: string) => {
    set_folderName(name)
    chrome.storage.local.set({ folderName: name })
    chrome.runtime.sendMessage(
      { message: 'set-folderName', data: name },
      () => {
        if (chrome.runtime.lastError) console.log(chrome.runtime.lastError)
      }
    )
  }, [])
  const handleConflictAction = useCallback((type: CONFLICT_ACTION) => {
    set_conflictAction(type)
  }, [])

  useEffect(() => {
    function handleDownloadChange(
      downloadDelta: chrome.downloads.DownloadDelta
    ) {
      getProgress(downloadDelta.id, () => {})
    }
    function getProgress(
      downloadId: number,
      callback: (percent: number) => void
    ) {
      chrome.downloads.search({ id: downloadId }, function (item) {
        if (item[0].totalBytes > 0) {
          set_downloadedItem((prev) => uniq([...prev, item[0].url]))
          callback(item[0].bytesReceived / item[0].totalBytes)
          endCallback && endCallback(item[0])
        } else {
          callback(-1)
        }
      })
    }
    if (
      !chrome.downloads.onChanged.hasListener(handleDownloadChange) &&
      !disabled
    ) {
      chrome.downloads.onChanged.addListener(handleDownloadChange)
    } else {
      chrome.downloads.onChanged.removeListener(handleDownloadChange)
    }
    return () => {
      if (chrome.downloads.onChanged.hasListener(handleDownloadChange)) {
        chrome.downloads.onChanged.removeListener(handleDownloadChange)
      }
    }
  }, [disabled])
  useEffect(() => {
    function downloadFilenameSuggest(
      downloadItem: chrome.downloads.DownloadItem,
      suggest: (
        suggestion?: chrome.downloads.DownloadFilenameSuggestion | undefined
      ) => void
    ) {
      try {
        const manifestData = chrome.runtime.getManifest()
        const extensionName = manifestData.name
        const trimmed = folderName
          .replace(/[^\x20-\x7E]/gim, '')
          .trim()
          .normalize('NFC')
        const checked =
          trimmed[trimmed.length - 1] === '/' ? trimmed : trimmed + '/'
        const fileName = checked + downloadItem.filename
        if (downloadItem.byExtensionName === extensionName) {
          suggest({
            filename: fileName,
            conflictAction,
          })
        }
      } catch (error) {
        console.log('error', error)
      }
    }
    if (
      !chrome.downloads.onDeterminingFilename.hasListener(
        downloadFilenameSuggest
      ) &&
      !disabled
    ) {
      chrome.downloads.onDeterminingFilename.addListener(
        downloadFilenameSuggest
      )
    } else {
      chrome.downloads.onDeterminingFilename.removeListener(
        downloadFilenameSuggest
      )
    }
    return () => {
      if (
        chrome.downloads.onDeterminingFilename.hasListener(
          downloadFilenameSuggest
        )
      ) {
        chrome.downloads.onDeterminingFilename.removeListener(
          downloadFilenameSuggest
        )
      }
    }
  }, [conflictAction, folderName, disabled])

  return {
    conflictAction,
    folderName,
    downloadedItem,
    handleFolderName,
    handleConflictAction,
  }
}
export default useFileDownload
