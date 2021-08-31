export const GetText = (items: any) => {
  const joinLines = items
    .map((line: any) => {
      return line.content
    })
    .join('\n')

  return joinLines
}

const removeDuplicates = (itemList: any) => {
  const map = new Map()

  itemList.forEach(item => {
    const key = item.sku
    const collection = map.get(key)

    if (!collection) {
      map.set(key, item)
    } else {
      // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
      collection.quantity += item.quantity
      collection.content = `${key},${collection.quantity}`
    }
  })

  return Array.from(map, ([, value]) => value)
}

export const ParseText = (textAreaValue: string) => {
  const rawText: any = String(textAreaValue || '')
  const arrText = String(rawText).split(/[\n\r]/)
  const items = arrText
    .filter((item: any) => {
      return String(item).trim() !== ''
    })
    .map((line: any, index: number) => {
      const lineSplitted: any = line.split(',')

      if (lineSplitted.length === 2) {
        if (
          !!lineSplitted[0] &&
          !!String(lineSplitted[1]).trim() &&
          // eslint-disable-next-line no-restricted-globals
          !isNaN(lineSplitted[1])
        ) {
          return {
            index,
            line: index,
            sku: String(lineSplitted[0]).trim(),
            quantity: parseFloat(String(lineSplitted[1]).trim()),
            content: line,
            error: null,
          }
        }
      }

      return {
        index,
        line: index,
        content: line,
        sku: null,
        quantity: null,
        error: 'store/quickorder.invalidPattern',
      }
    })

  return removeDuplicates(items)
}

/**
 *
 * @param orderFormItems
 * @param itemsList
 */
export const itemsInSystem = (orderFormItems, itemsList) => {
  return itemsList.filter(item =>
    // eslint-disable-next-line eqeqeq
    orderFormItems.some(data => data.id == item.id)
  )
}

export const getNewItems = (orderFormItems, itemsList) => {
  return itemsList.filter(
    item =>
      // eslint-disable-next-line eqeqeq
      !orderFormItems.some(data => data.id == item.id)
  )
}

// export const groupItems = (orderFormItems, itemsList) => {
//   const existItems = itemsList.filter(item =>
//     // eslint-disable-next-line eqeqeq
//     orderFormItems.some(data => data.id == item.id)
//   )
//
//   const newItems = itemsList.filter(
//     item =>
//       // eslint-disable-next-line eqeqeq
//       !orderFormItems.some(data => data.id == item.id)
//   )
//
//   console.info('Exist Items : ', existItems)
//   console.info('New Items : ', newItems)
//
//   // itemsList.map(data => console.info('messss :', data))
// }
