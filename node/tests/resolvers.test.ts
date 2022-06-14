import { resolvers } from '../resolvers'

describe('Graphql resolvers', () => {
  const { Query } = resolvers

  const mockContext = {
    clients: {
      search: {
        skuFromRefIds: jest.fn(),
        sellers: jest.fn(),
      },
    },
  }

  it('[GraphQL] skuFromRefIds', async () => {
    const data = await Query.skuFromRefIds(
      {},
      {
        refids: [],
        orderFormId: '',
        refIdSellerMap: {},
      },
      mockContext as any
    )

    expect(data).toBeDefined()
  })

  it('[GraphQL] sellers', async () => {
    const data = await Query.sellers(
      {},
      {
        refids: [],
        orderFormId: '',
        refIdSellerMap: {},
      },
      mockContext as any
    )

    expect(data).toBeDefined()
  })
})
