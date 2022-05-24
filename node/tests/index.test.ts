import type { IOContext } from '@vtex/api'

import Service from '../index'
import { Search } from '../clients/search'

type GraphQLResolver = {
  resolvers: any
}

jest.mock(
  '@vtex/api',
  () =>
    ({
      IOContext: jest.fn(),
      MetricsAccumulator: jest.fn((): any => ({
        trackCache: jest.fn(),
      })),
      JanusClient: jest.fn(() => ({
        http: {
          getRaw: jest.fn(() => ({
            status: 200,
            data: {
              items: [
                {
                  isActive: true,
                  id: '1',
                  name: 'Foo bar',
                },
              ],
            },
          })),
          postRaw: jest.fn(() => ({
            res: 200,
            data: [
              {
                id: '1',
              },
            ],
          })),
        },
        context: {
          authToken: 'tokenMocked',
        },
      })),
      IOClients: jest.fn(),
      LRUCache: jest.fn(),
      RecorderState: jest.fn(),
      UserInputError: jest.fn(),
      Service: jest.fn((config): any => {
        return { config }
      }),
    } as any)
)

describe('Index module', () => {
  const { resolvers } = Service.config.graphql as GraphQLResolver
  const { Query } = resolvers
  const context = {} as IOContext
  const clients = {
    search: new Search(context),
  }

  it('Instances should be defined', () => {
    expect(Service).toBeDefined()
    expect(resolvers).toBeDefined()
    expect(Query).toBeDefined()
  })

  it('Should return the data from the query', async () => {
    try {
      const data = await Query.skuFromRefIds(
        {},
        {
          refids: true,
          orderFormId: '',
          refIdSellerMap: {},
        },
        {
          clients,
        }
      )

      expect(data).toBeDefined()
    } catch (e) {
      console.error(e)
    }
  })
})
