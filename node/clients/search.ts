import { ExternalClient, InstanceOptions, IOContext } from '@vtex/api'
import axios from 'axios'

interface RefIdArgs {
  refids: any
  orderFormId: string
}

interface Items {
  id: string
  quantity: number
  seller: string
}

export class Search extends ExternalClient {
  constructor(ctx: IOContext, opts?: InstanceOptions) {
    super(`http://${ctx.account}.vtexcommercestable.com.br/`, ctx, opts)
  }

  private sellersList: any[] | undefined

  private getNameFromId = (id: string) => {
    return this.sellersList?.find((seller: any) => {
      return seller.id === id
    }).name
  }

  /**
   *
   * @param refids
   * @param orderFormId
   */
  public skuFromRefIds = async ({ refids, orderFormId }: RefIdArgs) => {
    this.sellersList = await this.sellers()

    const url = `http://${this.context.account}.vtexcommercestable.com.br/api/catalog_system/pub/sku/stockkeepingunitidsbyrefids`
    const res = await axios.post(url, refids, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `bearer ${this.context.authToken}`,
      },
    })

    let result: any = []

    const resultStr: any = {}

    if (res.status === 200) {
      const refs = Object.getOwnPropertyNames(res.data)

      refs.forEach(id => {
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

      result = result.map((item: any) => {
        return {
          ...item,
          availability: this.getAvailability(item, items),
        }
      })
    }
    return result
  }

  /**
   *
   * @param item
   * @param items
   */
  private getAvailability = (item: any, items: any) => {
    const [availabilityItem] = items.filter((curr: any) => {
      return curr.id === item.sku
    })
    return availabilityItem?.availability ?? ''
  }

  /**
   *
   * @param orderFormId
   */
  private getOrderForm = async (orderFormId: string) => {
    return this.http.get(`/api/checkout/pub/orderForm/${orderFormId}`, {
      headers: {
        'Content-Type': 'application/json',
        VtexIdclientAutCookie: `${this.context.authToken}`,
      },
    })
  }

  /**
   *
   * @param refids
   * @param orderForm
   */
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

  /**
   *
   * @param skuId
   * @param refid
   */
  private sellerBySku = async (skuId: string, refid: string) => {
    if (skuId === null) {
      return {
        sku: null,
        refid,
        sellers: null,
      }
    }
    const url = `http://${this.context.account}.vtexcommercestable.com.br/api/catalog_system/pvt/sku/stockkeepingunitbyid/${skuId}`
    const res = await axios.get(url, {
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

  /**
   *
   */
  public sellers = async () => {
    const url = `http://${this.context.account}.vtexcommercestable.com.br/api/catalog_system/pvt/seller/list`

    const res = await axios.get(url, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `bearer ${this.context.authToken}`,
      },
    })

    let result: any = []

    if (res.status === 200) {
      result = res.data
        .filter(({ IsActive }: any) => {
          return IsActive === true
        })
        .map(({ SellerId, Name }: any) => {
          return {
            id: SellerId,
            name: Name,
          }
        })
    }

    return result
  }

  /**
   *
   * @param sku
   * @param refid
   */
  private getSkuById = async (sku: string, refid: string) => {
    if (sku === null) {
      return {}
    }

    const priceBySkuIdUrl = `http://${this.context.account}.vtexcommercestable.com.br/api/catalog_system/pub/products/search/?fq=skuId:${sku}`
    const priceRes = await axios.get(priceBySkuIdUrl, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `bearer ${this.context.authToken}`,
      },
    })

    const { items, productId, productName } = priceRes.data[0]
    const { commertialOffer, sellerId, sellerName } = items[0].sellers[0]

    const { AvailableQuantity, IsAvailable } = commertialOffer
    const price = commertialOffer.SellingPrice
      ? commertialOffer.SellingPrice
      : commertialOffer.Price
      ? commertialOffer.Price
      : commertialOffer.ListPrice
    const sellers = [
      {
        id: sellerId,
        name: sellerName,
      },
    ]

    return {
      refid,
      sku,
      productId,
      productName,
      price,
      availableQuantity: AvailableQuantity,
      sellers,
      availability: IsAvailable ? 'available' : 'unavailable',
    }
  }

  /**
   *
   * @param refIds
   */
  public getSkuAvailability = async (refIds: string[]) => {
    this.sellersList = await this.sellers()

    const url = `http://${this.context.account}.vtexcommercestable.com.br/api/catalog_system/pub/sku/stockkeepingunitidsbyrefids`
    const res = await axios.post(url, refIds, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `bearer ${this.context.authToken}`,
      },
    })

    let result: any = []
    const resultStr: any = {}

    if (res.status === 200) {
      const refs = Object.getOwnPropertyNames(res.data)

      refs.forEach(id => {
        resultStr[id] = {
          sku: res.data[id],
          refid: id,
          sellers: this.sellersList,
        }
        result.push(resultStr[id])
      })

      if (this.sellersList?.length) {
        const promises = result.map(async (o: any) =>
          this.getSkuById(o.sku, o.refid)
        )
        result = await Promise.all(promises)
      }

      return result
    }
    return []
  }
}
