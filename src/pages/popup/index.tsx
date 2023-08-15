import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

console.log('popup script')

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
root.render(<App />)
