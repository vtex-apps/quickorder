import { UserInputError } from '@vtex/api'

import { resolvers as refidsResolvers } from './refids'

export const fieldResolvers = {
  ...refidsResolvers,
}

export const queries = {
  skuFromRefIds: async (
    _: any,
    args: { refids: [string]; orderFormId: string },
    ctx: Context
  ) => {
    const {
      clients: { search },
    } = ctx

    if (!args.refids) {
      throw new UserInputError('No refids provided')
    }

    const items = await search.skuFromRefIds({
      refids: args.refids,
      orderFormId: args.orderFormId,
    })

    return {
      cacheId: args.refids,
      items,
    }
  },
  // eslint-disable-next-line @typescript-eslint/ban-types
  sellers: async (_: any, __: {}, ctx: Context) => {
    const {
      clients: { search },
    } = ctx

    const items = await search.sellers()
    return {
      cacheId: 'sellers',
      items,
    }
  },
  getSkuAvailability: async (
    _: any,
    args: { refIds: string[] },
    ctx: Context
  ) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const { refIds } = args
    const {
      clients: { search },
    } = ctx

    // const sellers = await search.sellers()

    const skuIds = await search.getSkusByRefIds(refIds)
    const refIdsFound = Object.getOwnPropertyNames(skuIds)
    const skus = refIdsFound.map((rfId: any) => ({
        skuId: skuIds[rfId],
        refId: rfId,
    })).filter((sku: any) => sku.skuId != null)

    const products = await Promise.all(skus.map(async (sku: any) =>
      search.searchProductBySkuId(sku.skuId)
    ))

    const allSkus = (products?? []).filter((r: any) => Object.entries(r).length > 0)
      .map((product: any) => {
        if((product.items ?? []).length == 0 || (product.items[0]?.sellers ?? []).length == 0){
          return {}
        }
        const { items, productId, productName } = product
        const { commertialOffer, sellerId, sellerName } = items[0].sellers[0]

        const { AvailableQuantity, IsAvailable } = commertialOffer
        const price = commertialOffer.SellingPrice
          ? commertialOffer.SellingPrice
          : commertialOffer.Price
          ? commertialOffer.Price
          : commertialOffer.ListPrice

        const itemId = items[0].itemId
        const skuRefId = skus.find((sku: any) => sku.skuId === itemId)?.refId

        return {
          refid: skuRefId,
          sku: itemId,
          productId,
          productName,
          price,
          availableQuantity: AvailableQuantity,
          seller: {
            id: sellerId,
            name: sellerName,
          },
          availability: IsAvailable ? 'available' : 'unavailable',
        }
      })

    const itemsRequested = (refIds?? []).map((refId: string) => {
      const existing = allSkus.find((s: any) => s.refid === refId)
      return existing? existing: {
        refid: refId,
        sku: null,
        productId: null,
        productName: null,
        price: null,
        availableQuantity: null,
        seller: null,
        availability: 'unavailable'
      }
    })

    return {
      items: itemsRequested,
    }
  },
}
