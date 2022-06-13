import type { IOContext } from '@vtex/api'

import Service from '../index'
import { resolvers } from '../resolvers'
import { Search } from '../clients/search'

const vtexContext = () => {
  const { Query } = resolvers
  const context = {} as IOContext
  const clients = {
    search: new Search(context),
  }

  return {
    context,
    clients,
    Query,
    resolvers,
    Service,
  }
}

export default vtexContext
