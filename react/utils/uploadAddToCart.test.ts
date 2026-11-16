import {
  addItemsToCartInSequence,
  consolidateToastMessages,
  getGeneralMessages,
  getUploadChunkSize,
  mapChunkItemsForCart,
  splitIntoChunks,
  DEFAULT_UPLOAD_CHUNK_SETTINGS,
} from './uploadAddToCart'
import type {
  AddToCartFn,
  AddToCartMutationResult,
  CartItem,
  OrderFormItem,
} from './uploadAddToCart'

const delay = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve()
    }, ms)
  })

const item = (id: number, quantity = 1): CartItem => ({ id, quantity })

const range = (count: number): CartItem[] =>
  Array.from({ length: count }, (_, index: number) => item(index + 1))

describe('getUploadChunkSize', () => {
  it('sends files up to 20 rows in a single request', () => {
    expect(getUploadChunkSize(1)).toBe(1)
    expect(getUploadChunkSize(20)).toBe(20)
  })

  it('uses the default table for medium, large and extra-large files', () => {
    expect(getUploadChunkSize(21)).toBe(10)
    expect(getUploadChunkSize(50)).toBe(10)
    expect(getUploadChunkSize(51)).toBe(20)
    expect(getUploadChunkSize(200)).toBe(20)
    expect(getUploadChunkSize(201)).toBe(25)
    expect(getUploadChunkSize(300)).toBe(25)
  })

  it('returns 1 for empty or negative counts', () => {
    expect(getUploadChunkSize(0)).toBe(1)
    expect(getUploadChunkSize(-3)).toBe(1)
  })

  it('honors custom app settings and ignores invalid values', () => {
    const settings = {
      uploadChunkSmallMaxRows: 5,
      uploadChunkMediumMaxRows: 15,
      uploadChunkLargeMaxRows: 40,
      uploadChunkMediumSize: 3,
      uploadChunkLargeSize: 8,
      uploadChunkXLargeSize: 12,
    }

    expect(getUploadChunkSize(5, settings)).toBe(5)
    expect(getUploadChunkSize(6, settings)).toBe(3)
    expect(getUploadChunkSize(16, settings)).toBe(8)
    expect(getUploadChunkSize(41, settings)).toBe(12)
    expect(
      getUploadChunkSize(21, {
        uploadChunkMediumSize: '0',
        uploadChunkSmallMaxRows: 'nope',
      })
    ).toBe(DEFAULT_UPLOAD_CHUNK_SETTINGS.uploadChunkMediumSize)
  })
})

describe('splitIntoChunks', () => {
  it('splits items without mutating the original array', () => {
    const items = range(25)
    const copy = [...items]
    const chunks = splitIntoChunks(items, 10)

    expect(chunks.map((chunk) => chunk.length)).toEqual([10, 10, 5])
    expect(items).toEqual(copy)
    expect(chunks[0][0]).toEqual(item(1))
    expect(chunks[2][4]).toEqual(item(25))
  })
})

describe('mapChunkItemsForCart', () => {
  it('adds existing cart quantities without mutating the chunk', () => {
    const chunk = [item(10, 2), item(11, 1)]
    const currentItems: OrderFormItem[] = [
      { id: '10', quantity: '3' },
      { id: '99', quantity: 4 },
    ]

    const payload = mapChunkItemsForCart(chunk, currentItems)

    expect(payload).toEqual([
      { id: 10, quantity: 5 },
      { id: 11, quantity: 1 },
    ])
    expect(chunk[0].quantity).toBe(2)
  })
})

describe('getGeneralMessages', () => {
  it('reads messages from mutationRes.data.addToCart and ignores the invalid path', () => {
    const result = {
      addToCart: {
        messages: {
          generalMessages: [{ text: 'wrong path' }],
        },
      },
      data: {
        addToCart: {
          messages: {
            generalMessages: [{ text: 'SKU unavailable' }],
          },
        },
      },
    } as AddToCartMutationResult & { addToCart: unknown }

    expect(getGeneralMessages(result)).toEqual([{ text: 'SKU unavailable' }])
    expect(getGeneralMessages({})).toEqual([])
    expect(getGeneralMessages(undefined)).toEqual([])
  })
})

