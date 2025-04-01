export function appendNumberInFrontOfFileName(
  folderName: string,
  url: string,
  index: number,
  padSize: number = 3
) {
  const urlObj = new URL(url)
  const pathname = urlObj.pathname
  const fileName = pathname.split('/').pop()
  const paddedIndex = index.toString().padStart(padSize, '0')
  const parsedFileName = `${paddedIndex}_${fileName}`

  const trimmed =
    folderName ||
    'utaku'
      .replace(/[^\x20-\x7E]/gim, '')
      .trim()
      .normalize('NFC')
  const checked = trimmed[trimmed.length - 1] === '/' ? trimmed : trimmed + '/'
  const result = checked + parsedFileName
  return result
}
