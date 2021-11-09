import React, { useState, useContext } from 'react'
import {
  FormattedMessage,
  injectIntl,
  WrappedComponentProps,
  defineMessages,
} from 'react-intl'
import { Button, Dropzone, ToastContext, Spinner } from 'vtex.styleguide'
import { OrderForm } from 'vtex.order-manager'
import { OrderForm as OrderFormType } from 'vtex.checkout-graphql'
import { addToCart as ADD_TO_CART } from 'vtex.checkout-resources/Mutations'
import { useCssHandles } from 'vtex.css-handles'
import { ExecutionResult, useMutation } from 'react-apollo'
import { usePWA } from 'vtex.store-resources/PWAContext'
import { usePixel } from 'vtex.pixel-manager/PixelContext'
import { useOrderItems } from 'vtex.order-items/OrderItems'
import { useOrderForm } from 'vtex.order-manager/OrderForm'
import XLSX from 'xlsx'

import { ParseText, GetText, itemsInSystem, getNewItems } from './utils'
import ReviewBlock from './components/ReviewBlock'

const messages = defineMessages({
  success: {
    id: 'store/toaster.cart.success',
    defaultMessage: '',
    label: '',
  },
  duplicate: {
    id: 'store/toaster.cart.duplicated',
    defaultMessage: '',
    label: '',
  },
  error: { id: 'store/toaster.cart.error', defaultMessage: '', label: '' },
  seeCart: {
    id: 'store/toaster.cart.seeCart',
    defaultMessage: '',
    label: '',
  },
})

