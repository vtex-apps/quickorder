import { IOClients } from '@vtex/api'

import { Search } from './search'
import { Catalog } from './catalog'

export class Clients extends IOClients {
  public get search() {
    return this.getOrSet('search', Search)
  }

  public get catalog() {
    return this.getOrSet('catalog', Catalog)
  }
}
