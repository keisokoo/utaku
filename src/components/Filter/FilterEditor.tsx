import styled from '@emotion/styled/macro'
import React from 'react'

const FilterEditorWrap = styled.div``

export type UrlFilter = {
  host: string
  selected: string[]
  params: {
    [k: string]: string
  }
  from: string
  to: string
}

interface FilterEditorProps {}
const FilterEditor = ({ ...props }: FilterEditorProps) => {
  return (
    <>
      <FilterEditorWrap></FilterEditorWrap>
    </>
  )
}
export default FilterEditor