const UploadBlock: StorefrontFunctionComponent<UploadBlockInterface &
  WrappedComponentProps> = ({
  text,
  description,
  downloadText,
  componentOnly,
  intl,
}: any) => {
  let productsArray: any = []
  const [state, setState] = useState<any>({})

  const [refidLoading, setRefIdLoading] = useState<any>()
  const [reviewItems, setReviewItems] = useState<any>([])
  const [reviewState, setReviewState] = useState(false)
  const [showAddToCart, setShowAddToCart] = useState(false)

  const [
    addToCart,
    { error: mutationError, loading: mutationLoading },
  ] = useMutation<{ addToCart: OrderFormType }, { items: [] }>(ADD_TO_CART)

  const { push } = usePixel()
  const { settings = {}, showInstallPrompt = undefined } = usePWA() || {}
  const { promptOnCustomEvent } = settings

  const { setOrderForm }: OrderFormContext = OrderForm.useOrderForm()
  const { showToast } = useContext(ToastContext)
  const { addItem } = useOrderItems()
  const { orderForm } = useOrderForm()

  const translateMessage = (message: MessageDescriptor) => {
    return intl.formatMessage(message)
  }

  const resolveToastMessage = (success: boolean, isNewItem: boolean) => {
    if (!success) return translateMessage(messages.error)
    if (!isNewItem) return translateMessage(messages.duplicate)

    return translateMessage(messages.success)
  }

  const toastMessage = ({
    success,
    isNewItem,
  }: {
    success: boolean
    isNewItem: boolean
  }) => {
    const message = resolveToastMessage(success, isNewItem)

    showToast({ message })
  }

  const download = () => {
    const finalHeaders = ['SKU', 'Quantity']
    const data = [
      { SKU: 'AB120', Quantity: 2 },
      { SKU: 'AB121', Quantity: 3 },
      { SKU: 'AB122', Quantity: 5 },
      { SKU: 'AB123', Quantity: 10 },
      { SKU: 'AB124', Quantity: 1 },
      { SKU: 'AB125', Quantity: 20 },
    ]

    const ws = XLSX.utils.json_to_sheet(data, { header: finalHeaders })
    const wb = XLSX.utils.book_new()

    XLSX.utils.book_append_sheet(wb, ws, 'SheetJS')
    const exportFileName = `model-quickorder.xls`

    XLSX.writeFile(wb, exportFileName)
  }

  const onRefidLoading = (data: boolean) => {
    setRefIdLoading(data)
  }

  const onReviewItems = (items: any) => {
    if (items) {
      const show =
        items.filter((item: any) => {
          return !item.vtexSku || item.availability !== 'available'
        }).length === 0

      setReviewItems(items)
      setReviewState(true)
      setShowAddToCart(show)
      setState({
        textAreaValue: GetText(items),
      })
    }

    return true
  }

  const parseText = () => {
    let textAreaValue = ''

    productsArray.forEach(element => {
      textAreaValue += `${element[0]},${element[1]}\n`
    })

    const items: any = ParseText(textAreaValue) || []
    const error = !!items.filter((item: any) => {
      return item.error !== null
    }).length

    setReviewItems(items)
    setState({
      ...state,
      hasError: error,
    })
    onReviewItems(items)
  }

  const processWb = (() => {
    const toJson = function toJson(workbook: any) {
      const result: any = {}

      workbook.SheetNames.forEach((sheetName: any) => {
        const roa = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
          header: 1,
        })

        if (roa.length) result[sheetName] = roa
      })

      return result
    }

    return (wb: any) => {
      let output: any = null

      output = toJson(wb)

      return output
    }
  })()

  const doFile = (files: any) => {
    const f = files[0]
    const reader: any = new FileReader()

    reader.onload = (e: any) => {
      let data = e.target.result

      data = new Uint8Array(data)
      const result = processWb(XLSX.read(data, { type: 'array' }))
      const sheetName = Object.getOwnPropertyNames(result)[0]

      result[sheetName].splice(0, 1)
      productsArray = result[sheetName]
      productsArray = productsArray.filter(item => item.length)
      productsArray.forEach(p => {
        p[0] = (p[0] || '').toString().trim()
        p[1] = (p[1] || '').toString().trim()
      })
    }

    reader.onerror = () => {
      // error
    }

    reader.readAsArrayBuffer(f)
  }

  const handleFile = (files: any) => {
    doFile(files)
  }

  const handleReset = () => {}

  const backList = () => {
    setReviewState(false)
    setState({
      ...state,
    })
  }

  const callAddToCart = async (items: any) => {
    const splitBy = 10
    const tempItems = items

    const existItems = itemsInSystem(orderForm?.items, tempItems)
    const newItems = getNewItems(orderForm?.items, tempItems)

    const loopCount = Math.floor(newItems.length / splitBy) + 1
    const loopCountExist = Math.floor(existItems.length / splitBy) + 1

    const promises: Array<ExecutionResult<{ addToCart: OrderFormType }>> = []
    // let orderFormData = []

    if (existItems.length) {
      for (let i = 0; i < loopCountExist; i++) {
        const chunk = tempItems.splice(0, splitBy)

        if (chunk.length) {
          addItem(chunk)
        }
      }

      toastMessage({ success: true, isNewItem: true })
    }

    if (newItems.length > 0) {
      for (let i = 0; i < loopCount; i++) {
        const chunk = tempItems.splice(0, splitBy)

        if (chunk.length) {
          // eslint-disable-next-line no-await-in-loop
          const mutationChunk = await addToCart({
            variables: {
              items: chunk.map((item: any) => {
                return {
                  ...item,
                }
              }),
            },
          })

          console.info('mutationChunk =>', mutationChunk)

          mutationChunk.data && setOrderForm(mutationChunk.data.addToCart)

          if (
            mutationChunk.data?.addToCart?.messages?.generalMessages &&
            mutationChunk.data.addToCart.messages.generalMessages.length
          ) {
            mutationChunk.data.addToCart.messages.generalMessages.map(
              (msg: any) => {
                return showToast({
                  message: msg.text,
                  action: undefined,
                  duration: 30000,
                })
              }
            )
          } else {
            toastMessage({ success: true, isNewItem: true })
          }

          promises.push(mutationChunk)
        }
      }

      Promise.all(promises).catch(() => {
        console.error(mutationError)
        toastMessage({ success: false, isNewItem: false })
      })
    }

    // Update OrderForm from the context

    const adjustSkuItemForPixelEvent = (item: any) => {
      return {
        skuId: item.id,
        quantity: item.quantity,
      }
    }

    // Send event to pixel-manager
    const pixelEventItems = items.map(adjustSkuItemForPixelEvent)

    push({
      event: 'addToCart',
      items: pixelEventItems,
    })

    if (promptOnCustomEvent === 'addToCart' && showInstallPrompt) {
      showInstallPrompt()
    }

    return showInstallPrompt
  }

  const addToCartUpload = () => {
    const items: any = reviewItems
      .filter((item: any) => item.error === null && item.vtexSku !== null)
      .map(({ vtexSku, quantity, seller, unit }: any) => {
        return {
          id: parseInt(vtexSku, 10),
          quantity: parseFloat(quantity) / unit,
          seller,
        }
      })

    callAddToCart(items)
  }

  const CSS_HANDLES = [
    'buttonValidate',
    'dropzoneContainer',
    'dropzoneText',
    'dropzoneLink',
    'downloadLink',
    'textContainer',
    'componentContainer',
    'reviewBlock',
    'buttonsBlock',
    'textContainerTitle',
    'textContainerDescription',
    'inactiveAddToCart',
    'activeAddToCart',
  ] as const

  const handles = useCssHandles(CSS_HANDLES)

  return (
    <div>
      {!componentOnly && (
        <div className={`${handles.textContainer} w-third-l w-100-ns fl-l`}>
          <h2
            className={`t-heading-3 mb3 ml5 ml3-ns mt4 ${handles.textContainerTitle}`}
          >
            {text}
          </h2>
          <div
            className={`t-body lh-copy c-muted-1 mb7 ml3 false ${handles.textContainerDescription}`}
          >
            {description}{' '}
            {downloadText && (
              <button
                className={`${handles.downloadLink} pointer c-link hover-c-link active-c-link no-underline underline-hover bn bg-transparent pl0`}
                onClick={() => {
                  download()
                }}
              >
                {downloadText}
              </button>
            )}
          </div>
        </div>
      )}
      <div
        className={`${handles.componentContainer} ${
          !componentOnly ? 'w-two-thirds-l w-100-ns fr-l' : ''
        }`}
      >
        {!reviewState && (
          <div className="w-100 mb5">
            <div
              className={`bg-base t-body c-on-base pa7 br3 b--muted-4 ${handles.dropzoneContainer}`}
            >
              <Dropzone onDropAccepted={handleFile} onFileReset={handleReset}>
                <div className="pt7">
                  <div>
                    <span className={`f4 ${handles.dropzoneText}`}>
                      <FormattedMessage id="store/quickorder.upload.drop" />{' '}
                    </span>
                    <span
                      className={`f4 ${handles.dropzoneLink} c-link"`}
                      style={{ cursor: 'pointer' }}
                    >
                      <FormattedMessage id="store/quickorder.upload.choose" />
                    </span>
                  </div>
                </div>
              </Dropzone>
              <div className={`mt2 flex justify-end ${handles.buttonValidate}`}>
                <Button
                  variation="secondary"
                  size="regular"
                  onClick={() => {
                    parseText()
                  }}
                >
                  <FormattedMessage id="store/quickorder.validate" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {reviewState && (
          <div className={`w-100 pa6 ${handles.reviewBlock}`}>
            <ReviewBlock
              reviewedItems={reviewItems}
              onReviewItems={onReviewItems}
              onRefidLoading={onRefidLoading}
            />
            <div
              className={`mb4 mt4 flex justify-between ${handles.buttonsBlock}`}
            >
              <Button
                variation="tertiary"
                size="small"
                onClick={() => {
                  backList()
                }}
              >
                <FormattedMessage id="store/quickorder.back" />
              </Button>
              {refidLoading && <Spinner />}
              {showAddToCart ? (
                <div className={handles.activeAddToCart}>
                  <Button
                    variation="primary"
                    size="small"
                    isLoading={mutationLoading}
                    onClick={() => {
                      addToCartUpload()
                    }}
                  >
                    <FormattedMessage id="store/quickorder.addToCart" />
                  </Button>
                </div>
              ) : (
                <div className={handles.inactiveAddToCart}>
                  <Button
                    variation="primary"
                    size="small"
                    isLoading={mutationLoading}
                  >
                    <FormattedMessage id="store/quickorder.addToCart" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

interface MessageDescriptor {
  id: string
  description?: any
  defaultMessage?: string
}

interface OrderFormContext {
  loading: boolean
  orderForm: OrderFormType | undefined
  setOrderForm: (orderForm: Partial<OrderFormType>) => void
}

interface UploadBlockInterface {
  text?: string
  description?: string
  componentOnly?: boolean
  downloadText?: string
}

export default injectIntl(UploadBlock)
