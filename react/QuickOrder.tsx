/* eslint-disable no-console */
import React, { useState, useContext } from 'react'
import { Button, ToastContext } from 'vtex.styleguide'
import {
  FormattedMessage,
  injectIntl,
  defineMessages,
  WrappedComponentProps,
} from 'react-intl'
import { usePixel } from 'vtex.pixel-manager/PixelContext'
import { useMutation } from 'react-apollo'
import { OrderForm } from 'vtex.order-manager'
import { usePWA } from 'vtex.store-resources/PWAContext'
import { addToCart as ADD_TO_CART } from 'vtex.checkout-resources/Mutations'
import { compareObjects } from './modules/compareObjects'
import { useCssHandles } from 'vtex.css-handles'
import TranslatedTitle from './components/TranslatedTitle'
import AutocompleteBlock from './components/AutocompleteBlock'
import TextAreaBlock from './components/TextAreaBlock'
import CategoryBlock from './components/CategoryBlock'
import ReviewBlock from './components/ReviewBlock'
import styles from './styles.css'
import { GetText } from './utils'

const QuickOrder: StorefrontFunctionComponent<QuickOrderProps &
  WrappedComponentProps> = ({
  customToastUrl,
  title,
  showCopyPaste,
  showCategory,
  showAutocomplete,
  intl,
}: any) => {
  console.log('showCategory', showCategory)
  console.log('showCopyPaste', showCopyPaste)
  console.log('showAutocomplete', showAutocomplete)

  const { showToast } = useContext(ToastContext)

  const [state, setState] = useState<any>({
    reviewState: false,
    showAddToCart: false,
    textAreaValue: '',
    reviewItems: [],
    refidLoading: null,
  })

  const {
    reviewState,
    showAddToCart,
    textAreaValue,
    reviewItems,
    refidLoading,
  } = state

  const { push } = usePixel()
  const { settings = {}, showInstallPrompt = undefined } = usePWA() || {}
  const { promptOnCustomEvent } = settings

  const { orderForm, setOrderForm }: OrderFormContext = OrderForm.useOrderForm()

  const messages = defineMessages({
    success: { id: 'toaster.cart.success', defaultMessage: '', label: '' },
    duplicate: { id: 'toaster.cart.duplicated', defaultMessage: '', label: '' },
    error: { id: 'toaster.cart.error', defaultMessage: '', label: '' },
    seeCart: { id: 'toaster.cart.seeCart', defaultMessage: '', label: '' },
  })

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
          href: customToastUrl,
        }
      : undefined

    showToast({ message, action })
  }

  const [
    addToCart,
    { error: mutationError, loading: mutationLoading },
  ] = useMutation<{ addToCart: OrderForm }, { items: [] }>(ADD_TO_CART)

  const callAddToCart = async (items: any) => {
    const mutationResult = await addToCart({
      variables: { items },
    })

    if (mutationError) {
      console.error(mutationError)
      toastMessage({ success: false, isNewItem: false })
      return
    }
    if (
      mutationResult.data &&
      compareObjects(mutationResult.data.addToCart, orderForm)
    ) {
      toastMessage({ success: true, isNewItem: false })
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

    toastMessage({ success: true, isNewItem: true })

    if (promptOnCustomEvent === 'addToCart' && showInstallPrompt) {
      showInstallPrompt()
    }

    return showInstallPrompt
  }

  const addToCartCopyNPaste = () => {
    const items: any = reviewItems.map(({ vtexSku, quantity }: any) => {
      return {
        id: vtexSku,
        quantity,
        seller: '1',
      }
    })
    callAddToCart(items)
  }

  const onReviewItems = (items: any) => {
    if (items) {
      const show =
        items.filter((item: any) => {
          return !item.vtexSku
        }).length === 0

      setState({
        ...state,
        reviewItems: items,
        reviewState: true,
        showAddToCart: show,
        textAreaValue: GetText(items),
      })
    }
  }

  const onRefidLoading = (refidLoading: any) => {
    console.log('onRefidLoading', refidLoading)
  }

  const backList = () => {
    setState({
      ...state,
      reviewState: false,
    })
  }

  const CSS_HANDLES = [
    'container',
    'title',
    'copyPasteBlock',
    'autocompleteBlock',
    'reviewBlock',
    'categoryBlock',
    'buttonsBlock',
  ] as const
  const handles = useCssHandles(CSS_HANDLES)

  return (
    <div
      className={`${styles.container} ${handles.container} flex flex-column pv6 ph4`}
    >
      <div className={`title-container ${handles.title}`}>
        <TranslatedTitle title={title} />
      </div>

      {!reviewState && showCopyPaste && (
        <div className={`pa6 bg-muted-5 ${handles.copyPasteBlock}`}>
          <TextAreaBlock
            value={textAreaValue}
            onReviewItems={onReviewItems}
            onRefidLoading={onRefidLoading}
          />
        </div>
      )}

      {!reviewState && showAutocomplete && (
        <div className={`pa6 bg-muted-5 ${handles.autocompleteBlock}`}>
          <AutocompleteBlock
            onAddToCart={callAddToCart}
            loading={mutationLoading}
            success={!mutationError}
          />
        </div>
      )}

      {!reviewState && showCategory && (
        <div className={`pa6 bg-muted-5 ${handles.categoryBlock}`}>
          <CategoryBlock
            onAddToCart={callAddToCart}
            loading={mutationLoading}
            success={!mutationError}
          />
        </div>
      )}

      {reviewState && (
        <div className={`pa6 ${handles.reviewBlock}`}>
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
              <FormattedMessage id="quickorder.back" />
            </Button>
            {showAddToCart && (
              <Button
                variation="primary"
                size="small"
                isLoading={mutationLoading || refidLoading}
                onClick={() => {
                  addToCartCopyNPaste()
                }}
              >
                <FormattedMessage id="quickorder.addToCart" />
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
  orderForm: OrderForm | undefined
  setOrderForm: (orderForm: Partial<OrderForm>) => void
}

interface MessageDescriptor {
  id: string
  description?: string | object
  defaultMessage?: string
}

interface QuickOrderProps {
  title?: string
  showCopyPaste?: boolean
  showAutocomplete?: boolean
  showCategory?: boolean
  customToastUrl?: string
}

QuickOrder.schema = {
  title: 'editor.quickorder.title',
  description: 'editor.quickorder.description',
  type: 'object',
  properties: {
    title: {
      title: 'editor.quickorder.title.title',
      description: 'editor.quickorder.title.description',
      type: 'string',
      default: null,
    },
    showAutocomplete: {
      title: 'editor.quickorder.autocomplete.title',
      description: 'editor.quickorder.autocomplete.description',
      type: 'boolean',
      default: true,
    },
    showCopyPaste: {
      title: 'editor.quickorder.textarea.title',
      description: 'editor.quickorder.textarea.description',
      type: 'boolean',
      default: true,
    },
    showCategory: {
      title: 'editor.quickorder.category.title',
      description: 'editor.quickorder.category.description',
      type: 'boolean',
      default: true,
    },
  },
}

export default injectIntl(QuickOrder)
