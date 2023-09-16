import React from 'react'
import ReactDOM from 'react-dom/client'
import { defaultMode } from '../atoms/settings'
import App from './App'
import './index.scss'
import { rootId } from './sources'

if (chrome.runtime.lastError) console.log(chrome.runtime.lastError)
let root: ReactDOM.Root | null = null

function onMessage(
  request: { message: string; data: object },
  sender?: unknown,
  sendResponse?: (response: string) => void
) {
  if (request?.message === 'utaku-mount') {
    const container = document.getElementById('root-' + rootId) as HTMLElement
    if (!root) {
      root = ReactDOM.createRoot(container)
      root.render(<App />)
    } else {
      container.style.opacity = ''
      container.style.display = ''
    }
  }
  if (request?.message === 'utaku-current-active') {
    if (root) {
      sendResponse && sendResponse('mounted')
    } else {
      sendResponse && sendResponse('ok')
    }
  }
  if (request?.message === 'utaku-active') {
    const elementTarget = document.querySelector('.floating-button')
    if (elementTarget) {
      elementTarget?.classList.remove('hide')
    }
  }
  if (request?.message === 'utaku-quit') {
    const elementTarget = document.querySelector('.floating-button')
    if (elementTarget) {
      elementTarget?.classList.add('hide')
    }
    if (root) {
      root.unmount()
      root = null
    }
  }
  return false
}
chrome.runtime.onMessage.addListener(onMessage)
const getAvailable = (el?: HTMLElement) => {
  try {
    if (chrome.runtime.lastError) console.log(chrome.runtime.lastError)
    chrome.storage.local.get(['modeType'], (results) => {
      const currentMode = results.modeType || defaultMode
      if (currentMode === 'simple') {
        if (root) {
          chrome.runtime.sendMessage({
            message: 'active-icon',
          })
        } else {
          chrome.runtime.sendMessage({
            message: 'inactive-icon',
          })
        }
      }
      if (currentMode === 'enhanced') {
        chrome.runtime.sendMessage(
          {
            message: 'available',
          },
          ({ data }: { data: chrome.tabs.Tab | null }) => {
            if (chrome.runtime.lastError) {
              return
            }
            const elementTarget =
              el ?? document.querySelector('.floating-button')
            if (data) {
              elementTarget?.classList.remove('hide')
            } else {
              elementTarget?.classList.add('hide')
            }
            return true
          }
        )
      }
    })
  } catch (error) {
    if (root) root.unmount()
    root = null
    document.querySelector('.floating-button')?.classList.add('hide')
  }
}
document.addEventListener('visibilitychange', () => getAvailable())
window.addEventListener('focus', () => getAvailable(), false)
function toggleMount() {
  try {
    if (chrome.runtime.lastError) console.log(chrome.runtime.lastError)
    chrome.runtime.sendMessage(
      {
        message: 'available',
      },
      ({ data }: { data: chrome.tabs.Tab | null }) => {
        if (chrome.runtime.lastError) {
          return
        }
        if (data) {
          if (!root) {
            const container = document.getElementById(
              'root-' + rootId
            ) as HTMLElement
            root = ReactDOM.createRoot(container)
            root.render(<App />)
          } else {
            root.unmount()
            root = null
          }
        }
        return true
      }
    )
  } catch (error) {
    if (root) root.unmount()
    root = null
    document.querySelector('.floating-button')?.classList.add('hide')
    return
  }
}
function createFloatingButton() {
  const floatingButton = document.createElement('button')
  getAvailable(floatingButton)
  floatingButton.classList.add('floating-button')
  floatingButton.classList.add('hide')
  floatingButton.innerText = 'UTAKU'
  return floatingButton
}

function main() {
  const utakuRoot = document.createElement('div')
  const utakuModal = document.createElement('div')
  utakuModal.classList.add('utaku-modal')
  utakuModal.classList.add('utaku-css')
  utakuRoot.classList.add('utaku-root')
  utakuRoot.classList.add('utaku-css')
  const reactRoot = document.createElement('div')
  reactRoot.id = 'root-' + rootId
  const button = createFloatingButton()
  utakuRoot.appendChild(button)
  utakuRoot.appendChild(reactRoot)
  utakuRoot.appendChild(utakuModal)
  document.body.appendChild(utakuRoot)
  button.addEventListener('click', toggleMount)
  function fadeOutElement(el: HTMLElement) {
    let opacity = 1
    const fadeDuration = 150
    const startTime = performance.now()

    function animateFadeOut(time: number) {
      const elapsed = time - startTime
      opacity = 1 - elapsed / fadeDuration
      el.style.opacity = opacity.toString()

      if (elapsed < fadeDuration) {
        requestAnimationFrame(animateFadeOut)
      } else {
        el.style.opacity = '0'
        el.style.display = 'none'
      }
    }

    requestAnimationFrame(animateFadeOut)
  }

  let hideTimeout: NodeJS.Timeout | null = null

  window.addEventListener('mousemove', () => {
    if (hideTimeout) {
      clearTimeout(hideTimeout)
    }
    button.style.opacity = '1'
    button.style.display = ''
    hideTimeout = setTimeout(() => {
      fadeOutElement(button)
    }, 3000) // 3초 후에 fadeout 효과를 시작함
  })
}

main()
