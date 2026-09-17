import {
  getSkuSellerInfo,
  mergeSkuSimulationSellers,
} from '../resolvers/search/index'

describe('mergeSkuSimulationSellers', () => {
  it('merges split simulation lines for the same seller (MFL paid + gift)', () => {
    const merged = mergeSkuSimulationSellers([
      {
        seller: '1',
        availability: 'available',
        unitMultiplier: 1,
        quantity: 2,
        priceTags: [],
      },
      {
        seller: '1',
        availability: 'available',
        unitMultiplier: 1,
        quantity: 1,
        priceTags: [{ name: 'more-for-less-gift' }],
      },
    ])

    expect(merged).toHaveLength(1)
    expect(merged[0]).toMatchObject({
      seller: '1',
      availability: 'available',
      quantity: 3,
    })
    expect(merged[0].priceTags).toHaveLength(1)
  })
})

describe('getSkuSellerInfo with merged simulation sellers', () => {
  const mflSplitSimulation = {
    '100': {
      sellers: mergeSkuSimulationSellers([
        {
          seller: '1',
          availability: 'available',
          unitMultiplier: 1,
          quantity: 2,
          priceTags: [],
        },
        {
          seller: '1',
          availability: 'available',
          unitMultiplier: 1,
          quantity: 1,
          priceTags: [{ name: 'more-for-less-gift' }],
        },
      ]),
    },
  }

  it('does not mark MFL split simulation as partial when total quantity matches request', () => {
    const items = getSkuSellerInfo(mflSplitSimulation, [
      {
        sku: '100',
        refid: '1101',
        quantity: 3,
        sellers: [{ id: '1', name: 'Seller 1' }],
      },
    ])

    expect(items[0].sellers[0]).toMatchObject({
      availability: 'available',
      availableQuantity: 3,
    })
  })

  it('marks real partial stock when a single simulation line is below request', () => {
    const items = getSkuSellerInfo(
      {
        '100': {
          sellers: [
            {
              seller: '1',
              availability: 'available',
              unitMultiplier: 1,
              quantity: 2,
              priceTags: [],
            },
          ],
        },
      },
      [
        {
          sku: '100',
          refid: '1101',
          quantity: 3,
          sellers: [{ id: '1', name: 'Seller 1' }],
        },
      ]
    )

    expect(items[0].sellers[0]).toMatchObject({
      availability: 'partiallyAvailable',
      availableQuantity: 2,
    })
  })
})
