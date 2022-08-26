interface SearchRefIdItem {
  sku: string
}

interface SearchRefIdUnit {
  items: SearchRefIdItem[]
}

interface Items {
  id: string
  quantity: number
  seller: string
}

interface RefIdSellerMap {
  [key: string]: [string]
}

interface SimulateArgs {
  refids: [Items]
  orderForm: any
  refIdSellerMap: RefIdSellerMap
  salesChannel: string
}
