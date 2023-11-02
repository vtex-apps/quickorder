/* eslint-disable @typescript-eslint/no-explicit-any */
import type { FunctionComponent } from 'react'
import React, { useState, useContext } from 'react'
import type { WrappedComponentProps, MessageDescriptor } from 'react-intl'
import { FormattedMessage, injectIntl } from 'react-intl'
import {
  Button,
  Textarea,
  RadioGroup,
  ToastContext,
  Spinner,
} from 'vtex.styleguide'
import { OrderForm } from 'vtex.order-manager'
import type { OrderForm as OrderFormType } from 'vtex.checkout-graphql'
import { addToCart as ADD_TO_CART } from 'vtex.checkout-resources/Mutations'
import { useCssHandles } from 'vtex.css-handles'
import { useMutation } from 'react-apollo'
import { usePWA } from 'vtex.store-resources/PWAContext'
import { usePixel } from 'vtex.pixel-manager/PixelContext'

import { categoryMessages as messages } from './utils/messages'
import ReviewBlock from './components/ReviewBlock'
import { ParseText, GetText } from './utils'

interface ItemType {
  id: string
  quantity: number
}

const CopyPastePad: FunctionComponent<WrappedComponentProps> = ({ intl }) => {
  const [state, setState] = useState<any>({
    reviewState: false,
    showAddToCart: null,
    textAreaValue: '',
    partType: 'manufacturer',
    reviewItems: [],
  })

  const [refidLoading, setRefIdLoading] = useState<any>()

  const {
    textAreaValue,
    partType,
    reviewItems,
    reviewState,
    showAddToCart,
  } = state

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

  const backList = () => {
    setState({
      ...state,
      reviewState: false,
    })
  }

  const callAddToCart = async (items: any) => {
    const currentItemsInCart = orderForm.orderForm.items
    const mutationResult = await addToCart({
      variables: {
        items: items.map((item: ItemType) => {
          const [existsInCurrentOrder] = currentItemsInCart.filter(
            (el: any) => el.id === item.id.toString()
          )

          if (existsInCurrentOrder) {
            item.quantity += parseInt(existsInCurrentOrder.quantity, 10)
          }

          return {
            ...item,
          }
        }),
      },
    })

    if (mutationError) {
      console.error(mutationError)
      toastMessage({ success: false, isNewItem: false })

      return
    }

    // Update OrderForm from the context
    mutationResult.data && setOrderForm(mutationResult.data.addToCart)

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

    if (
      mutationResult.data?.addToCart?.messages?.generalMessages &&
      mutationResult.data.addToCart.messages.generalMessages.length
    ) {
      mutationResult.data.addToCart.messages.generalMessages.forEach(
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

    if (promptOnCustomEvent === 'addToCart' && showInstallPrompt) {
      showInstallPrompt()
    }

    backList()

    return showInstallPrompt
  }

  const onReviewItems = (items: any) => {
    if (items) {
      const show =
        items.filter((item: any) => {
          return item.error
        }).length === 0

      setState({
        ...state,
        reviewItems: items,
        reviewState: true,
        showAddToCart: show,
        textAreaValue: GetText(items),
      })
    }

    return true
  }

  const parseText = () => {
    const items: any = ParseText(textAreaValue) || []
    const error = !!items.filter((item: any) => {
      return item.error !== null
    }).length

    setState({
      ...state,
      reviewItems: items,
      reviewState: true,
      hasError: error,
      toValidate: true,
    })
    onReviewItems(items)
  }

  const setPartType = (newPartType: string) => {
    setState({
      ...state,
      partType: newPartType,
    })
  }

  const setTextareaValue = ($textAreaValue: string) => {
    setState({
      ...state,
      textAreaValue: $textAreaValue,
    })
  }

  const CSS_HANDLES = [
    'buttonValidate',
    'textContainer',
    'componentContainer',
    'reviewBlock',
    'buttonsBlock',
    'textContainerTitle',
    'textContainerDescription',
  ] as const

  const handles = useCssHandles(CSS_HANDLES)

  const addToCartCopyNPaste = () => {
    const items: any = reviewItems
      .filter((item: any) => item.error === null && item.vtexSku !== null)
      .map(({ vtexSku, quantity, seller }: any) => {
        return {
          id: parseInt(vtexSku, 10),
          quantity: parseFloat(quantity),
          seller,
        }
      })

    const merge = (internalItems: ItemType[]) => {
      return internalItems.reduce((acc: ItemType[], val) => {
        const { id, quantity }: ItemType = val
        const ind = acc?.findIndex((el) => el.id === id)

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

  const onRefidLoading = (data: boolean) => {
    setRefIdLoading(data)
  }

  return (
    <div
      className={`${handles.componentContainer}
          w-80-l w-100-ns fr-l pb6
        `}
    >
      <h2>Copy & Paste Pad</h2>
      <p>
        Simply copy and paste part numbers from your file into the field below
        using the following format:
      </p>
      <p>Part number [TAB or COMMA] Quantity</p>

      <RadioGroup
        hideBorder
        label="Select the type of part number:"
        name="partType"
        options={[
          { value: 'manufacturer', label: 'Manufacturer' },
          { value: 'upc', label: 'UPC' },
          { value: 'sku', label: 'SKU' },
        ]}
        value={partType}
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
          setPartType(e.currentTarget.value)
        }
      />
      <section className="mt5">
        <Textarea
          value={textAreaValue}
          placeholder={
            'Examples:' +
            '\n' +
            'T5832-W, 3' +
            '\n' +
            '80401-NW, 3' +
            '\n' +
            '1451-2W, 5' +
            '\n' +
            '88001, 5'
          }
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            setTextareaValue(e.target.value)
          }
        />
      </section>
      <section className={`mt2 ${handles.buttonValidate}`}>
        <Button
          variation="primary"
          size="regular"
          disabled={!textAreaValue}
          onClick={() => {
            parseText()
          }}
        >
          Submit
        </Button>
      </section>

      {reviewState && (
        <div className={`w-100 ph6 ${handles.reviewBlock}`}>
          <ReviewBlock
            reviewedItems={reviewItems}
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
            {refidLoading && <Spinner />}
            {showAddToCart && (
              <Button
                variation="primary"
                size="small"
                isLoading={mutationLoading}
                onClick={() => {
                  addToCartCopyNPaste()
                }}
              >
                <FormattedMessage id="store/quickorder.addToCart" />
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

interface OrderFormContext {
  loading: boolean
  orderForm: OrderFormType | undefined
  setOrderForm: (orderForm: Partial<OrderFormType>) => void
}

export default injectIntl(CopyPastePad)
