import React from 'react'
import { RecoilRoot } from 'recoil'
import GetLimitArea from '../../src/components/LimitArea/GetLimitArea'
import Settings from '../../src/components/Settings/Settings'
import '../scss/style.scss'
function App() {
  return (
    <RecoilRoot>
      <div className="wrapper">
        <GetLimitArea
          emitLimitSelector={(value) => {
            console.log('value', value)
          }}
        />
        <Settings target="#utaku-modal" />
      </div>
    </RecoilRoot>
  )
}
export default App
