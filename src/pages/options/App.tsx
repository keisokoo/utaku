import React, { useEffect, useMemo, useState } from 'react'
import { FaRegEdit } from 'react-icons/fa'
import { RecoilRoot } from 'recoil'
import { LogoBoxW, UtakuW } from '../../assets'
import { lang } from '../../utils'
import { OptionStyle } from './Options.styled'
import './index.scss'
const O = OptionStyle
const App = (): JSX.Element => {
  return (
    <RecoilRoot>
      <Main />
    </RecoilRoot>
  )
}
const navList = [
  {
    name: 'Tutorial',
    id: 'tutorial',
  },
  {
    name: 'Faq',
    id: 'faq',
  },
  {
    name: '',
    id: 'empty',
  },
  {
    name: 'Support',
    id: 'support',
  },
  {
    name: 'Contact',
    id: 'contact',
  },
]

const Main = (): JSX.Element => {
  const [language, setLanguage] = useState<string | null>(null)

  useEffect(() => {
    if (chrome && chrome.i18n) {
      const uiLanguage = chrome.i18n.getUILanguage()
      setLanguage(uiLanguage)
    }
  }, [])
  const isKorean = useMemo(() => {
    return language === 'ko'
  }, [language])
  return (
    <O.Wrap>
      <O.Header>
        <UtakuW />
      </O.Header>
      <O.Nav>
        {navList.map((item) => (
          <div key={item.id}>
            <a href={'#' + item.id}>{item.name}</a>
          </div>
        ))}
      </O.Nav>
      <O.Body>
        <O.Columns>
          <O.Box id="tutorial">
            <h1>{`Update 0.1.4`}</h1>
            <O.Title>{isKorean ? '업데이트 내역' : 'update'}</O.Title>
            <O.VideoBox>
              <O.VideoTitle>{`0.1.4`}</O.VideoTitle>
              <O.Description>
                <p>
                  {isKorean
                    ? `
                이전 버전의 원본 추적 설정을 기본으로 변경했습니다.
                세팅되어있지 않다면, 설정 - 추가 설정에서 추가해주세요.
                기존 옛날버전 사용자라면 비슷한 사용경험을 할 수 있을거라 생각합니다.

                라이브모드를 별도로 분리하여, 이전 버전의 원본 추적 버튼을 추가했습니다.
                영역 제한 설정을 추가했습니다.
                
                가능한 설명을 툴팁으로 추가했습니다.

                영역 선택 버튼을 만들어 두었습니다.
                나머지 사항은 아래의 영상을 참고해주세요.

                `
                    : `
                Changed the original tracking settings to the default for the previous version.
                If it is not set, please add it in Settings - Additional Settings.
                If you are an old version user, I think you can have a similar experience.

                Separated the live mode and added the original tracking button of the previous version.
                Added area restriction settings.

                Added tooltips for possible explanations.

                I made a button to select the area.
                For the rest, please refer to the video below.
                `}
                </p>
              </O.Description>
              <O.Links>
                <a
                  href="https://www.youtube.com/watch?v=4weuvr3yeW0"
                  target="_blank"
                  rel="noreferrer"
                >
                  1. {isKorean ? '업데이트 요약' : 'Update Summary'}{' '}
                  (https://www.youtube.com/watch?v=4weuvr3yeW0)
                </a>
                <a
                  href="https://www.youtube.com/watch?v=k7kG5ryNSfE"
                  target="_blank"
                  rel="noreferrer"
                >
                  2. {isKorean ? '영역 선택 기능' : 'Area selection function'}{' '}
                  (https://www.youtube.com/watch?v=k7kG5ryNSfE)
                </a>

                <a
                  href="https://www.youtube.com/watch?v=mPyhdZy7zXk"
                  target="_blank"
                  rel="noreferrer"
                >
                  3.{' '}
                  {isKorean
                    ? '설정 추가 방법 변경, 설정 가능한 기능 추가'
                    : 'Change the way to add settings, add available functions'}{' '}
                  (https://www.youtube.com/watch?v=mPyhdZy7zXk)
                </a>

                <a
                  href="https://www.youtube.com/watch?v=2zutZACxuoc"
                  target="_blank"
                  rel="noreferrer"
                >
                  4.{' '}
                  {isKorean
                    ? '도메인별 영역 제한 설정 추가'
                    : 'Add domain-specific area restriction settings'}{' '}
                  (https://www.youtube.com/watch?v=2zutZACxuoc)
                </a>

                <a
                  href="https://www.youtube.com/watch?v=dfsxJFTUk84"
                  target="_blank"
                  rel="noreferrer"
                >
                  5. {isKorean ? '라이브 모드 추가' : 'Add live mode'}{' '}
                  (https://www.youtube.com/watch?v=dfsxJFTUk84)
                </a>
              </O.Links>
            </O.VideoBox>
          </O.Box>
          <O.Box id="tutorial">
            <h1>{`Tutorials`}</h1>
            <O.Title>{lang('basic_usage')}</O.Title>
            <O.VideoBox>
              <O.VideoTitle>{lang('simple_mode')}</O.VideoTitle>
              <O.Responsive>
                <O.Iframe
                  src="https://www.youtube.com/embed/4weuvr3yeW0"
                  title="UTAKU Remap Tutorial"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture;"
                  allowFullScreen
                />
              </O.Responsive>
              <O.VideoDescription>
                <p>{lang('simple_mode_description')}</p>
              </O.VideoDescription>
            </O.VideoBox>
            <O.VideoBox>
              <O.VideoTitle>{lang('enhanced_mode')}</O.VideoTitle>
              <O.Responsive>
                <O.Iframe
                  src="https://www.youtube.com/embed/_BRwT2XNxck"
                  title="UTAKU Remap Tutorial"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture;"
                  allowFullScreen
                />
              </O.Responsive>
              <O.VideoDescription>
                <p>{lang('basic_usage_description')}</p>
              </O.VideoDescription>
            </O.VideoBox>
            <O.Title>
              {lang('remap_usage')}
              <FaRegEdit />
            </O.Title>
            <O.Description>
              <p>{lang('remap_usage_description')}</p>
            </O.Description>
            <O.VideoBox>
              <O.VideoTitle>{lang('remap_by_query_edit')}</O.VideoTitle>
              <O.Responsive>
                <O.Iframe
                  src="https://www.youtube.com/embed/_8ZyoktO-bA"
                  title="UTAKU Remap Tutorial"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture;"
                  allowFullScreen
                />
              </O.Responsive>
              <O.VideoDescription>
                <p>{lang('remap_by_query_edit_description')}</p>
              </O.VideoDescription>
            </O.VideoBox>
            <O.VideoBox>
              <O.VideoTitle>{lang('remap_by_path_edit')}</O.VideoTitle>
              <O.Responsive>
                <O.Iframe
                  src="https://www.youtube.com/embed/B38ajCZYxOY"
                  title="UTAKU Remap Tutorial"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture;"
                  allowFullScreen
                />
              </O.Responsive>
              <O.VideoDescription>
                <p>{lang('remap_by_path_edit_description')}</p>
              </O.VideoDescription>
            </O.VideoBox>
            <O.VideoBox>
              <O.VideoTitle>{lang('remap_by_replace_edit')}</O.VideoTitle>
              <O.Responsive>
                <O.Iframe
                  src="https://www.youtube.com/embed/FMM-EfudSig"
                  title="UTAKU Remap Tutorial"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture;"
                  allowFullScreen
                />
              </O.Responsive>
              <O.VideoDescription>
                <p>{lang('remap_by_replace_edit_description')}</p>
              </O.VideoDescription>
            </O.VideoBox>
          </O.Box>
          <O.Box className="center">
            <O.CenterLogo>
              <LogoBoxW />
            </O.CenterLogo>
            <O.Description>{lang('utaku_about')}</O.Description>
          </O.Box>
          <O.Box id="faq">
            <O.Title>FAQ</O.Title>
            {language === 'ko' ? (
              <O.Description>
                <O.Columns>
                  <div>
                    <O.Q>
                      Q: 사용방법이 변한것 같다. 왜 이렇게 업데이트 한것인가?
                    </O.Q>
                    <O.A>
                      A: 여러가지 이유가 있다.
                      <br />
                      기존 UTAKU는 자동으로 원본이미지 URL을 찾아 주도록
                      설계했다.
                      <br />
                      <br />
                      하지만 시간이 지나면서, 사이트가 변경 될때마다 그에
                      대응하기가 곤란해졌다.
                      <br />
                      <br />
                      원본 이미지를 찾는 로직을 사용자가 직접 입력하도록
                      변경했다.
                      <br />
                      그리고 CORS 문제로 인해, 사이즈 정보나 미리보기 기능이
                      제한되었다.
                      <br />
                      더이상 팝업창에 모든 이미지를 띄우는게 불가능 해졌다.
                      <br />
                      <br />
                      이전 버전에서는 페이지 내의 img 태그를 모두 찾아서
                      이미지를 추출 했다.
                      <br />
                      하지만 웹페이지의 작성방식이 다양해지면서, 이 방식이
                      더이상 유효하지 않게 되었다.
                      <br />
                      <br />
                      그래서 네트워크 리소스를 추출하는 방식으로 변경했다.
                      <br />
                      이제는 동적으로 받아오는 이미지도 추출할 수 있다.
                      <br />
                    </O.A>
                  </div>
                </O.Columns>
              </O.Description>
            ) : (
              <O.Description>
                <O.Columns>
                  <div>
                    <O.Q>
                      Q: It seems that the usage has changed. Why did you update
                      it like this?
                    </O.Q>
                    <O.A>
                      A: There are several reasons.
                      <br />
                      The original UTAKU was designed to automatically find the
                      original image URL.
                      <br />
                      <br />
                      However, as time went by, it became difficult to adapt
                      whenever sites changed.
                      <br />
                      <br />
                      We changed it so that users could manually enter the logic
                      to find the original image.
                      <br />
                      And due to CORS issues, size information and preview
                      functions have become limited.
                      <br />
                      It has become impossible to display all images in a popup
                      window anymore.
                      <br />
                      <br />
                      The previous version found all img tags on a page and
                      extracted the images.
                      <br />
                      But as web page creation methods diversified, this method
                      is no longer valid.
                      <br />
                      <br />
                      So, we changed it to extract network resources.
                      <br />
                      Now you can also extract images fetched dynamically.
                      <br />
                    </O.A>
                  </div>
                </O.Columns>
              </O.Description>
            )}
          </O.Box>
          <O.Box id="support">
            <O.Title>Support</O.Title>
            <O.Support>
              <a
                href="https://paypal.me/keisokoo"
                target="_blank"
                rel="noreferrer"
              >
                <img
                  src="https://www.paypalobjects.com/digitalassets/c/website/marketing/apac/C2/logos-buttons/optimize/44_Grey_PayPal_Pill_Button.png"
                  alt="PayPal"
                />
              </a>
              <a
                href="https://www.buymeacoffee.com/keisokoo"
                target="_blank"
                rel="noreferrer"
              >
                <img
                  src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png"
                  alt="Buy Me A Coffee"
                  style={{ height: '60px', width: '217px' }}
                />
              </a>
            </O.Support>
          </O.Box>
          <O.Box id="contact">
            <O.Title>Contact</O.Title>
            <O.Description>
              <a href="mailto:keisokoo@gmail.com">keisokoo@gmail.com</a>
            </O.Description>
          </O.Box>
        </O.Columns>
      </O.Body>
    </O.Wrap>
  )
}

export default App
