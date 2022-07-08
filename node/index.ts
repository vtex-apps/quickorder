import './globals'

import type { Cached, RecorderState } from '@vtex/api'
import { LRUCache, Service } from '@vtex/api'

import { Clients } from './clients'
import { resolvers } from './resolvers'

let TWO_SECONDS_MS = 2 * 1000
let THREE_SECONDS_MS = 3 * 1000
let SIX_SECONDS_MS = 6 * 1000

// Segments are small and immutable.
const MAX_SEGMENT_CACHE = 10000
const segmentCache = new LRUCache<string, Cached>({ max: MAX_SEGMENT_CACHE })
const searchCache = new LRUCache<string, Cached>({ max: 3000 })
const messagesCache = new LRUCache<string, Cached>({ max: 3000 })

metrics.trackCache('segment', segmentCache)
metrics.trackCache('search', searchCache)
metrics.trackCache('messages', messagesCache)

TWO_SECONDS_MS = 3 * 1000
THREE_SECONDS_MS = 4 * 1000
SIX_SECONDS_MS = 5 * 1000

export default new Service<Clients, RecorderState, CustomContext>({
  clients: {
    implementation: Clients,
    options: {
      default: {
        retries: 2,
        timeout: THREE_SECONDS_MS,
      },
      messagesGraphQL: {
        concurrency: 5,
        memoryCache: messagesCache,
        timeout: TWO_SECONDS_MS,
      },
      search: {
        concurrency: 10,
        memoryCache: searchCache,
        timeout: SIX_SECONDS_MS,
      },
    },
  },
  graphql: {
    resolvers,
  },
})
