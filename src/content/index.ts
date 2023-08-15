// element의 transform의 x값 y값을 가져오는 함수
function getTransformXY(el: HTMLElement) {
  const transform = window.getComputedStyle(el).transform
  if (transform === 'none') {
    return { x: 0, y: 0 }
  }
  const matrix = transform.match(/^matrix\((.+)\)$/)
  if (!matrix) {
    return { x: 0, y: 0 }
  }
  const [_a, _b, _c, _d, e, f] = matrix[1]
    .split(',')
    .map((item) => parseFloat(item))
  return { x: e, y: f }
}

// 드래그 가능한 버튼으로 만들어주는 함수, 화면밖은 못나가게
function attachDragEvent(el: HTMLButtonElement) {
  el.addEventListener('mousedown', (e: MouseEvent) => {
    const clientX = e.clientX
    const clientY = e.clientY
    const startPosition = getTransformXY(el)
    const startX = startPosition.x
    const startY = startPosition.y
    const moveHandler = (e: MouseEvent) => {
      const scrollBarWidth =
        document.documentElement.scrollWidth - window.innerWidth
      const diffX = e.clientX - clientX
      const diffY = e.clientY - clientY
      let nextX = startX + diffX
      let nextY = startY + diffY

      const maxX = window.innerWidth - el.offsetWidth + scrollBarWidth
      const maxY = window.innerHeight - el.offsetHeight
      nextX = Math.min(maxX, Math.max(0, nextX))
      nextY = Math.min(maxY, Math.max(0, nextY))
      el.style.transform = `translate(${nextX}px, ${nextY}px)`
    }
    const upHandler = () => {
      document.removeEventListener('mousemove', moveHandler)
      document.removeEventListener('mouseup', upHandler)
    }
    document.addEventListener('mousemove', moveHandler)
    document.addEventListener('mouseup', upHandler)
  })
}
function adjustPositionOnResize(el: HTMLButtonElement) {
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
function createFloatingButton() {
  // 화면에 둥둥 떠다니는 버튼을 만들어주는 함수
  const floatingButton = document.createElement('button')
  floatingButton.innerText = '버튼'
  floatingButton.style.position = 'fixed'
  floatingButton.style.top = '0px'
  floatingButton.style.left = '0px'
  floatingButton.style.width = '100px'
  floatingButton.style.height = '100px'
  floatingButton.style.borderRadius = '50%'
  floatingButton.style.backgroundColor = 'red'
  floatingButton.style.color = 'white'
  floatingButton.style.fontSize = '20px'
  floatingButton.style.zIndex = '9999'
  floatingButton.style.border = 'none'
  floatingButton.style.outline = 'none'
  floatingButton.style.cursor = 'pointer'
  attachDragEvent(floatingButton)
  window.addEventListener('resize', () =>
    adjustPositionOnResize(floatingButton)
  )
  document.body.appendChild(floatingButton)
  function fadeOutElement(el: HTMLElement) {
    let opacity = 1
    const fadeDuration = 150
    const startTime = performance.now()

    function animateFadeOut(time: number) {
      const elapsed = time - startTime
      opacity = 1 - elapsed / fadeDuration
      el.style.opacity = opacity.toString()

      if (elapsed < fadeDuration) {
        requestAnimationFrame(animateFadeOut)
      } else {
        el.style.opacity = '0'
      }
    }

    requestAnimationFrame(animateFadeOut)
  }

  let hideTimeout: number | null = null

  window.addEventListener('mousemove', () => {
    if (hideTimeout) {
      clearTimeout(hideTimeout)
    }
    floatingButton.style.opacity = '1' // 요소를 보이게 함
    hideTimeout = setTimeout(() => fadeOutElement(floatingButton), 3000) // 3초 후에 fadeout 효과를 시작함
  })
}

function main() {
  console.log('content script1!!')
  createFloatingButton()
}
main()
