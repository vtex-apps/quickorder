import { getSkuSellerInfo } from '../resolvers/search/index'

describe('getSkuSellerInfo', () => {
  const baseResult = [
    {
      sku: '100',
      refid: 'REF-1',
      quantity: 10,
      sellers: [{ id: '1', name: 'Seller 1' }],
    },
  ]

  const simulationForSeller = (sellerInfo: Record<string, unknown>) => ({
    '100': {
      sellers: [{ seller: '1', ...sellerInfo }],
    },
  })

  it('keeps user-entered quantity when simulation quantity matches', () => {
    const items = getSkuSellerInfo(
      simulationForSeller({
        availability: 'available',
        quantity: 10,
        unitMultiplier: 1,
      }),
      baseResult
    )

    expect(items[0].sellers[0]).toMatchObject({
      availability: 'available',
      availableQuantity: 10,
    })
  })

  it('marks partial availability when simulation quantity is below requested stock', () => {
    const items = getSkuSellerInfo(
      simulationForSeller({
        availability: 'available',
        quantity: 5,
        unitMultiplier: 1,
      }),
      baseResult
    )

    expect(items[0].sellers[0]).toMatchObject({
      availability: 'partiallyAvailable',
      availableQuantity: 5,
    })
  })

  it('does not treat promotional quantity increases as partial availability', () => {
    const items = getSkuSellerInfo(
      simulationForSeller({
        availability: 'available',
        quantity: 12,
        unitMultiplier: 1,
      }),
      baseResult
    )

    expect(items[0].sellers[0]).toMatchObject({
      availability: 'available',
      availableQuantity: 10,
    })
  })

  it('marks partial availability when simulation quantity is below request even with promotional price tags', () => {
    const items = getSkuSellerInfo(
      simulationForSeller({
        availability: 'available',
        quantity: 8,
        unitMultiplier: 1,
        priceTags: [{ name: 'progressive-discount' }],
      }),
      baseResult
    )

    expect(items[0].sellers[0]).toMatchObject({
      availability: 'partiallyAvailable',
      availableQuantity: 8,
    })
  })

  it('preserves withoutStock availability from simulation', () => {
    const items = getSkuSellerInfo(
      simulationForSeller({
        availability: 'withoutStock',
        quantity: 0,
        unitMultiplier: 1,
      }),
      baseResult
    )

    expect(items[0].sellers[0]).toMatchObject({
      availability: 'withoutStock',
      availableQuantity: 10,
    })
  })
})
