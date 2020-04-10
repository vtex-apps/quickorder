/* eslint-disable no-console */
export const GetText = (items: any) => {
  let joinLines = items
    .map((line: any) => {
      return line.content
    })
    .join('\n')
  return joinLines
}

export const ParseText = (textAreaValue: string) => {
  const rawText: any = String(textAreaValue || '')
  const arrText = String(rawText).split(/[\n\r]/)
  let items = arrText
    .filter((item: any) => {
      return String(item).trim() !== ''
    })
    .map((line: any, index: number) => {
      let lineSplitted: any = line.split(',')
      if (lineSplitted.length === 2) {
        if (
          !!lineSplitted[0] &&
          !!String(lineSplitted[1]).trim() &&
          !isNaN(lineSplitted[1])
        ) {
          return {
            line: index,
            sku: String(lineSplitted[0]).trim(),
            quantity: parseInt(String(lineSplitted[1]).trim()),
            content: line,
            error: null,
          }
        }
      }
      return {
        line: index,
        content: line,
        sku: null,
        quantity: null,
        error: 'store/quickorder.invalidPattern',
      }
    })
  return items
}
