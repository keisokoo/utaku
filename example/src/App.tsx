import React from 'react'
import { RecoilRoot } from 'recoil'
import Modal from '../../src/components/Modal'
import '../scss/style.scss'
function App() {
  return (
    <RecoilRoot>
      <div>
        <Modal target="#utaku-modal" open={true} onClose={() => {}}></Modal>
      </div>
    </RecoilRoot>
  )
}
export default App
