import React from 'react'
import { FaSpinner } from 'react-icons/fa'
import S from './ItemBox.styles'

interface LoadingImageProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {
  length: number
}
const LoadingImage = ({ length, ...props }: LoadingImageProps) => {
  return (
    <>
      <S.LoadingWrap {...props}>
        <span>Loading {length} files...</span>
        <FaSpinner />
      </S.LoadingWrap>
    </>
  )
}
export default LoadingImage
