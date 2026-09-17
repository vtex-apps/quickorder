/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { UserInputError } from '@vtex/api'

import { resolvers as refidsResolvers } from './refids'

export const fieldResolvers = {
  ...refidsResolvers,
}

const getSellers = async (context: Context, salesChannel?: string) => {
  const {
    clients: { search },
    vtex: { segment, logger },
  } = context

  let items: any = []

  try {
    const { data } = await search.sellers(salesChannel ?? segment?.channel)

    items = data.items
      .filter((item: any) => {
        return item.isActive === true
      })
      .map(({ id, name, availableSalesChannels }: any) => {
        const availableSalesChannelsIds = availableSalesChannels.map(
          (sc: { id: number }) => sc.id
        )

        return {
          id,
          name,
          availableSalesChannels: availableSalesChannelsIds,
        }
      })
  } catch (error) {
    logger.error({
      error,
      message: 'quickOrder-sellersError',
    })
  }

  return {
    cacheId: 'sellers',
    items,
  }
}

const AVAILABILITY_WORST_FIRST: Record<string, number> = {
  withoutStock: 0,
  partiallyAvailable: 1,
  '': 1,
  available: 2,
}

const worstSimulationAvailability = (left: string, right: string) => {
  const leftPriority = AVAILABILITY_WORST_FIRST[left] ?? 1
  const rightPriority = AVAILABILITY_WORST_FIRST[right] ?? 1

  return leftPriority <= rightPriority ? left : right
}

export const mergeSellerSimulationInfo = (
  existing: {
    seller: string
    availability: string
    unitMultiplier: number
    quantity: number
    priceTags: unknown[]
  },
  incoming: {
    seller: string
    availability: string
    unitMultiplier: number
    quantity: number
    priceTags: unknown[]
  }
) => ({
  seller: existing.seller,
  availability: worstSimulationAvailability(
    existing.availability,
    incoming.availability
  ),
  unitMultiplier: existing.unitMultiplier ?? incoming.unitMultiplier ?? 1,
  quantity: (existing.quantity ?? 0) + (incoming.quantity ?? 0),
  priceTags: [...(existing.priceTags ?? []), ...(incoming.priceTags ?? [])],
})

export const mergeSkuSimulationSellers = (
  sellers: Array<{
    seller: string
    availability: string
    unitMultiplier: number
    quantity: number
    priceTags: unknown[]
  }>
) => {
  const sellersById = new Map<string, (typeof sellers)[number]>()

  sellers.forEach(sellerInfo => {
    const existing = sellersById.get(sellerInfo.seller)

    sellersById.set(
      sellerInfo.seller,
      existing
        ? mergeSellerSimulationInfo(existing, sellerInfo)
        : sellerInfo
    )
  })

  return Array.from(sellersById.values())
}

const checkoutSimulation = async (
  { refids, orderForm, refIdSellerMap, salesChannel }: SimulateArgs,
  context: Context
) => {
  const {
    clients: { search },
    vtex: { logger },
  } = context

  let resItems: any = {}

  try {
    const { items: simulatedItems }: any = await search.simulate({
      refids,
      orderForm,
      refIdSellerMap,
      salesChannel,
    })

    if (!simulatedItems.length) {
      return resItems
    }

    resItems = simulatedItems.reduce((acc: any, item: any) => {
      const sellerInfo = {
        seller: item.seller,
        availability: item.availability ?? '',
        unitMultiplier: item.unitMultiplier ?? 1,
        quantity: item.quantity,
        priceTags: item.priceTags ?? [],
      }

      const previousSellers = acc[item.id]?.sellers ?? []

      return {
        ...acc,
        [item.id]: {
          sellers: mergeSkuSimulationSellers([
            ...previousSellers,
            sellerInfo,
          ]),
        },
      }
    }, {})
  } catch (error) {
    logger.error({
      error,
      message: 'quickOrder-simulateError',
    })
  }

  return resItems
}

const getSellerIdNameMap = (sellersList: any) => {
  const sellerMap = new Map()

  sellersList.forEach((seller: any) => sellerMap.set(seller.id, seller.name))

  return sellerMap
}

const getSkuSellers = async (
  context: Context,
  result: any,
  sellersList: any
) => {
  const {
    clients: { search },
    vtex: { logger },
  } = context

  const sellerIdNameMap = getSellerIdNameMap(sellersList)
  const sellersIds = new Set(sellersList?.map((seller: any) => seller.id))

  result = await Promise.all(
    result.map(async (item: any) => {
      const { sku, refid, quantity } = item

      if (sku === null) {
        return {
          sku,
          refid,
          sellers: [],
          quantity,
        }
      }

      return search
        .sellerBySku(sku)
        .then((res: any) => {
          const validSellers = res.data?.SkuSellers
            ? res.data.SkuSellers.filter((seller: any) => {
              // check if seller is active and available in current sales channel
              return (
                seller.IsActive === true && sellersIds.has(seller.SellerId)
              )
            }).map(({ SellerId }: any) => {
              return {
                id: SellerId,
                name: sellerIdNameMap.get(SellerId),
              }
            })
            : null

          return {
            sku,
            refid,
            sellers: validSellers,
            quantity,
          }
        })
        .catch((error: any) => {
          logger.error({
            error,
            sku,
            refid,
            message: 'quickOrder-sellerBySkuError',
          })

          return {
            sku,
            refid,
            sellers: null,
            quantity,
          }
        })
    })
  )

  return result
}

