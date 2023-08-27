import React from 'react'
import { RecoilRoot } from 'recoil'
import FilterEditor from '../../src/components/Filter/FilterEditor'
import Modal from '../../src/components/Modal'
import '../scss/style.scss'
function App() {
  return (
    <RecoilRoot>
      <div>
        <Modal target="#utaku-modal" open={true} onClose={() => {}}>
          <FilterEditor emitFilter={() => {}} />
        </Modal>
      </div>
    </RecoilRoot>
  )
}
export default App
