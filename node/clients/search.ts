import { InstanceOptions, IOContext, JanusClient } from '@vtex/api'

interface RefIdArgs {
  refids: any
  orderFormId: string
}
interface Items {
  id: string
  quantity: number
  seller: string
}

export class Search extends JanusClient {
  constructor(context: IOContext, options?: InstanceOptions) {
    super(context, {
      ...options,
      headers: {
        ...options?.headers,
        VtexIdClientAutCookie: context.authToken,
      },
      timeout: 5000,
    })
  }

  private sellersList: any[] | undefined

  private getNameFromId = (id: string) => {
    return this.sellersList?.find((seller: any) => {
      return seller.id === id
    }).name
  }

  public skuFromRefIds = async ({
    refids,
    orderFormId,
  }: RefIdArgs): Promise<any> => {
    this.sellersList = await this.sellers()

    const url = `/api/catalog_system/pub/sku/stockkeepingunitidsbyrefids`

    const res: any = await this.http.postRaw(url, refids, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `bearer ${this.context.authToken}`,
      },
    })

    let result: any = []

    const resultStr: any = {}

    if (res.status === 200) {
      const refs = Object.getOwnPropertyNames(res.data)

      refs.forEach((id) => {
        resultStr[id] = {
          sku: res.data[id],
          refid: id,
          sellers: this.sellersList,
        }
        result.push(resultStr[id])
      })

      if (this.sellersList?.length) {
        const promises = result.map(async (o: any) =>
          this.sellerBySku(o.sku, o.refid)
        )
        result = await Promise.all(promises)
      }

      const orderForm = await this.getOrderForm(orderFormId)

      const { items }: any = await this.simulate(result, orderForm)
      items.forEach((item: any) => {
        items[item.id] = item
      })

      result = result.map((item: any) => {
        return {
          ...item,
          unitMultiplier: items[item.sku]?.unitMultiplier ?? 1,
          availability: items[item.sku]?.availability ?? '',
        }
      })
    }
    return result
  }

  private getOrderForm = async (orderFormId: string) => {
    return this.http.get(`/api/checkout/pub/orderForm/${orderFormId}`, {
      headers: {
        'Content-Type': 'application/json',
        VtexIdclientAutCookie: `${this.context.authToken}`,
      },
    })
  }

  private simulate = async (refids: [Items], orderForm: any) => {
    const {
      salesChannel,
      storePreferencesData: { countryCode },
      shippingData,
    } = orderForm
    const items = refids
      .filter((item: any) => {
        return !!item.sku
      })
      .map((item: any) => {
        const [seller] = item.sellers
        return {
          id: item.sku,
          quantity: 1,
          seller: seller?.id,
        }
      })

    return this.http.post(
      `/api/checkout/pub/orderForms/simulation?sc=${salesChannel}`,
      {
        items,
        country: countryCode,
        postalCode: shippingData?.address?.postalCode ?? '',
      }
    )
  }

  private sellerBySku = async (skuId: string, refid: string) => {
    if (skuId === null) {
      return {
        sku: null,
        refid,
        sellers: null,
      }
    }
    const url = `/api/catalog_system/pvt/sku/stockkeepingunitbyid/${skuId}`
    const res = await this.http.getRaw(url, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `bearer ${this.context.authToken}`,
      },
    })
    return res.data?.SkuSellers
      ? {
          sku: skuId,
          refid,
          sellers: res.data.SkuSellers.filter((item: any) => {
            return item.IsActive === true
          }).map(({ SellerId }: any) => {
            return {
              id: SellerId,
              name: this.getNameFromId(SellerId),
            }
          }),
        }
      : []
  }

  public sellers = async (): Promise<any> => {
    const url = `/api/seller-register/pvt/sellers`

    const res = await this.http.getRaw(url, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `bearer ${this.context.authToken}`,
      },
    })

    let result: any = []

    if (res.status === 200) {
      result = res.data.items
        .filter((item: any) => {
          return item.isActive === true
        })
        .map(({ id, name }: any) => {
          return {
            id,
            name,
          }
        })
    }

    return result
  }
}
