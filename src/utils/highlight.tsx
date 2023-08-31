import React from 'react'
import { v4 as uuidV4 } from 'uuid'

export const termsMatchSplit = (
  terms: string,
  target: string,
  className: string = 'highlight'
) => {
  const result = terms.split('+').map((str) => {
    return str
      .toLowerCase()
      .normalize('NFC')
      .replace(/(-[^\s]+)/g, '')
      .split(/\s/g)
      .filter((ii) => ii)
      .flat()
  })
  const resultArray = result.reduce((acc, val) => acc.concat(val), [])
  const matches = target.split(
    new RegExp(
      `(${escapeRegExp(resultArray.join('|').normalize('NFC'))})`,
      'gi'
    )
  )
  const resultWords = matches.map<React.ReactNode>((resultTerm) => {
    return (
      <React.Fragment key={uuidV4()}>
        {resultArray.includes(resultTerm.toLowerCase()) ? (
          <span className={className}>{resultTerm}</span>
        ) : (
          <>{resultTerm}</>
        )}
      </React.Fragment>
    )
  })
  return resultWords
}

function escapeRegExp(text: string) {
  return text.replace(/[-[\]{}()*+?.,\\^$#\s]/g, '\\$&')
}
const highlight = (
  itemTarget: string | null,
  term?: string | null,
  className?: string
): string | JSX.Element => {
  if (!itemTarget) return ''
  if (!term) return itemTarget
  if (term.length < 1) return itemTarget
  const terms = termsMatchSplit(term, itemTarget, className)
  return <>{terms}</>
}

export const multiHighlight = (
  str: string | null,
  extractStr?: string[] | null
) => {
  if (!str) return []
  if (!extractStr) return [{ in: false, value: str }]
  if (extractStr.length < 1) return [{ in: false, value: str }]

  const regex = new RegExp(extractStr.map((s) => `(${s})`).join('|'), 'g')
  const result: { in: boolean; value: string }[] = []
  let lastIndex = 0

  str.replace(regex, (match, ...args) => {
    const index = args[args.length - 2]

    if (index > lastIndex) {
      result.push({ in: false, value: str.slice(lastIndex, index) })
    }

    result.push({ in: true, value: match })
    lastIndex = index + match.length

    return match // 여기서 match를 반환
  })

  if (lastIndex < str.length) {
    result.push({ in: false, value: str.slice(lastIndex) })
  }
  return result
}
export default highlight
