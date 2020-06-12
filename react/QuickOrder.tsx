/* eslint-disable no-console */
import React, { useState, useContext } from 'react'
import { Button, ToastContext, Dropdown } from 'vtex.styleguide'
import {
  FormattedMessage,
  defineMessages,
  WrappedComponentProps,
} from 'react-intl'
import { usePixel } from 'vtex.pixel-manager/PixelContext'
import { useMutation, graphql, compose } from 'react-apollo'
import { OrderForm } from 'vtex.order-manager'
import { usePWA } from 'vtex.store-resources/PWAContext'
import { addToCart as ADD_TO_CART } from 'vtex.checkout-resources/Mutations'
import { useCssHandles } from 'vtex.css-handles'

import TranslatedTitle from './components/TranslatedTitle'
import AutocompleteBlock from './components/AutocompleteBlock'
import TextAreaBlock from './components/TextAreaBlock'
import UploadBlock from './components/UploadBlock'
import CategoryBlock from './components/CategoryBlock'
import ReviewBlock from './components/ReviewBlock'
import getSellers from './queries/sellers.gql'
import styles from './styles.css'
import { GetText } from './utils'

const QuickOrder: StorefrontFunctionComponent<QuickOrderProps &
  WrappedComponentProps &
  unknown> = ({
  customToastUrl,
  title,
  showCopyPaste,
  showCategory,
  showUpload,
  showAutocomplete,
  copyText,
  copyDescription,
  oneText,
  oneDescription,
  catText,
  catDescription,
  uploadText,
  uploadDescription,
  downloadText,
  data,
  intl,
}: any) => {
  const { showToast } = useContext(ToastContext)

  const [state, setState] = useState<any>({
    reviewState: false,
    showAddToCart: false,
    textAreaValue: '',
    reviewItems: [],
    refidLoading: null,
    seller: window.sessionStorage?.getItem('sellerId') ?? null,
    sellers:
      data.sellers?.itemsReturned?.map((sellerItem: any) => {
        return {
          value: sellerItem.id,
          label: sellerItem.name,
        }
      }) || [],
  })

  const {
    reviewState,
    showAddToCart,
    textAreaValue,
    reviewItems,
    refidLoading,
    seller,
    sellers,
  } = state

  const { push } = usePixel()
  const { settings = {}, showInstallPrompt = undefined } = usePWA() || {}
  const { promptOnCustomEvent } = settings

  const { setOrderForm }: OrderFormContext = OrderForm.useOrderForm()

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

  const setSeller = (value: string) => {
    setState({
      ...state,
      seller: value,
    })
    window.sessionStorage.setItem('sellerId', value)
  }

  const callAddToCart = async (items: any) => {
    const mutationResult = await addToCart({
      variables: {
        items: items.map((item: any) => {
          return {
            ...item,
            seller: seller || sellers[0].value,
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
      mutationResult.data.addToCart.messages.generalMessages.map((msg: any) => {
        return showToast({
          message: msg.text,
          action: undefined,
          duration: 30000,
        })
      })
    } else {
      toastMessage({ success: true, isNewItem: true })
      setTimeout(() => {
        window.location.href = '/checkout'
      }, 1000)
    }

    if (promptOnCustomEvent === 'addToCart' && showInstallPrompt) {
      showInstallPrompt()
    }

    return showInstallPrompt
  }

  const addToCartCopyNPaste = () => {
    const items: any = reviewItems.map(({ vtexSku, quantity }: any) => {
      return {
        id: parseInt(vtexSku, 10),
        quantity: parseFloat(quantity),
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

  const onRefidLoading = (data: any) => {
    console.log('onRefidLoading', data)
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
    'sellerContainer',
  ] as const
  const handles = useCssHandles(CSS_HANDLES)

  return (
    <div
      className={`${styles.container} ${handles.container} flex flex-column pv6 ph4`}
    >
      <div
        className="c-on-base flex flex-wrap flex-row justify-between
            mt0"
      >
        <div
          className={`vtex-pageHeader__title t-heading-2 order-0 flex-grow-1 title-container ${handles.title}`}
        >
          <TranslatedTitle title={title} />
        </div>
        <div className="vtex-pageHeader__children order-2 order-0-ns mt0-ns">
          {sellers.length > 1 && (
            <div className={`mt5 ${handles.sellerContainer}`}>
              <FormattedMessage id="store/quickorder.seller" />:
              <Dropdown
                variation="inline"
                size="large"
                options={sellers}
                value={seller}
                onChange={(_, v) => {
                  setSeller(v)
                }}
              />
            </div>
          )}
        </div>
      </div>

      {!reviewState && showCopyPaste && (
        <div className={`pa6 bg-muted-5 ${handles.copyPasteBlock}`}>
          <TextAreaBlock
            text={copyText}
            description={copyDescription}
            value={textAreaValue}
            onReviewItems={onReviewItems}
            onRefidLoading={onRefidLoading}
          />
        </div>
      )}

      {!reviewState && showAutocomplete && (
        <div className={`pa6 bg-muted-5 ${handles.autocompleteBlock}`}>
          <AutocompleteBlock
            text={oneText}
            description={oneDescription}
            onAddToCart={callAddToCart}
            loading={mutationLoading}
            success={!mutationError}
          />
        </div>
      )}

      {!reviewState && showCategory && (
        <div className={`pa6 bg-muted-5 ${handles.categoryBlock}`}>
          <CategoryBlock
            text={catText}
            description={catDescription}
            onAddToCart={callAddToCart}
            loading={mutationLoading}
            success={!mutationError}
          />
        </div>
      )}

      {!reviewState && showUpload && (
        <div className={`pa6 bg-muted-5 ${handles.uploadBlock}`}>
          <UploadBlock
            text={uploadText}
            description={uploadDescription}
            onReviewItems={onReviewItems}
            onRefidLoading={onRefidLoading}
            downloadText={downloadText}
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
              <FormattedMessage id="store/quickorder.back" />
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
  copyText?: string
  copyDescription?: string
  oneText?: string
  oneDescription?: string
  catText?: string
  catDescription?: string
  uploadText?: string
  uploadDescription?: string
  downloadText?: string
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
      default: '',
    },
    showCopyPaste: {
      title: 'editor.quickorder.textarea.title',
      description: '',
      type: 'boolean',
      default: true,
    },
    copyText: {
      title: 'editor.quickorder.textarea.label',
      description: '',
      type: 'string',
      default: null,
    },
    copyDescription: {
      title: 'editor.quickorder.textarea.helper',
      description: '',
      type: 'string',
      default: null,
    },
    showAutocomplete: {
      title: 'editor.quickorder.autocomplete.title',
      description: '',
      type: 'boolean',
      default: true,
    },
    oneText: {
      title: 'editor.quickorder.autocomplete.label',
      description: '',
      type: 'string',
      default: null,
    },
    oneDescription: {
      title: 'editor.quickorder.autocomplete.helper',
      description: '',
      type: 'string',
      default: null,
    },
    showCategory: {
      title: 'editor.quickorder.category.title',
      description: '',
      type: 'boolean',
      default: true,
    },
    catText: {
      title: 'editor.quickorder.category.label',
      description: '',
      type: 'string',
      default: null,
    },
    catDescription: {
      title: 'editor.quickorder.category.helper',
      description: '',
      type: 'string',
      default: null,
    },
    showUpload: {
      title: 'editor.quickorder.upload.title',
      description: '',
      type: 'boolean',
      default: true,
    },
    uploadText: {
      title: 'editor.quickorder.upload.label',
      description: '',
      type: 'string',
      default: null,
    },
    uploadDescription: {
      title: 'editor.quickorder.upload.helper',
      description: '',
      type: 'string',
      default: null,
    },
    downloadText: {
      title: 'editor.quickorder.upload.downloadText',
      description: '',
      type: 'string',
      default: null,
    },
  },
}

export default compose(graphql(getSellers))(QuickOrder)