describe('consolidateToastMessages', () => {
  it('dedupes repeated messages and joins them with a separator', () => {
    expect(
      consolidateToastMessages([
        { text: 'The item Smoke Detector has no inventory' },
        { text: 'Freight type has changed' },
        { text: 'The item Smoke Detector has no inventory' },
        { text: '  ' },
        { text: undefined },
      ])
    ).toBe('The item Smoke Detector has no inventory. Freight type has changed')
  })

  it('returns an empty string when there are no messages', () => {
    expect(consolidateToastMessages([])).toBe('')
    expect(consolidateToastMessages()).toBe('')
  })
})

describe('addItemsToCartInSequence', () => {
  const orderFormWith = (items: OrderFormItem[], messages: string[] = []) => ({
    data: {
      addToCart: {
        items,
        messages: {
          generalMessages: messages.map((text) => ({ text })),
        },
      },
    },
  })

  it('sends chunks sequentially and uses the previous orderForm as the next snapshot', async () => {
    let concurrent = 0
    let maxConcurrent = 0
    const payloads: CartItem[][] = []
    const snapshots: string[] = []

    const addToCart: AddToCartFn = async ({ variables }) => {
      concurrent += 1
      maxConcurrent = Math.max(maxConcurrent, concurrent)
      payloads.push(variables.items)
      snapshots.push(
        variables.items
          .map((entry) => `${entry.id}:${entry.quantity}`)
          .join(',')
      )

      await delay(15)

      concurrent -= 1

      const cartItems = [
        ...([] as CartItem[])
          .concat(...payloads)
          .reduce<OrderFormItem[]>((acc, entry) => {
            if (!acc.some((existing) => existing.id === entry.id.toString())) {
              acc.push({ id: entry.id.toString(), quantity: entry.quantity })
            }

            return acc
          }, []),
      ]

      return orderFormWith(cartItems)
    }

    const result = await addItemsToCartInSequence({
      items: range(25),
      initialOrderFormItems: [{ id: '1', quantity: 4 }],
      addToCart,
    })

    expect(maxConcurrent).toBe(1)
    expect(payloads).toHaveLength(3)
    expect(payloads[0][0]).toMatchObject({ id: 1, quantity: 5 })
    expect(payloads[1][0]).toMatchObject({ id: 11, quantity: 1 })
    expect(result.failed).toBe(false)
    expect(result.addedItems).toHaveLength(25)
    expect(result.pendingItems).toEqual([])
    expect(result.totalChunks).toBe(3)
    expect(snapshots[0].startsWith('1:5')).toBe(true)
  })

  it('stops on a mutation or network error and returns what was added and what is pending', async () => {
    const calls: number[] = []

    const addToCart: AddToCartFn = async ({ variables }) => {
      calls.push(variables.items.length)

      if (calls.length === 1) {
        return orderFormWith(
          variables.items.map((entry) => ({
            id: entry.id.toString(),
            quantity: entry.quantity,
          }))
        )
      }

      throw new Error('network error')
    }

    const result = await addItemsToCartInSequence({
      items: range(25),
      addToCart,
    })

    expect(calls).toHaveLength(2)
    expect(result.failed).toBe(true)
    expect(result.addedItems.map((entry) => entry.id)).toEqual(
      range(10).map((entry) => entry.id)
    )
    expect(result.pendingItems.map((entry) => entry.id)).toEqual(
      range(25)
        .slice(10)
        .map((entry) => entry.id)
    )
    expect(result.completedChunks).toBe(1)
    expect(result.orderForm?.items).toHaveLength(10)
  })

  it('treats GraphQL errors as a failure and does not continue', async () => {
    const addToCart: AddToCartFn = async () => ({
      data: { addToCart: undefined },
      errors: [{ message: 'failed' }],
    })

    const result = await addItemsToCartInSequence({
      items: range(21),
      addToCart,
    })

    expect(result.failed).toBe(true)
    expect(result.addedItems).toEqual([])
    expect(result.pendingItems).toHaveLength(21)
  })

  it('continues after generalMessages and consolidates them', async () => {
    let call = 0

    const addToCart: AddToCartFn = async ({ variables }) => {
      call += 1

      return orderFormWith(
        variables.items.map((entry) => ({
          id: entry.id.toString(),
          quantity: entry.quantity,
        })),
        call === 1
          ? ['SKU 1 unavailable']
          : call === 2
          ? ['SKU 11 low stock']
          : []
      )
    }

    const result = await addItemsToCartInSequence({
      items: range(25),
      addToCart,
    })

    expect(result.failed).toBe(false)
    expect(result.addedItems).toHaveLength(25)
    expect(result.generalMessages.map((message) => message.text)).toEqual([
      'SKU 1 unavailable',
      'SKU 11 low stock',
    ])
  })
})
