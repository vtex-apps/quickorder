/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
import type { FunctionComponent } from 'react'
import React, { useState, useContext } from 'react'
import type { WrappedComponentProps } from 'react-intl'
import { FormattedMessage, injectIntl } from 'react-intl'
import { Button, Dropzone, ToastContext } from 'vtex.styleguide'
import { OrderForm } from 'vtex.order-manager'
import type { OrderForm as OrderFormType } from 'vtex.checkout-graphql'
import { addToCart as ADD_TO_CART } from 'vtex.checkout-resources/Mutations'
import { useCssHandles } from 'vtex.css-handles'
import { useMutation } from 'react-apollo'
import { usePWA } from 'vtex.store-resources/PWAContext'
import { usePixel } from 'vtex.pixel-manager/PixelContext'
import XLSX from 'xlsx'

import { categoryMessages as messages } from './utils/messages'
import { ParseText, GetText } from './utils'
import ReviewBlock from './components/ReviewBlock'

interface ItemType {
  id: string
  quantity: number
}

const UploadBlock: FunctionComponent<
  UploadBlockInterface & WrappedComponentProps
> = ({
  text,
  hiddenColumns,
  description,
  downloadText,
  componentOnly,
  intl,
  alwaysShowAddToCart = true,
}: any) => {
  let productsArray: any = []
  const [state, setState] = useState<any>({
    reviewItems: [],
    reviewState: false,
    showAddToCart: false,
  })

  const [showValidateButton, setShowValidateButton] = useState<boolean>(false)

  const [refidLoading, setRefIdLoading] = useState<any>()
  const [productsQueue, setproductsQueue] = useState<any>()
  const { reviewItems, reviewState, showAddToCart } = state

  const [
    addToCart,
    { error: mutationError, loading: mutationLoading },
  ] = useMutation<{ addToCart: OrderFormType }, { items: [] }>(ADD_TO_CART)

  const { push } = usePixel()
  const { settings = {}, showInstallPrompt = undefined } = usePWA() || {}
  const { promptOnCustomEvent } = settings

  const { setOrderForm }: OrderFormContext = OrderForm.useOrderForm()
  const orderForm = OrderForm.useOrderForm()
  const { showToast } = useContext(ToastContext)

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

    const action = success
      ? {
          label: translateMessage(messages.seeCart),
          href: '/checkout/#/cart',
        }
      : undefined

    showToast({ message, action })
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
      const show = !items.some((item: any) => item.error)

      setState({
        ...state,
        reviewItems: items,
        reviewState: true,
        showAddToCart: alwaysShowAddToCart || show,
        textAreaValue: GetText(items),
      })
    }

    return true
  }

  const parseText = () => {
    let textAreaValue = ''

    productsQueue.forEach((element) => {
      textAreaValue += `${element[0]},${element[1]}\n`
    })

    const items: any = ParseText(textAreaValue) || []
    const error = !!items.filter((item: any) => {
      return item.error !== null
    }).length

    setState({
      ...state,
      reviewItems: items,
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

  const doFile = ([f]: any) => {
    const reader: any = new FileReader()

    reader.onload = (e: any) => {
      let data = e.target.result

      data = new Uint8Array(data)
      const result = processWb(XLSX.read(data, { type: 'array' }))
      const [sheetName] = Object.getOwnPropertyNames(result)

      result[sheetName].splice(0, 1)
      productsArray = result[sheetName]
      productsArray = productsArray.filter((item) => item.length)
      productsArray.forEach((p) => {
        p[0] = (p[0] || '').toString().trim()
        p[1] = (p[1] || '').toString().trim()
      })

      setShowValidateButton(true)
      setproductsQueue(productsArray)
    }

    reader.onerror = () => {
      // error
    }

    reader.readAsArrayBuffer(f)
  }

  const handleFile = (files: any) => {
    doFile(files)
  }

  const handleReset = () => {
    setShowValidateButton(false)
  }

  const backList = () => {
    setState({
      ...state,
      reviewState: false,
    })
    setShowValidateButton(false)
  }

  const callAddToCart = async (items: any) => {
    const splitBy = 10
    const tempItems = items
    const loopCount = Math.floor(items.length / splitBy) + 1

    const promises: any = []

    for (let i = 0; i < loopCount; i++) {
      const chunk = tempItems.splice(0, splitBy)

      if (chunk.length) {
        const currentItemsInCart = orderForm.orderForm.items

        const mutationChunk = addToCart({
          variables: {
            items: chunk.map((item: ItemType) => {
              const [existsInCurrentOrder] = currentItemsInCart.filter(
                (el) => el.id === item.id.toString()
              )

              if (existsInCurrentOrder) {
                item.quantity += parseInt(existsInCurrentOrder.quantity, 10)
              }

              return {
                ...item,
              }
            }),
          },
        }).then((mutationRes: any) => {
          mutationRes.data && setOrderForm(mutationRes.data.addToCart)

          if (mutationRes?.data.addToCart?.messages?.generalMessages?.length) {
            mutationRes.addToCart.messages.generalMessages.map((msg: any) => {
              return showToast({
                message: msg.text,
                action: undefined,
                duration: 30000,
              })
            })
          } else {
            toastMessage({ success: true, isNewItem: true })
          }
        })

        promises.push(mutationChunk)
      }
    }

    Promise.all(promises).catch(() => {
      console.error(mutationError)
      toastMessage({ success: false, isNewItem: false })
    })

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

    backList()

    return showInstallPrompt
  }

  const addToCartUpload = () => {
    const items: any = reviewItems
      .filter((item: any) => item.error === null && item.vtexSku !== null)
      .map(({ vtexSku, quantity, seller }: any) => {
        return {
          id: parseInt(vtexSku, 10),
          quantity: parseFloat(quantity),
          seller,
        }
      })

    const merge = (internalItems) => {
      return internalItems.reduce((acc: any, val) => {
        const { id, quantity }: ItemType = val
        const ind = acc.findIndex((el) => el.id === id)

        if (ind !== -1) {
          acc[ind].quantity += quantity
        } else {
          acc.push(val)
        }

        return acc
      }, [])
    }

    const mergedItems = merge(items)

    callAddToCart(mergedItems)
  }

  const CSS_HANDLES = [
    'uploadBlock',
    'buttonValidate',
    'dropzoneContainer',
    'dropzoneIcon',
    'dropzoneText',
    'dropzoneLink',
    'downloadLink',
    'textContainer',
    'componentContainer',
    'reviewBlock',
    'buttonsBlock',
    'textContainerTitle',
    'textContainerDescription',
  ] as const

  const handles = useCssHandles(CSS_HANDLES)
  const Icon = (<svg className={handles.dropzoneIcon} width="40" height="46" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M24.793.793A1 1 0 0 0 24.086.5H1.5a1 1 0 0 0-1 1v43a1 1 0 0 0 1 1h37a1 1 0 0 0 1-1V15.914a1 1 0 0 0-.293-.707L24.793.793z" fill="#E3E4E6"></path><path d="M9.5 33.5h21M9.5 24.5h21" stroke="#3F3F40" stroke-width="1.2" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path><path d="M9.5 15.5h6" stroke="#F71963" stroke-width="1.2" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path><path d="M24.5.5v15h15" fill="#CACBCC"></path></svg>)
 
  return (
    <div className={`${handles.uploadBlock}`}>
      {!componentOnly && (
        <div className={`${handles.textContainer} w-20-l w-100-ns fl-l`}>
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
          !componentOnly ? 'w-80-l w-100-ns fr-l' : ''
        }`}
      >
        {!reviewState && (
          <div className="w-100 mb5">
            <div
              className={`bg-base t-body c-on-base ph6 pb6 br3 b--muted-4 ${handles.dropzoneContainer}`}
            >
              <Dropzone
                onDropAccepted={handleFile}
                onFileReset={handleReset}
                accept=".xls,.xlsx"
                icon={Icon}
              >
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
                {showValidateButton && (
                  <Button
                    variation="secondary"
                    size="regular"
                    onClick={() => {
                      parseText()
                    }}
                  >
                    <FormattedMessage id="store/quickorder.validate" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {reviewState && (
          <div className={`w-100 ph6 ${handles.reviewBlock}`}>
            <ReviewBlock
              reviewedItems={reviewItems}
              hiddenColumns={hiddenColumns ?? []}
              onReviewItems={onReviewItems}
              onRefidLoading={onRefidLoading}
              backList={backList}
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
              {showAddToCart && (
                <Button
                  variation="primary"
                  size="small"
                  isLoading={mutationLoading || refidLoading}
                  onClick={() => {
                    addToCartUpload()
                  }}
                >
                  <FormattedMessage id="store/quickorder.addToCart" />
                </Button>
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
  description?: string | any
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
  alwaysShowAddToCart?: boolean
}

export default injectIntl(UploadBlock)
