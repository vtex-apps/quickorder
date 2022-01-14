import { IOClients } from '@vtex/api'

import { Search } from './search'

export class Clients extends IOClients {
  public get search(): any {
    return this.getOrSet('search', Search)
  }
}
