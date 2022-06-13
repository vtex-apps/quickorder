import type { IOContext } from '@vtex/api'

import Service from '../index'
// import { resolvers } from '../resolvers'
import type { Clients } from '../clients'
import { Search } from '../clients/search'

type GraphQLResolver = {
  resolvers: any
}

const vtexContext = () => {
  const { resolvers } = Service.config.graphql as GraphQLResolver
  const { Query } = resolvers
  const context = {} as IOContext
  const clients = { search: new Search(context) } as Clients

  return {
    context,
    Query,
    resolvers,
    clients,
    Service,
  }
}

export default vtexContext
