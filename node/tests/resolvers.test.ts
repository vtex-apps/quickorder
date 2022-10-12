import vtexContext from './vtexContext'

describe('Graphql resolvers', () => {
  const { Query, clients, vtex } = vtexContext()

  it('[GraphQL] skuFromRefIds', async () => {
    const data = await Query.skuFromRefIds(
      {},
      {
        refids: true,
        orderFormId: '',
        refIdSellerMap: {},
        refIdQuantityMap: {},
      },
      {
        clients,
        vtex,
      }
    )

    expect(data).toBeDefined()
  })

  it('[GraphQL] sellers', async () => {
    const data = await Query.sellers(
      {},
      {
        refids: true,
        orderFormId: '',
        refIdSellerMap: {},
      },
      {
        clients,
        vtex,
      }
    )

    expect(data).toBeDefined()
  })
})
