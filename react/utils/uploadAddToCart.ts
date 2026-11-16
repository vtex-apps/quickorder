export const DEFAULT_UPLOAD_CHUNK_SETTINGS = {
  uploadChunkSmallMaxRows: 20,
  uploadChunkMediumMaxRows: 50,
  uploadChunkLargeMaxRows: 200,
  uploadChunkMediumSize: 10,
  uploadChunkLargeSize: 20,
  uploadChunkXLargeSize: 25,
}

export type UploadChunkSettings = {
  uploadChunkSmallMaxRows?: number | string
  uploadChunkMediumMaxRows?: number | string
  uploadChunkLargeMaxRows?: number | string
  uploadChunkMediumSize?: number | string
  uploadChunkLargeSize?: number | string
  uploadChunkXLargeSize?: number | string
}

export type OrderFormItem = {
  id: string
  quantity: number | string
}

export type CartItem = {
  id: string | number
  quantity: number
  seller?: string
}

export type GeneralMessage = {
  text?: string
}

export type AddToCartMutationResult = {
  data?: {
    addToCart?: {
      items?: OrderFormItem[]
      messages?: {
        generalMessages?: GeneralMessage[]
      }
    }
  }
  errors?: Array<{ message?: string }>
}

export type AddToCartFn = (options: {
  variables: { items: CartItem[] }
}) => Promise<AddToCartMutationResult>

export type AddItemsToCartResult = {
  orderForm?: AddToCartMutationResult['data'] extends infer D
    ? D extends { addToCart?: infer OF }
      ? OF
      : undefined
    : undefined
  addedItems: CartItem[]
  pendingItems: CartItem[]
  generalMessages: GeneralMessage[]
  failed: boolean
  completedChunks: number
  totalChunks: number
}

export const toPositiveInt = (value: unknown, fallback: number): number => {
  const parsed = Number(value)

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback
  }

  return Math.floor(parsed)
}

export const getUploadChunkSize = (
  rowCount: number,
  settings?: UploadChunkSettings
): number => {
  const smallMax = toPositiveInt(
    settings?.uploadChunkSmallMaxRows,
    DEFAULT_UPLOAD_CHUNK_SETTINGS.uploadChunkSmallMaxRows
  )

  const mediumMax = toPositiveInt(
    settings?.uploadChunkMediumMaxRows,
    DEFAULT_UPLOAD_CHUNK_SETTINGS.uploadChunkMediumMaxRows
  )

  const largeMax = toPositiveInt(
    settings?.uploadChunkLargeMaxRows,
    DEFAULT_UPLOAD_CHUNK_SETTINGS.uploadChunkLargeMaxRows
  )

  const mediumSize = toPositiveInt(
    settings?.uploadChunkMediumSize,
    DEFAULT_UPLOAD_CHUNK_SETTINGS.uploadChunkMediumSize
  )

  const largeSize = toPositiveInt(
    settings?.uploadChunkLargeSize,
    DEFAULT_UPLOAD_CHUNK_SETTINGS.uploadChunkLargeSize
  )

  const xlargeSize = toPositiveInt(
    settings?.uploadChunkXLargeSize,
    DEFAULT_UPLOAD_CHUNK_SETTINGS.uploadChunkXLargeSize
  )

  if (rowCount <= 0) {
    return 1
  }

  if (rowCount <= smallMax) {
    return rowCount
  }

  if (rowCount <= mediumMax) {
    return mediumSize
  }

  if (rowCount <= largeMax) {
    return largeSize
  }

  return xlargeSize
}

export const splitIntoChunks = <T>(items: T[], chunkSize: number): T[][] => {
  const size = Math.max(1, Math.floor(Number(chunkSize)) || 1)
  const chunks: T[][] = []
  let start = 0

  while (start < items.length) {
    const end = start + size

    chunks.push(items.slice(start, end))
    start = end
  }

  return chunks
}

export const mapChunkItemsForCart = (
  chunk: CartItem[],
  currentItemsInCart: OrderFormItem[] = []
): CartItem[] => {
  return chunk.map((item) => {
    const existing = currentItemsInCart.find(
      (el) => el.id === item.id.toString()
    )

    const existingQty = existing ? parseInt(String(existing.quantity), 10) : 0

    return {
      ...item,
      quantity:
        Number(item.quantity) +
        (Number.isFinite(existingQty) ? existingQty : 0),
    }
  })
}

export const getGeneralMessages = (
  mutationRes: AddToCartMutationResult | null | undefined
): GeneralMessage[] => {
  return mutationRes?.data?.addToCart?.messages?.generalMessages ?? []
}

const isMutationFailure = (mutationRes: AddToCartMutationResult): boolean => {
  if (mutationRes?.errors?.length) {
    return true
  }

  return !mutationRes?.data?.addToCart
}

export const addItemsToCartInSequence = async ({
  items,
  initialOrderFormItems = [],
  chunkSettings,
  addToCart,
  onProgress,
}: {
  items: CartItem[]
  initialOrderFormItems?: OrderFormItem[]
  chunkSettings?: UploadChunkSettings
  addToCart: AddToCartFn
  onProgress?: (current: number, total: number) => void
}): Promise<AddItemsToCartResult> => {
  const chunks = splitIntoChunks(
    items,
    getUploadChunkSize(items.length, chunkSettings)
  )

  const generalMessages: GeneralMessage[] = []
  const addedItems: CartItem[] = []
  let currentItems = initialOrderFormItems
  let lastOrderForm: AddItemsToCartResult['orderForm']

  for (let index = 0; index < chunks.length; index++) {
    const chunk = chunks[index]

    onProgress?.(index + 1, chunks.length)

    const payload = mapChunkItemsForCart(chunk, currentItems)

    try {
      // Sequential requests are required to avoid checkout orderForm races.
      // eslint-disable-next-line no-await-in-loop
      const mutationRes = await addToCart({ variables: { items: payload } })

      if (isMutationFailure(mutationRes)) {
        return {
          orderForm: lastOrderForm,
          addedItems,
          pendingItems: ([] as CartItem[]).concat(...chunks.slice(index)),
          generalMessages,
          failed: true,
          completedChunks: index,
          totalChunks: chunks.length,
        }
      }

      lastOrderForm = mutationRes.data?.addToCart
      currentItems = lastOrderForm?.items ?? currentItems
      generalMessages.push(...getGeneralMessages(mutationRes))
      addedItems.push(...chunk)
    } catch {
      return {
        orderForm: lastOrderForm,
        addedItems,
        pendingItems: ([] as CartItem[]).concat(...chunks.slice(index)),
        generalMessages,
        failed: true,
        completedChunks: index,
        totalChunks: chunks.length,
      }
    }
  }

  return {
    orderForm: lastOrderForm,
    addedItems,
    pendingItems: [],
    generalMessages,
    failed: false,
    completedChunks: chunks.length,
    totalChunks: chunks.length,
  }
}
