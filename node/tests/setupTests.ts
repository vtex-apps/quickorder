import { MetricsAccumulator } from '@vtex/api'

if (!global.metrics) {
  global.metrics = new MetricsAccumulator()
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
          get: jest.fn((url: string): any => {
            if (url.match(/orderForm/)) {
              return {
                salesChannel: '1',
                storePreferencesData: {
                  countryCode: 'BR',
                },
                shippingData: {},
              }
            }
          }),
          post: jest.fn(() => ({
            items: [
              {
                sku: '1',
                id: '1',
              },
            ],
          })),
          postRaw: jest.fn(() => ({
            status: 200,
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
      IOClients: jest.fn(() => ({
        getOrSet: jest.fn(),
      })),
      LRUCache: jest.fn(),
      RecorderState: jest.fn(),
      UserInputError: jest.fn(),
      Service: jest.fn((config): any => {
        return { config }
      }),
    } as any)
)
