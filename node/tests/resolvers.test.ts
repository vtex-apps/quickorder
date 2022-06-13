import vtexContext from './vtexContext'

describe('Graphql resolvers', () => {
  const { context, Query, clients } = vtexContext()

  it('[GraphQL] skuFromRefIds', async () => {
    const data = await Query.skuFromRefIds(
      {},
      {
        refids: [],
        orderFormId: '',
        refIdSellerMap: {},
      },
      { ...context, clients }
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
      { ...context, clients }
    )

    expect(data).toBeDefined()
  })
})
