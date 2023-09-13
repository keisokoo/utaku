import { isElement } from 'lodash-es'
import React, { useRef } from 'react'
import { getAllImageUrls, getAllVideoUrls } from '../../content/hooks/getImages'
import { toItemType } from '../../content/hooks/useGetImages'
import { ItemType } from '../../content/types'
import { WhiteFill } from '../Buttons'

interface EditLimitAreaProps {
  emitSelector?: (selector: string) => void
  emitItemList?: (itemList: ItemType[]) => void
}
const EditLimitArea = ({ emitSelector, emitItemList }: EditLimitAreaProps) => {
  const [onOff, set_onOff] = React.useState(false)

  const getQuerySelector = (element: HTMLElement) => {
    if (!element) return ''
    if (element.id) return `#${element.id}`
    if (element.className) return `.${element.className.split(' ').join('.')}`
    if (element.attributes.length > 0)
      return Array.from(element.attributes)
        .map((attr) =>
          attr.name === 'style' ? '' : `[${attr.name}="${attr.value}"]`
        )
        .join('')
    return `${element.tagName.toLowerCase()}`
  }
  const mouseClickToGetQuerySelector = (e: MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    let target = e.target as HTMLElement
    if (target.tagName === 'IMG' && target.parentElement) {
      target = target.parentElement as HTMLElement
    }
    if (!isElement(target)) return
    const querySelector = getQuerySelector(target)
    let imageQuery = ''
    let videoQuery = ''
    let parentQuery = ''
    if (target.tagName === 'IMG') {
      imageQuery = querySelector
    } else if (target.tagName === 'VIDEO') {
      videoQuery = querySelector
    } else {
      parentQuery = querySelector
    }
    const images = getAllImageUrls('.utaku-root', {
      host: window.location.host,
      selector: {
        parent: parentQuery,
        image: imageQuery,
        video: videoQuery,
      },
    }).map((item) => toItemType(item, 'image'))
    const videos = getAllVideoUrls('.utaku-root', {
      host: window.location.host,
      selector: {
        parent: parentQuery,
        image: imageQuery,
        video: videoQuery,
      },
    }).map((item) => toItemType(item, 'media'))
    emitItemList && emitItemList([...images, ...videos])
    emitSelector && emitSelector(querySelector)
    removeEventOnMouseOverForGetQuerySelector()
  }
  const highlightedElement = useRef<HTMLElement>()

  const mouseOverToGetQuerySelector = (e: MouseEvent) => {
    const target = e.target as HTMLElement
    const utakuRoot = document.querySelector('.utaku-root')
    if (utakuRoot?.contains(target)) return
    if (isElement(target)) {
      const targetElement = document.elementFromPoint(
        e.clientX,
        e.clientY
      ) as HTMLElement
      if (highlightedElement.current) {
        highlightedElement.current.removeAttribute('data-highlight')
      }
      targetElement.setAttribute('data-highlight', '')
      highlightedElement.current = targetElement
    }
  }
  const setEventOnMouseOverForGetQuerySelector = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.stopPropagation()
    e.preventDefault()
    set_onOff(true)
    document.addEventListener('mouseover', mouseOverToGetQuerySelector)
    document.addEventListener('click', mouseClickToGetQuerySelector, true)
  }
  const removeEventOnMouseOverForGetQuerySelector = () => {
    set_onOff(false)
    document.querySelectorAll('[data-highlight]').forEach((el) => {
      el.removeAttribute('data-highlight')
    })
    document.removeEventListener('mouseover', mouseOverToGetQuerySelector)
    document.removeEventListener('click', mouseClickToGetQuerySelector, true)
  }
  return (
    <>
      <WhiteFill _mini onClick={setEventOnMouseOverForGetQuerySelector}>
        수집영역 선택 {onOff ? 'on' : 'off'}
      </WhiteFill>
    </>
  )
}
export default EditLimitArea
