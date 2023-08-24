import { SerializedStyles } from '@emotion/react'

export interface ModalProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {
  onClose: () => void
  open: boolean
  _css?: SerializedStyles | string
  target?: string
}
