import {
  applyDuplicatedRefIdErrors,
  applyRefIdValidationResult,
  buildRefIdQuantityMap,
  DUPLICATED_REFID_ERROR,
  mergeValidatedItemsByIndex,
} from './reviewRefids'

const row = ({
  index,
  sku,
  quantity,
  error = null,
  vtexSku,
}: {
  index: number
  sku: string
  quantity: number
  error?: string | null
  vtexSku?: string | null
}) => ({
  index,
  sku,
  quantity,
  error,
  vtexSku: vtexSku === undefined ? sku : vtexSku,
})

describe('buildRefIdQuantityMap', () => {
  it('keeps the quantity of the first occurrence of each RefId', () => {
    expect(
      buildRefIdQuantityMap([
        { sku: '1105', quantity: 1 },
        { sku: '51-163', quantity: 1 },
        { sku: '1105', quantity: 2 },
      ])
    ).toEqual({
      '1105': 1,
      '51-163': 1,
    })
  })
})

describe('mergeValidatedItemsByIndex', () => {
  it('maps API data by index and never clones quantity or index from another row', () => {
    const reviewItems = [
      row({ index: 0, sku: '1105', quantity: 1, error: null, vtexSku: null }),
      row({ index: 1, sku: '51-163', quantity: 1, error: null, vtexSku: null }),
      row({ index: 2, sku: '1105', quantity: 2, error: null, vtexSku: null }),
    ]

    const validatedItems = [
      {
        ...row({ index: 0, sku: '1105', quantity: 1 }),
        sellers: ['1'],
        unitMultiplier: 1,
      },
      {
        ...row({ index: 1, sku: '51-163', quantity: 1 }),
        sellers: ['1'],
        unitMultiplier: 1,
      },
      {
        ...row({ index: 2, sku: '1105', quantity: 2 }),
        sellers: ['1'],
        unitMultiplier: 1,
      },
    ]

    const merged = mergeValidatedItemsByIndex(reviewItems, validatedItems)

    expect(merged[0]).toMatchObject({ index: 0, sku: '1105', quantity: 1 })
    expect(merged[2]).toMatchObject({ index: 2, sku: '1105', quantity: 2 })
    expect(merged[2].quantity).not.toBe(merged[0].quantity)
  })
})

describe('applyDuplicatedRefIdErrors', () => {
  it('keeps the first occurrence and flags later rows without changing quantities', () => {
    const result = applyDuplicatedRefIdErrors([
      row({ index: 0, sku: '1105', quantity: 1 }),
      row({ index: 1, sku: '51-163', quantity: 1 }),
      row({ index: 2, sku: '1105', quantity: 2 }),
    ])

    expect(result[0]).toMatchObject({
      index: 0,
      sku: '1105',
      quantity: 1,
      error: null,
    })
    expect(result[1]).toMatchObject({
      index: 1,
      sku: '51-163',
      quantity: 1,
      error: null,
    })
    expect(result[2]).toMatchObject({
      index: 2,
      sku: '1105',
      quantity: 2,
      error: DUPLICATED_REFID_ERROR,
    })

    const cartItems = result.filter((item) => item.error === null)
    const quantityBySku = cartItems.reduce<Record<string, number>>(
      (acc, item) => {
        const sku = String(item.sku)

        acc[sku] = (acc[sku] ?? 0) + Number(item.quantity)

        return acc
      },
      {}
    )

    expect(quantityBySku).toEqual({
      '1105': 1,
      '51-163': 1,
    })
  })

  it('clears a leftover duplicate error when that row becomes the first occurrence', () => {
    const result = applyDuplicatedRefIdErrors([
      row({ index: 0, sku: '51-163', quantity: 1 }),
      row({
        index: 1,
        sku: '1105',
        quantity: 2,
        error: DUPLICATED_REFID_ERROR,
      }),
    ])

    expect(result[1]).toMatchObject({
      index: 1,
      sku: '1105',
      quantity: 2,
      error: null,
      vtexSku: null,
    })
  })
})

describe('applyRefIdValidationResult', () => {
  it('reproduces the three-row duplicate RefId case without multiplying quantities', () => {
    const reviewItems = [
      row({ index: 0, sku: '1105', quantity: 1, error: null, vtexSku: null }),
      row({ index: 1, sku: '51-163', quantity: 1, error: null, vtexSku: null }),
      row({ index: 2, sku: '1105', quantity: 2, error: null, vtexSku: null }),
    ]

    const validatedItems = [
      row({ index: 0, sku: '1105', quantity: 1 }),
      row({ index: 1, sku: '51-163', quantity: 1 }),
      row({ index: 2, sku: '1105', quantity: 2 }),
    ]

    const result = applyRefIdValidationResult(reviewItems, validatedItems)

    expect(result.map((item) => item.index)).toEqual([0, 1, 2])
    expect(result.map((item) => item.quantity)).toEqual([1, 1, 2])
    expect(result.map((item) => item.error)).toEqual([
      null,
      null,
      DUPLICATED_REFID_ERROR,
    ])
    expect(
      result
        .filter((item) => item.error === null)
        .map((item) => ({
          sku: item.sku,
          quantity: item.quantity,
        }))
    ).toEqual([
      { sku: '1105', quantity: 1 },
      { sku: '51-163', quantity: 1 },
    ])
  })
})
