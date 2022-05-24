import { MetricsAccumulator } from '@vtex/api'

if (!global.metrics) {
  global.metrics = new MetricsAccumulator()
}
