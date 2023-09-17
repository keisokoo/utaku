import React, {
  createContext,
  MutableRefObject,
  useEffect,
  useReducer,
  useRef,
} from 'react'
import ReactDOM from 'react-dom'
import S from './Modal.styles'
import { ModalProps } from './Modal.types'

export type ModalValuesType = {
  open: boolean
}
export type ModalActions = {
  dispatch?: React.Dispatch<{
    type: 'OPEN' | 'CLOSE'
    payload: ModalValuesType
  }>
}
const initialModalValues: ModalValuesType = {
  open: false,
}
export const ModalContext = createContext<ModalValuesType & ModalActions>(
  initialModalValues
)
export const modalReducer = (
  _state: ModalValuesType,
  action: { type: 'OPEN' | 'CLOSE'; payload: ModalValuesType }
): ModalValuesType => {
  switch (action.type) {
    case 'OPEN':
      return {
        ..._state,
        open: true,
      }
    case 'CLOSE':
      return {
        ...initialModalValues,
      }
    default:
      throw new Error('잘못된 요청')
  }
}
export const ModalProvider = (props: ModalProps) => {
  const [state, dispatch] = useReducer(modalReducer, initialModalValues)

  return (
    <ModalContext.Provider value={{ ...state, dispatch }}>
      {props.children}
    </ModalContext.Provider>
  )
}

const Modal = ({
  open,
  onClose,
  children,
  target = '.utaku-modal',
  ...props
}: ModalProps) => {
  const wrapRef = useRef() as MutableRefObject<HTMLDivElement>
  const childrenWithProps = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { onClose } as { onClose: () => void })
    }
    return child
  })
  useEffect(() => {
    const targetElement = document.body.querySelector(target)
    if (!targetElement) return
    if (open) {
      targetElement.setAttribute('data-utaku-active', '')
    } else {
      targetElement.removeAttribute('data-utaku-active')
    }
    return () => {
      targetElement.removeAttribute('data-utaku-active')
    }
  }, [target, open])
  return ReactDOM.createPortal(
    <>
      {open && (
        <S.Container {...props}>
          <S.Wrap tabIndex={0} ref={wrapRef}>
            {childrenWithProps}
          </S.Wrap>
          <S.Background
            onClick={(e) => {
              e.stopPropagation()
              onClose()
            }}
          />
        </S.Container>
      )}
    </>,
    document.querySelector(target)!
  )
}
export default Modal
