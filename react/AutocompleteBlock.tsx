/* eslint-disable no-console */
/* eslint-disable react/prop-types */
import React, { useState, useContext } from 'react'
import {
  FormattedMessage,
  WrappedComponentProps,
  injectIntl,
  defineMessages,
} from 'react-intl'
import { Button, Tag, Input, ToastContext } from 'vtex.styleguide'
import { OrderForm } from 'vtex.order-manager'
import { addToCart as ADD_TO_CART } from 'vtex.checkout-resources/Mutations'
import { usePWA } from 'vtex.store-resources/PWAContext'
import { usePixel } from 'vtex.pixel-manager/PixelContext'
import PropTypes from 'prop-types'
import QuickOrderAutocomplete from './components/QuickOrderAutocomplete'
import styles from './styles.css'
import { useCssHandles } from 'vtex.css-handles'
import { useApolloClient, useMutation } from 'react-apollo'
import productQuery from './queries/product.gql'

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

const AutocompleteBlock: StorefrontFunctionComponent<any &
  WrappedComponentProps> = ({ text, description, componentOnly, intl }) => {
  const client = useApolloClient()
  const { showToast } = useContext(ToastContext)
  const [state, setState] = useState<any>({
    selectedItem: null,
    quantitySelected: 1,
  })

  const [addToCart, { error, loading }] = useMutation<
    { addToCart: OrderForm },
    { items: [] }
  >(ADD_TO_CART)

  const { push } = usePixel()
  const { settings = {}, showInstallPrompt = undefined } = usePWA() || {}
  const { promptOnCustomEvent } = settings

  const { setOrderForm }: OrderFormContext = OrderForm.useOrderForm()

  const translateMessage = (message: MessageDescriptor) => {
    return intl.formatMessage(message)
  }
  const resolveToastMessage = (success: boolean, isNewItem: boolean) => {
    if (!success) return translateMessage(messages.error)
    if (!isNewItem) return translateMessage(messages.duplicate)

    return translateMessage(messages.success)
  }
  const toastMessage = (arg: any) => {
    let message
    let action
    if (typeof arg === 'string') {
      message = translateMessage({
        id: arg,
      })
    } else {
      const {
        success,
        isNewItem,
      }: {
        success: boolean
        isNewItem: boolean
      } = arg
      message = resolveToastMessage(success, isNewItem)

      action = success
        ? {
            label: translateMessage(messages.seeCart),
            href: '/checkout/#/cart',
          }
        : undefined
    }
    showToast({ message, action })
  }

  const { selectedItem, quantitySelected } = state
  const callAddToCart = async (items: any) => {
    const mutationResult = await addToCart({
      variables: {
        items: items.map((item: any) => {
          return {
            ...item,
          }
        }),
      },
    })

    if (error) {
      console.error(error)
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
      setState({
        ...state,
        selectedItem: null,
        quantitySelected: 1,
      })
    }

    if (promptOnCustomEvent === 'addToCart' && showInstallPrompt) {
      showInstallPrompt()
    }

    return showInstallPrompt
  }
  const onSelect = async (product: any) => {
    if (!!product && product.length) {
      const query = {
        query: productQuery,
        variables: { slug: product[0].slug },
      }
      const { data } = await client.query(query)
      const selectedSku =
        data.product.items.length === 1 ? data.product.items[0].itemId : null

      const seller = selectedSku
        ? data.product.items[0].sellers.find((item: any) => {
            return item.sellerDefault === true
          }).sellerId
        : null
      setState({
        ...state,
        selectedItem:
          !!product && product.length
            ? { ...product[0], value: selectedSku, seller, data }
            : null,
      })
    }
    return true
  }

  const selectSku = (value: string) => {
    const seller = selectedItem.data.product.items
      .find((item: any) => {
        return item.itemId === value
      })
      .sellers.find((s: any) => {
        return s.sellerDefault === true
      }).sellerId
    const newSelected = {
      ...selectedItem,
      seller,
      value,
    }
    setState({
      ...state,
      selectedItem: newSelected,
    })
  }

  const callAddUnitToCart = () => {
    if (selectedItem && selectedItem.value) {
      const items = [
        {
          id: parseInt(selectedItem.value, 10),
          quantity: parseFloat(quantitySelected),
          seller: selectedItem.seller,
        },
      ]
      callAddToCart(items)
    } else {
      toastMessage('store/quickorder.autocomplete.selectSku')
    }
  }

  const CSS_HANDLES = [
    'skuSelection',
    'productThumb',
    'productLabel',
    'inputQuantity',
    'buttonAdd',
    'textContainer',
    'componentContainer',
  ] as const
  const handles = useCssHandles(CSS_HANDLES)

  return (
    <div>
      {!componentOnly && (
        <div className={`${handles.textContainer} w-third-l w-100-ns fl-l`}>
          <div className="flex-grow-1">
            <h2 className="t-heading-3 mb3 ml5 ml3-ns mt4">{text}</h2>
            <div className="t-body lh-copy c-muted-1 mb7 ml3 false">
              {description}
            </div>
          </div>
        </div>
      )}
      <div
        className={`${handles.componentContainer} ${
          !componentOnly ? 'w-two-thirds-l w-100-ns fr-l' : ''
        }`}
      >
        <div className="w-100 mb5">
          <div className="bg-base t-body c-on-base pa7 br3 b--muted-4">
            <div className={'flex flex-column w-100'}>
              {!selectedItem && <QuickOrderAutocomplete onSelect={onSelect} />}
              {!!selectedItem && (
                <div>
                  <div className={`flex flex-row`}>
                    <div
                      className={`flex flex-column w-10 fl ${handles.productThumb}`}
                    >
                      <img
                        src={selectedItem.thumb}
                        width="25"
                        height="25"
                        alt=""
                      />
                    </div>
                    <div
                      className={`flex flex-column w-60 fl ${handles.productLabel}`}
                    >
                      {selectedItem.label}
                    </div>
                    <div
                      className={`flex flex-column w-10 ph5-l ph2 p fl ${handles.inputQuantity}`}
                    >
                      <Input
                        value={quantitySelected}
                        size="small"
                        onChange={(e: any) => {
                          setState({
                            ...state,
                            quantitySelected: e.target.value,
                          })
                        }}
                      />
                    </div>
                    <div
                      className={`flex flex-column w-20 fl ${handles.buttonAdd}`}
                    >
                      <Button
                        variation="primary"
                        size="small"
                        isLoading={loading}
                        onClick={() => {
                          callAddUnitToCart()
                        }}
                      >
                        <FormattedMessage id="store/quickorder.autocomplete.addButton" />
                      </Button>
                    </div>
                  </div>
                  {!!selectedItem &&
                    selectedItem.data.product.items.length > 1 && (
                      <div className={`flex flex-row`}>
                        {selectedItem.data.product.items.map((item: any) => {
                          return (
                            <span
                              key={item.itemId}
                              className={`mr4 ${handles.skuSelection} ${styles.tag}`}
                            >
                              <Tag
                                size="small"
                                bgColor={
                                  item.itemId === selectedItem.value
                                    ? '#8bc34a'
                                    : '#979899'
                                }
                                onClick={() => {
                                  selectSku(item.itemId)
                                }}
                              >
                                {item.name}
                              </Tag>
                            </span>
                          )
                        })}
                      </div>
                    )}
                </div>
              )}
            </div>
            <div className={'flex flex-column w-40'}></div>
          </div>
        </div>
      </div>
    </div>
  )
}
AutocompleteBlock.propTypes = {
  componentOnly: PropTypes.bool,
  text: PropTypes.string,
  description: PropTypes.string,
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

export default injectIntl(AutocompleteBlock)
