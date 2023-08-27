import React from 'react'
import ReactDOM from 'react-dom/client'
import { v4 as uuid } from 'uuid'
import App from './App'
import './index.scss'
if (chrome.runtime.lastError) console.log(chrome.runtime.lastError)
let root: ReactDOM.Root | null = null

function onMessage(request: { message: string; data: object }) {
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
    chrome.runtime.sendMessage(
      {
        message: 'available',
      },
      ({ data }: { data: chrome.tabs.Tab | null }) => {
        if (chrome.runtime.lastError) {
          return
        }
        const elementTarget = el ?? document.querySelector('.floating-button')
        if (data) {
          elementTarget?.classList.remove('hide')
        } else {
          elementTarget?.classList.add('hide')
        }
        return true
      }
    )
  } catch (error) {
    console.log('error', error)
  }
}
document.addEventListener('visibilitychange', () => getAvailable())
window.addEventListener('focus', () => getAvailable(), false)
const rootId = uuid()
function toggleMount() {
  if (!root) {
    const container = document.getElementById('root-' + rootId) as HTMLElement
    root = ReactDOM.createRoot(container)
    root.render(<App />)
  } else {
    root.unmount()
    root = null
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
  utakuRoot.classList.add('utaku-root')
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

  window.addEventListener('mousemove', (e) => {
    if (hideTimeout) {
      clearTimeout(hideTimeout)
    }
    button.style.opacity = '1'
    reactRoot.style.opacity = '1'
    button.style.display = ''
    reactRoot.style.display = ''
    hideTimeout = setTimeout(() => {
      fadeOutElement(button)
      if (!reactRoot.contains(e.target as Node)) fadeOutElement(reactRoot)
    }, 5000) // 5초 후에 fadeout 효과를 시작함
  })
}
main()
