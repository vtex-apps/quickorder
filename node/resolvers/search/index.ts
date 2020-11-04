import { UserInputError } from '@vtex/api'

import { resolvers as refidsResolvers } from './refids'

export const fieldResolvers = {
  ...refidsResolvers,
}

export const queries = {
  skuFromRefIds: async (
    _: any,
    args: { refids: string; orderFormId: string },
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
}
