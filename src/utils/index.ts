
export function getTransformXY(el: HTMLElement) {
  const transform = window.getComputedStyle(el).transform
  if (transform === 'none') {
    return { x: 0, y: 0 }
  }
  const matrix = transform.match(/^matrix\((.+)\)$/)
  if (!matrix) {
    return { x: 0, y: 0 }
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_a, _b, _c, _d, e, f] = matrix[1]
    .split(',')
    .map((item) => parseFloat(item))
  return { x: e, y: f }
}
export function adjustPositionOnResize(el: HTMLButtonElement) {
  const position = getTransformXY(el)
  let nextX = position.x
  let nextY = position.y

  const scrollBarWidth =
    document.documentElement.scrollWidth - window.innerWidth
  const maxX = window.innerWidth - el.offsetWidth + scrollBarWidth
  const maxY = window.innerHeight - el.offsetHeight

  nextX = Math.min(maxX, Math.max(0, nextX))
  nextY = Math.min(maxY, Math.max(0, nextY))

  el.style.transform = `translate(${nextX}px, ${nextY}px)`
}
const testLocale = {
  "close": {
    "message": "닫기"
  },
  "set_url_filter": {
    "message": "URL 필터 설정"
  },
  "edit_url_filter": {
    "message": "URL 필터 편집"
  },
  "edit_query": {
    "message": "쿼리 편집"
  },
  "change_add_text": {
    "message": "텍스트 변경/추가"
  },
  "edit_filter_name": {
    "message": "필터 이름"
  },
  "already_exists_name": {
    "message": "이미 등록된 이름입니다."
  },
  "input_name": {
    "message": "이름을 입력하세요."
  },
  "apply": {
    "message": "적용"
  },
  "add_query": {
    "message": "쿼리 추가"
  },
  "add": {
    "message": "추가"
  },
  "save": {
    "message": "저장"
  },
  "delete": {
    "message": "삭제"
  }
}

export function lang(value: string) {
  if (!chrome?.i18n) return testLocale[value as keyof typeof testLocale]?.message || value
  return chrome.i18n.getMessage(value)
}