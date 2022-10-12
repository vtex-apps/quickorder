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
      }

      return {
        ...acc,
        [item.id]: {
          sellers: acc[item.id]?.sellers?.length
            ? acc[item.id].sellers.concat(sellerInfo)
            : [sellerInfo],
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
          sellers: null,
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

const getSkuSellerInfo = (simulationResults: any, result: any) => {
  let items: any = []

  if (Object.keys(simulationResults).length !== 0) {
    items = result.map((item: any) => {
      const skuInfoBySeller = item.sellers.map((seller: any) => {
        if (!simulationResults[item.sku]) {
          return null
        }

        const currSeller = simulationResults[item.sku].sellers.find(
          (s: any) => s.seller === seller.id
        )

        const {
          availability = '',
          unitMultiplier = 1,
          quantity: availableQuantity = undefined,
        } = currSeller ?? {}
        const isPartiallyAvailable = availableQuantity < item.quantity

        return {
          ...seller,
          availability: isPartiallyAvailable
            ? 'partiallyAvailable'
            : availability,
          unitMultiplier,
          availableQuantity,
        }
      })

      return {
        ...item,
        sellers: item.sellers ? skuInfoBySeller : null,
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
        // include SKU's availability and unit multiplier info in given seller
        items = getSkuSellerInfo(simulationResults, result)
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
