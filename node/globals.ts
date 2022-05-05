import type {
  IOContext,
  ParamsContext,
  RecorderState,
  ServiceContext,
} from '@vtex/api'
import { MetricsAccumulator } from '@vtex/api'

import type { Clients } from './clients'

if (!global.metrics) {
  console.error('No global.metrics at require time')
  global.metrics = new MetricsAccumulator()
}

declare global {
  type Context = ServiceContext<Clients, RecorderState, CustomContext>

  interface CustomContext extends ParamsContext {
    cookie: string
    originalPath: string
    vtex: IOContext
  }

  interface Property {
    name: string
    values: [string]
  }

  interface TranslatableMessage {
    content: string
    from: string
    id: string
  }

  interface Reference {
    Key: string
    Value: string
  }
}
