import { SerializedStyles } from '@emotion/react'
import { isElement } from 'lodash-es'
import React, { useRef } from 'react'
import { FaVectorSquare } from 'react-icons/fa'
import { v4 } from 'uuid'
import { LimitBySelectorType } from '../../atoms/settings'
import { getItemsFromCurrentElementTarget } from '../../content/hooks/getImages'
import { toItemType } from '../../content/hooks/useGetImages'
import { ItemType } from '../../content/types'
import { lang } from '../../utils'
import { WhiteFill } from '../Buttons'

interface GetLimitAreaProps {
  emitSelector?: (selector: string) => void
  emitItemList?: (itemList: ItemType[]) => void
  emitLimitSelector?: (limitSelector: LimitBySelectorType) => void
  emitOnOff?: (onOff: boolean) => void
  btnText?: string | JSX.Element
  $css?: SerializedStyles | string
  _mini?: boolean
  _icon?: boolean
}
function escapeString(value: string): string {
  return value.replace(/([!"#$%&'()*+,./:;<=>?@[\]^`{|}~])/g, '\\$1')
}

const GetLimitArea = ({
  emitSelector,
  emitItemList,
  emitLimitSelector,
  emitOnOff,
  btnText,
  $css,
  _icon,
  _mini,
}: GetLimitAreaProps) => {
  const [onOff, set_onOff] = React.useState(false)

  const getQuerySelector = (element: HTMLElement) => {
    if (!isElement(element)) return ''
    const utakuRoot = document.querySelector('.utaku-root')
    if (utakuRoot?.contains(element)) {
      return ''
    }
    if (element.id) return `#${escapeString(element.id)}`
    if (element.classList.length > 0) {
      const nextClassName = `.${Array.from(element.classList)
        .map((item) => escapeString(item))
        .join('.')}`
      return nextClassName
    }
    const attributes = Array.from(element.attributes).filter((item) => {
      return item.name !== 'style' && item.name !== 'utaku-highlight'
    })
    if (attributes.length > 0)
      return attributes
        .map((attr) => `[${attr.name}="${escapeString(attr.value)}"]`)
        .join('')
    return element.tagName.toLowerCase()
  }
  const mouseClickToGetQuerySelector = (e: MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    const target = e.target as HTMLElement
    if (target.tagName.toLowerCase() === 'iframe') {
      removeEventOnMouseOverForGetQuerySelector()
      return
    }
    let parentQuery = ''
    const targetNames = ['img', 'video', 'svg', 'a']
    if (
      targetNames.includes(target.tagName.toLowerCase()) &&
      target.parentElement
    ) {
      parentQuery = getQuerySelector(target.parentElement as HTMLElement)
    }
    if (!isElement(target)) return
    const querySelector = getQuerySelector(target)
    if (!querySelector) {
      removeEventOnMouseOverForGetQuerySelector()
      return
    }
    let imageQuery = ''
    let videoQuery = ''
    if (target.tagName === 'IMG') {
      imageQuery = querySelector
    } else if (target.tagName === 'VIDEO') {
      videoQuery = querySelector
    } else if (!parentQuery) {
      parentQuery = querySelector
    }
    const limitSelector = {
      id: v4(),
      name: window.location.host,
      host: window.location.host,
      selector: {
        parent: parentQuery,
        image: imageQuery,
        video: videoQuery,
      },
    }
    removeEventOnMouseOverForGetQuerySelector()
    if (emitItemList) {
      const currentItems = getItemsFromCurrentElementTarget(
        target,
        '.utaku-root',
        [limitSelector]
      )
      const images = currentItems.image.map((item) => toItemType(item, 'image'))
      const videos = currentItems.media.map((item) => toItemType(item, 'media'))
      emitItemList([...images, ...videos])
    }
    emitLimitSelector && emitLimitSelector(limitSelector)
    emitSelector && emitSelector(querySelector)
  }
  const highlightedElement = useRef<HTMLElement>()

  const mouseOverToGetQuerySelector = (e: MouseEvent) => {
    const target = e.target as HTMLElement
    const utakuRoot = document.querySelector('.utaku-root')
    if (target.tagName.toLowerCase() === 'iframe') return
    if (utakuRoot?.contains(target)) return
    if (isElement(target)) {
      const currentIframe = (e.currentTarget as Document).defaultView
        ?.frameElement as HTMLIFrameElement | null
      const doc = currentIframe?.contentDocument
        ? currentIframe.contentDocument
        : document
      const targetElement = doc.elementFromPoint(
        e.clientX,
        e.clientY
      ) as HTMLElement
      if (highlightedElement.current) {
        highlightedElement.current.removeAttribute('utaku-highlight')
      }
      targetElement.setAttribute('utaku-highlight', '')
      highlightedElement.current = targetElement
    }
  }
  const injectStylesIfNeeded = (iframe: HTMLIFrameElement) => {
    const utakuStyle = `[utaku-highlight] {
      outline: 3px solid #27beff !important;
      box-shadow: inset 0px 0px 100vw 100vw #c2fdff91;
      filter: sepia(1);
      transition: 0.3s ease-out;
      cursor: copy;
    }`
    const iframeDoc = iframe.contentDocument

    if (iframeDoc) {
      let styleElement = iframeDoc.querySelector(
        'style[data-custom-style]'
      ) as HTMLStyleElement

      if (!styleElement) {
        styleElement = iframeDoc.createElement('style') as HTMLStyleElement
        styleElement.setAttribute('data-custom-style', '')
        iframeDoc.head?.appendChild(styleElement)
      }

      styleElement.innerHTML = utakuStyle
    }
  }
  const removeInjected = (iframe: HTMLIFrameElement) => {
    const iframeDoc = iframe.contentDocument

    if (iframeDoc) {
      const styleElement = iframeDoc.querySelector(
        'style[data-custom-style]'
      ) as HTMLStyleElement

      if (styleElement) {
        styleElement.remove()
      }
    }
  }
  function prevent(e: Event) {
    e.stopPropagation()
    e.preventDefault()
  }
  const setEventOnMouseOverForGetQuerySelector = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.stopPropagation()
    e.preventDefault()
    set_onOff(true)
    emitOnOff && emitOnOff(true)
    document.querySelectorAll('iframe').forEach((el) => {
      if (el.contentDocument) {
        injectStylesIfNeeded(el)
        el.contentDocument.addEventListener(
          'mouseover',
          mouseOverToGetQuerySelector
        )
        el.contentDocument.addEventListener(
          'click',
          mouseClickToGetQuerySelector,
          true
        )
      }
    })
    document.addEventListener('mouseenter', prevent)
    document.addEventListener('mouseover', mouseOverToGetQuerySelector)
    document.addEventListener('click', mouseClickToGetQuerySelector, true)
  }
  const removeEventOnMouseOverForGetQuerySelector = () => {
    set_onOff(false)
    emitOnOff && emitOnOff(false)
    document.querySelectorAll('[utaku-highlight]').forEach((el) => {
      el.removeAttribute('utaku-highlight')
    })
    document.querySelectorAll('iframe').forEach((el) => {
      if (el.contentDocument) {
        removeInjected(el)
        el.contentDocument
          .querySelectorAll('[utaku-highlight]')
          .forEach((curr) => {
            curr.removeAttribute('utaku-highlight')
          })
        el.contentDocument.removeEventListener(
          'mouseover',
          mouseOverToGetQuerySelector
        )
        el.contentDocument.removeEventListener(
          'click',
          mouseClickToGetQuerySelector,
          true
        )
      }
    })
    document.removeEventListener('mouseenter', prevent)
    document.removeEventListener('mouseover', mouseOverToGetQuerySelector)
    document.removeEventListener('click', mouseClickToGetQuerySelector, true)
  }
  return (
    <>
      <WhiteFill
        _mini={_mini}
        _icon={_icon}
        data-active={onOff}
        onClick={setEventOnMouseOverForGetQuerySelector}
        $css={$css}
      >
        {btnText ?? (
          <>
            <FaVectorSquare /> {lang('select_area')}
          </>
        )}
      </WhiteFill>
    </>
  )
}
export default GetLimitArea