const isPromotionAdjustedSimulationQuantity = (
  simulatedQuantity: number | undefined,
  requestedQuantity: number,
  priceTags: unknown
) => {
  if (simulatedQuantity === undefined) {
    return false
  }

  // Promotional simulations may return more units than requested (e.g. gifted items).
  if (simulatedQuantity > requestedQuantity) {
    return true
  }

  return Array.isArray(priceTags) && priceTags.length > 0
}

export const getSkuSellerInfo = (simulationResults: any, result: any) => {
  let items: any = []

  if (Object.keys(simulationResults).length !== 0) {
    items = result.map((item: any) => {
      const skuInfoBySeller = item.sellers?.flatMap((seller: any) => {
        if (!simulationResults[item.sku]) {
          return [];
        }

        const currSeller = simulationResults[item.sku].sellers.find(
          (s: any) => s.seller === seller.id
        )

        const {
          availability = '',
          unitMultiplier = 1,
          quantity: simulatedQuantity = undefined,
          priceTags = [],
        } = currSeller ?? {}

        const requestedQuantity = item.quantity

        const isPartiallyAvailable =
          availability === 'available' &&
          simulatedQuantity !== undefined &&
          simulatedQuantity < requestedQuantity &&
          !isPromotionAdjustedSimulationQuantity(
            simulatedQuantity,
            requestedQuantity,
            priceTags
          )

        return {
          ...seller,
          availability: isPartiallyAvailable
            ? 'partiallyAvailable'
            : availability,
          unitMultiplier,
          availableQuantity: isPartiallyAvailable
            ? simulatedQuantity
            : requestedQuantity,
        }
      })

      return {
        ...item,
        sellers: skuInfoBySeller,
      }
    })
  }

  return items
}

export const queries = {
  skuFromRefIds: async (
    _: any,
    args: {
      refids: string
      orderFormId: string
      refIdSellerMap: any
      refIdQuantityMap: any
    },
    ctx: Context
  ): Promise<any> => {
    const {
      clients: { search },
      vtex: { segment, logger },
    } = ctx

    const { refids, orderFormId, refIdSellerMap, refIdQuantityMap } = args

    if (!refids) {
      throw new UserInputError('No refids provided')
    }

    let items: any = []

    try {
      const { data: skuIds } = await search.skuFromRefIds(refids)

      let result: any = []
      const resultStr: any = {}

      const orderForm = await search
        .getOrderForm(orderFormId)
        .catch((error: any) => {
          logger.error({
            error,
            orderFormId,
            message: 'quickOrder-getOrderFormError',
          })
        })

      const currentSC = segment?.channel ?? orderForm.salesChannel

      // filter out sellers that aren't available in current sales channel
      const { items: sellersList } = await getSellers(ctx, currentSC)

      const refs = Object.getOwnPropertyNames(skuIds)

      refs.forEach(id => {
        resultStr[id] = {
          sku: skuIds[id],
          refid: id,
          sellers: sellersList,
          quantity: refIdQuantityMap?.[id] ?? 1,
        }

        result.push(resultStr[id])
      })

      // gets SKU's sellers
      if (sellersList?.length) {
        result = await getSkuSellers(ctx, result, sellersList)
      }

      // update refIdSellerMap to include list of sellers by SKU
      result.forEach((item: any) => {
        refIdSellerMap[item.refid] = item.sellers
          ? item.sellers.map((seller: any) => seller.id)
          : null
      })

      await checkoutSimulation(
        {
          refids: result,
          orderForm,
          refIdSellerMap,
          salesChannel: currentSC,
        },
        ctx
      ).then(simulationResults => {
        if (Object.keys(simulationResults).length !== 0) {
          // include SKU's availability and unit multiplier info in given seller
          items = getSkuSellerInfo(simulationResults, result)
        } else {
          // ensures that each item in the result array has a sellers array that only includes sellers with a defined and non-null availability property.
          // If no such sellers exist, the sellers array will be empty.
          items = result.map((item: { sellers: any[] }) => ({
            ...item,
            sellers: item.sellers?.filter((seller: any) =>
              'availability' in seller &&
              seller.availability !== null
            ) || []
          }))
        }
      })
    } catch (error) {
      logger.error({
        error,
        message: 'quickOrder-skuFromRefIdsError',
      })
    }

    return {
      cacheId: refids,
      items,
    }
  },
  sellers: async (_: any, __: any, ctx: Context): Promise<any> => {
    return getSellers(ctx)
  },
}
