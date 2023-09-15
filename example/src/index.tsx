import React from 'react'
import ReactDOM from 'react-dom/client'
import ko from '../../public/_locales/ko/messages.json'
import App from './App'
window.chrome = {
  storage: {
    local: {
      get: (keys, callback) => {
        console.log('keys', keys)
        console.log('callback', callback)
        return
      },
      set: async (items) => {
        console.log('items', items)
        return
      },
    },
    sync: {
      get: (keys, callback) => {
        console.log('keys', keys)
        console.log('callback', callback)
        return
      },
      set: async (items) => {
        console.log('items', items)
        return
      },
    },
  },
  i18n: {
    getMessage: (messageName, substitutions) => {
      if (ko?.[messageName as keyof typeof ko] === undefined) return messageName
      return (
        ko?.[messageName as keyof typeof ko]?.message ??
        messageName ??
        substitutions
      )
    },
  },
} as typeof chrome

ReactDOM.createRoot(document.getElementById('root')! as HTMLElement).render(
  <App />
)
