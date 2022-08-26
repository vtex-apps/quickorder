import type { InstanceOptions, IOContext } from '@vtex/api'
import { JanusClient } from '@vtex/api'

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

  public skuFromRefIds = async (refids: any): Promise<any> => {
    const url = `/api/catalog_system/pub/sku/stockkeepingunitidsbyrefids`

    return this.http.postRaw(url, refids, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `bearer ${this.context.authToken}`,
      },
    })
  }

  public getOrderForm = async (orderFormId: string): Promise<any> => {
    return this.http.get(`/api/checkout/pub/orderForm/${orderFormId}`, {
      headers: {
        'Content-Type': 'application/json',
        VtexIdclientAutCookie: `${this.context.authToken}`,
      },
    })
  }

  public simulate = async ({
    refids,
    orderForm,
    refIdSellerMap,
    salesChannel,
  }: SimulateArgs): Promise<any> => {
    const {
      salesChannel: orderFormSC,
      storePreferencesData: { countryCode },
      shippingData,
    } = orderForm

    const simulateItems: any = []

    refids
      .filter((item: any) => {
        return !!item.sku
      })
      .forEach((item: any) => {
        refIdSellerMap[item.refid].forEach(sellerId => {
          simulateItems.push({
            id: item.sku,
            quantity: 1,
            seller: sellerId,
          })
        })
      })

    return this.http.post(
      `/api/checkout/pub/orderForms/simulation?sc=${
        salesChannel ?? orderFormSC
      }`,
      {
        items: simulateItems,
        country: countryCode,
        postalCode: shippingData?.address?.postalCode ?? '',
      }
    )
  }

  public sellerBySku = async (skuId: string): Promise<any> => {
    const url = `/api/catalog_system/pvt/sku/stockkeepingunitbyid/${skuId}`

    return this.http.getRaw(url, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `bearer ${this.context.authToken}`,
      },
    })
  }

  public sellers = async (salesChannel?: string): Promise<any> => {
    const sc = salesChannel ? `sc=${salesChannel}` : ''
    const params = `?${sc}`
    const url = `/api/seller-register/pvt/sellers${params}`

    return this.http.getRaw(url, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `bearer ${this.context.authToken}`,
      },
    })
  }
}
