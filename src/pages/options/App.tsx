import styled from '@emotion/styled'
import React from 'react'
import { RecoilRoot } from 'recoil'
import { UtakuW } from '../../assets'
import './index.scss'
const App = (): JSX.Element => {
  return (
    <RecoilRoot>
      <Main />
    </RecoilRoot>
  )
}
const OptionStyle = {
  Wrap: styled.div`
    margin: 0 auto;
    max-width: 1200px;
  `,
  Header: styled.div`
    display: flex;
    align-items: center;
    justify-content: flex-end;
    flex-direction: column;
    height: 320px;
    border-bottom: 2px solid #fff;
    padding-bottom: 16px;
  `,
  Body: styled.div`
    white-space: pre-line;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  `,
  Nav: styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 16px;
    padding: 16px;
    border-bottom: 2px solid #fff;
    font-size: 24px;
    font-weight: 700;
    & > div {
      cursor: pointer;
      user-select: none;
    }
  `,
  Introduction: styled.div`
    font-size: 18px;
    line-height: 1.2;
    font-weight: 400;
    white-space: pre-line;
  `,
}
const navList = [
  {
    name: 'Home',
    id: 'home',
  },
  {
    name: 'Documents',
    id: 'documents',
  },
  {
    name: 'Blog',
    id: 'blog',
  },
  {
    name: 'Contact',
    id: 'contact',
  },
]
const Main = (): JSX.Element => {
  return (
    <OptionStyle.Wrap>
      <OptionStyle.Header>
        <UtakuW />
      </OptionStyle.Header>
      <OptionStyle.Nav>
        {navList.map((item) => (
          <div key={item.id}>{item.name}</div>
        ))}
      </OptionStyle.Nav>
      <OptionStyle.Body>
        <OptionStyle.Introduction>
          <h1>From developer</h1>
          {`
            UTAKU is an image/media downloader designed to save you time.
            It can remap URLs to fetch original source URLs, which are all customizable to your settings.\n\n Upon activation of the pop-up, you may need to open or refresh your browser to enable UTAKU to read your network resource headers and collect resources.
            The pop-up stays active, dynamically updating as new images are downloaded. To make sure all images are displayed correctly, UTAKU ingeniously verifies image sizes right in the browser tab where they appear, bypassing technical barriers in a lawful manner.\n\n Be cautious though, as using UTAKU may sometimes cause excessive traffic, potentially resulting in temporary loss of access to certain sites. Use it at your own risk and refrain from using images or videos with copyright issues.
            You are free to use UTAKU, but we do not take any responsibility for using downloaded images or videos.\n\n In the future, you might notice ads in pop-ups or option windows. While nobody loves ads, your understanding would go a long way, especially for an older developer just trying to make ends meet. Every click helps, even if it's just enough for a coffee.\n\n Enjoy using UTAKU, and if you can afford to, your support—even just for a coffee—would mean a lot to the developer.`}
        </OptionStyle.Introduction>
        <OptionStyle.Introduction>
          {`UTAKU는 당신의 시간을 절약하기 위해 개발된 이미지/미디어 다운로더입니다.
          원본 URL을 찾아 다운로드할 수 있고, 이는 모두 당신의 설정에 따라 커스터마이징할 수 있습니다.\n\n 팝업을 활성화한 동안, 브라우저를 열거나 새로고침해야 UTAKU가 네트워크 리소스를 읽고 모을 수 있습니다.
          이 팝업은 활성 상태를 유지하였을 때, 새로운 이미지가 다운로드될 때마다 자동으로 업데이트됩니다. UTAKU는 브라우저의 각 탭에서 직접 이미지 크기를 확인해,
          몇몇 이미지가 표시되지 않는 문제를 합법적으로 해결합니다.\n\n 하지만 조심하세요. UTAKU 사용으로 인해 과도한 트래픽이 발생할 수 있으며, 이로 인해 일시적으로 몇몇 사이트에 접근하지 못할 수도 있습니다. 본인의 책임 하에 사용해주세요, 그리고 저작권이 있는 이미지나 동영상은 함부로 사용하지 마세요.
          UTAKU를 사용하는 것은 자유이지만, 다운받은 이미지나 영상을 사용함에 있어서, 어떠한 책임도 지지 않습니다.\n\n 앞으로 팝업이나 설정 창에 광고가 나타날 수 있습니다. 광고는 아무도 좋아하지 않지만, 한 잔의 커피 가격으로도 큰 도움이 되니 이해해 주세요. 특히나 어려운 환경에서 버티고 있는 연장자 개발자에게는 더욱 그렇습니다.\n\n UTAKU를 즐겁게 사용하시고, 여유가 되신다면 개발자에게 커피 한 잔 값의 지원을 해주세요. 그것만으로도 큰 의미가 있습니다.`}
        </OptionStyle.Introduction>
        <h1>Introductions</h1>
        <div id="options" className="options">
          {`사용법은 간단합니다. UTAKU 아이콘을 클릭해서 팝업을 열고, 원하는 사이트를 방문 하면 됩니다.
          팝업이 활성화되면, UTAKU는 자동으로 이미지를 수집하고, 다운로드할 수 있습니다.
          활성화 이전에 사이트를 방문했다면, 새로고침 해주세요.
          `}
          {`그밖에 URL 재구성을 위해 몇 가지 고급 사용자를 위한 설명이 필요할 것 같습니다.
          우선 URL 재구성은 적용이 된 후에만 작동합니다. 적용 후에 기존 이미지에 적용 하려면 새로고침 해주세요.

          재구성 버튼을 누르면, 등록된 재구성 목록이 뜹니다.
          원하는 항목에 체크 한 후 적용을 누르면 됩니다.

          다음으로는 재구성 항목을 추가하는 창을 설명해 보면 크게 어려울것이 없겠네요.
          재구성 버튼을 클릭 후, 추가를 클릭합니다.
          url의 처리 과정은 해당 화면에서 1~3번까지 순차적으로 진행됩니다.

          1. URL 패턴을 통하여 해당 주소가 포함된 항목을 고치도록 준비합니다.
          2. 쿼리를 편집합니다. 값이 비어 있다면, 해당 키값을 제거합니다.
          3. 1~2번 이후에 실행 됩니다. from에서 입력한 값을 to로 대체 합니다.
          from이 없고 to만 있다면, url의 마지막에 해당 텍스트를 추가힙니다.


          `}
        </div>
      </OptionStyle.Body>
    </OptionStyle.Wrap>
  )
}

export default App
