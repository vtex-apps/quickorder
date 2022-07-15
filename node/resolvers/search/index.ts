/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { UserInputError } from '@vtex/api'
import atob from 'atob'

import { resolvers as refidsResolvers } from './refids'

export const fieldResolvers = {
  ...refidsResolvers,
}

export const queries = {
  skuFromRefIds: async (
    _: any,
    args: { refids: string; orderFormId: string; refIdSellerMap: any },
    ctx: Context
  ): Promise<any> => {
    const {
      clients: { search, segment },
      vtex: { segmentToken },
    } = ctx

    if (!args.refids) {
      throw new UserInputError('No refids provided')
    }

    const items = await search.skuFromRefIds({
      refids: args.refids,
      orderFormId: args.orderFormId,
      refIdSellerMap: args.refIdSellerMap,
      salesChannel: segmentToken
        ? JSON.parse(atob(segmentToken)).channel
        : (await segment.getSegment()).channel,
    })

    return {
      cacheId: args.refids,
      items,
    }
  },
  sellers: async (_: any, __: any, ctx: Context): Promise<any> => {
    const {
      clients: { search },
    } = ctx

    const items = await search.sellers()

    return {
      cacheId: 'sellers',
      items,
    }
  },
}
