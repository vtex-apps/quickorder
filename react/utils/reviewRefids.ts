export const DUPLICATED_REFID_ERROR =
  'store/quickorder.review.error.duplicated-refid'

export type ReviewItem = {
  index: number
  sku?: string | null
  quantity?: number | string | null
  error?: string | null
  vtexSku?: string | null
  [key: string]: unknown
}

const hasSku = (sku: unknown): sku is string => {
  return typeof sku === 'string' && sku !== ''
}

export const buildRefIdQuantityMap = (
  items: Array<Pick<ReviewItem, 'sku' | 'quantity'>>
): Record<string, ReviewItem['quantity']> => {
  return items.reduce((prev, item) => {
    if (!hasSku(item?.sku) || prev[item.sku] !== undefined) {
      return prev
    }

    return {
      ...prev,
      [item.sku]: item.quantity,
    }
  }, {} as Record<string, ReviewItem['quantity']>)
}

export const mergeValidatedItemsByIndex = <T extends { index: number }>(
  reviewItems: T[],
  validatedItems: T[]
): T[] => {
  const validatedByIndex = new Map<number, T>()

  validatedItems.forEach((item) => {
    if (item?.index != null) {
      validatedByIndex.set(item.index, item)
    }
  })

  return reviewItems.map((item) => {
    return validatedByIndex.get(item.index) ?? item
  })
}

export const applyDuplicatedRefIdErrors = <T extends ReviewItem>(
  items: T[]
): T[] => {
  const firstIndexBySku: Record<string, number> = {}

  items.forEach((item) => {
    if (!hasSku(item?.sku) || firstIndexBySku[item.sku] !== undefined) {
      return
    }

    firstIndexBySku[item.sku] = item.index
  })

  return items.map((item) => {
    if (!hasSku(item?.sku)) {
      return item
    }

    const isDuplicate = firstIndexBySku[item.sku] !== item.index

    if (isDuplicate) {
      return {
        ...item,
        error: DUPLICATED_REFID_ERROR,
      }
    }

    if (item.error === DUPLICATED_REFID_ERROR) {
      return {
        ...item,
        error: null,
        vtexSku: null,
      }
    }

    return item
  })
}

export const applyRefIdValidationResult = <T extends ReviewItem>(
  reviewItems: T[],
  validatedItems: T[]
): T[] => {
  return applyDuplicatedRefIdErrors(
    mergeValidatedItemsByIndex(reviewItems, validatedItems)
  )
}
