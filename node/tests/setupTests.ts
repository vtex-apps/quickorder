import { MetricsAccumulator } from '@vtex/api'

import orderFormMocked from './data/orderFormMocked'
import simulationMocked from './data/simulationMocked'
import postStockMocked from './data/postStockMocked'
import getStockMocked from './data/getStockMocked'
import getSellersMocked from './data/getSellersMocked'

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
          getRaw: jest.fn((url): any => {
            if (url.match(/stockkeep/)) {
              return {
                status: 200,
                data: getStockMocked(),
              }
            }

            if (url.match(/sellers/)) {
              return {
                status: 200,
                data: getSellersMocked(),
              }
            }
          }),
          get: jest.fn((url: string): any => {
            if (url.match(/orderForm/)) {
              return orderFormMocked()
            }
          }),
          post: jest.fn((url: string): any => {
            if (url.match(/simulation/)) {
              return simulationMocked()
            }
          }),
          postRaw: jest.fn((url: string): any => {
            if (url.match(/stockkeep/)) {
              return {
                status: 200,
                data: postStockMocked(),
              }
            }
          }),
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
