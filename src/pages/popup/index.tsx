import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

if (chrome.runtime.lastError) console.log(chrome.runtime.lastError)
const root = ReactDOM.createRoot(
  document.getElementById('popup-root') as HTMLElement
)
root.render(<App />)
