import { ExternalClient, InstanceOptions, IOContext } from '@vtex/api'

const axios = require('axios')

interface RefIdArgs {
  refids: any
}

export class Search extends ExternalClient {
  public constructor(ctx: IOContext, opts?: InstanceOptions) {
    super(`http://${ctx.account}.vtexcommercestable.com.br/`, ctx, opts)
  }

  public skuFromRefIds = async ({ refids }: RefIdArgs) => {
    const url = `http://${this.context.account}.vtexcommercestable.com.br/api/catalog_system/pub/sku/stockkeepingunitidsbyrefids`

    const res = await axios.default.post(url, refids, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `bearer ${this.context.authToken}`,
      },
    })

    const result: any = []

    if (res.status === 200) {
      const refs = Object.getOwnPropertyNames(res.data)

      refs.forEach(id => {
        result.push({
          sku: res.data[id],
          refid: id,
        })
      })
    }

    return result
  }

  public sellers = async () => {
    const url = `http://${this.context.account}.vtexcommercestable.com.br/api/catalog_system/pvt/seller/list`

    const res = await axios.default.get(url, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `bearer ${this.context.authToken}`,
      },
    })

    let result: any = []

    if (res.status === 200) {
      result = res.data.map(({ SellerId, Name }: any) => {
        return {
          id: SellerId,
          name: Name,
        }
      })
    }

    return result
  }
}
