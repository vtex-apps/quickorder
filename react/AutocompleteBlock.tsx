import React, { useState, useContext } from 'react'
import {
  FormattedMessage,
  WrappedComponentProps,
  injectIntl,
  defineMessages,
} from 'react-intl'
import {
  Button,
  Tag,
  ToastContext,
  IconClear,
  Spinner,
  NumericStepper,
} from 'vtex.styleguide'
import { OrderForm } from 'vtex.order-manager'
import { OrderForm as OrderFormType } from 'vtex.checkout-graphql'
import { addToCart as ADD_TO_CART } from 'vtex.checkout-resources/Mutations'
import { usePWA } from 'vtex.store-resources/PWAContext'
import { usePixel } from 'vtex.pixel-manager/PixelContext'
import PropTypes from 'prop-types'
import { useCssHandles } from 'vtex.css-handles'
import { useApolloClient, useMutation, useQuery } from 'react-apollo'
import { useOrderItems } from 'vtex.order-items/OrderItems'

import QuickOrderAutocomplete from './components/QuickOrderAutocomplete'
import productQuery from './queries/product.gql'
import GET_ACCOUNT_INFO from './queries/orderSoldToAccount.graphql'
import GET_PRODUCT_DATA from './queries/getPrductAvailability.graphql'
import './global.css'
import { getNewItems, itemsInSystem } from './utils'

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
  selectSku: {
    id: 'store/quickorder.autocomplete.selectSku',
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
  // eslint-disable-next-line react/prop-types
  WrappedComponentProps> = ({ text, description, componentOnly, intl }) => {
  const client = useApolloClient()
  const { showToast } = useContext(ToastContext)
  const [state, setState] = useState<any>({
    selectedItem: null,
    quantitySelected: 1,
  })

  const [hideAddToCart, setHideAddToCart] = useState(true)

  const [addToCart, { error, loading }] = useMutation<
    { addToCart: OrderFormType },
    { items: [] }
  >(ADD_TO_CART)

  const { push } = usePixel()
  const { settings = {}, showInstallPrompt = undefined } = usePWA() || {}
  const { promptOnCustomEvent } = settings
  const { addItem } = useOrderItems()
  const { setOrderForm, orderForm }: OrderFormContext = OrderForm.useOrderForm()

  const { data: accountData, loading: accountDataLoading } = useQuery(
    GET_ACCOUNT_INFO,
    {
      notifyOnNetworkStatusChange: true,
      ssr: false,
    }
  )

  const customerNumber =
    accountData?.getOrderSoldToAccount?.customerNumber ?? ''

  const targetSystem = accountData?.getOrderSoldToAccount?.targetSystem ?? ''
  const salesOrganizationCode =
    accountData?.getOrderSoldToAccount?.salesOrganizationCode ?? ''

  const translateMessage = (message: MessageDescriptor) => {
    // eslint-disable-next-line react/prop-types
    return intl.formatMessage(message)
  }

  const resolveToastMessage = (success: boolean, isNewItem: boolean) => {
    if (!success) return translateMessage(messages.error)
    if (!isNewItem) return translateMessage(messages.duplicate)

    return translateMessage(messages.success)
  }

  const toastMessage = (arg: any) => {
    let message

    if (typeof arg === 'string') {
      // eslint-disable-next-line react/prop-types
      message = intl.formatMessage(messages[arg])
    } else {
      const {
        success,
        isNewItem,
      }: {
        success: boolean
        isNewItem: boolean
      } = arg

      message = resolveToastMessage(success, isNewItem)
    }

    showToast({ message })
  }

  const clear = () => {
    setState({
      ...state,
      selectedItem: null,
      quantitySelected: 1,
    })
  }

  const { selectedItem, quantitySelected } = state
  const callAddToCart = async (items: any) => {
    const existItems = itemsInSystem(orderForm?.items, items)
    const newItems = getNewItems(orderForm?.items, items)

    if (existItems.length > 0) {
      addItem(existItems)

      if (promptOnCustomEvent === 'addToCart' && showInstallPrompt) {
        showInstallPrompt()
      }

      toastMessage({ success: true, isNewItem: true })
    }

    if (newItems.length > 0) {
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
        mutationResult.data.addToCart.messages.generalMessages.map(
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
        clear()
      }

      if (promptOnCustomEvent === 'addToCart' && showInstallPrompt) {
        showInstallPrompt()
      }
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

      // validate product
      const refId =
        (data?.product?.items[0]?.referenceId ?? []).find(
          (ref: any) => ref.Key === 'RefId'
        )?.Value ?? ''

      try {
        const { data: productInfo } = await client.query({
          query: GET_PRODUCT_DATA,
          variables: {
            refIds: [refId] as string[],
            customerNumber,
            targetSystem,
            salesOrganizationCode,
          },
        })

        if (productInfo) {
          const itemsFromQuery = productInfo.getSkuAvailability?.items ?? []
          const refIdNotFound = itemsFromQuery.filter((item: any) => {
            return item.sku === null
          })

          const refNotAvailable = itemsFromQuery.filter((item: any) => {
            return item.availability !== 'available'
          })

          if (
            itemsFromQuery.length > 0 &&
            refIdNotFound.length === 0 &&
            refNotAvailable.length === 0
          ) {
            setHideAddToCart(false)
          }
        }
      } catch (err) {
        console.error(err)
      }

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

  const thumb = (url: string) => {
    return url.replace('25-25', `50-50`)
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
      toastMessage('selectSku')
    }
  }

  const CSS_HANDLES = [
    'skuSelection',
    'productThumb',
    'productTitle',
    'productSku',
    'productLabel',
    'inputQuantity',
    'buttonAdd',
    'textContainer',
    'textContainerTitle',
    'textContainerDescription',
    'componentContainer',
    'buttonClear',
    'inactiveAddToCart',
  ] as const

  const handles = useCssHandles(CSS_HANDLES)

  const numberValidator = (minQty: number, unit: number, value: number) => {
    const actualQty = value * unit
    const adjustedQty =
      minQty % unit === 0
        ? actualQty < minQty
          ? minQty
          : actualQty
        : actualQty < minQty
        ? minQty + (unit - (minQty % unit))
        : actualQty

    return adjustedQty / unit
  }

  const numStepper = (itemSelected: any, selectedQuantity: number) => {
    const minQty =
      itemSelected.data.product.properties
        .find(
          (property: { name: string }) =>
            property.name === 'Minimum Order Quantity'
        )
        ?.values.find(value => value) ?? 1

    const unit =
      itemSelected.data.product.items.find(item => item)?.unitMultiplier ?? 1

    return (
      <div>
        <NumericStepper
          size="small"
          minValue={1}
          value={numberValidator(minQty, unit, selectedQuantity)}
          unitMultiplier={unit}
          maxValue={9999999}
          onChange={(e: any) => {
            setState({
              ...state,
              quantitySelected: e.value,
            })
          }}
        />
      </div>
    )
  }

  return accountDataLoading ? (
    <Spinner />
  ) : (
    <div className="flex">
      {!componentOnly && (
        <div className={`${handles.textContainer} w-20-l w-100-ns fl-l`}>
          <h2
            className={`${handles.textContainerTitle} t-heading-3 mb3 ml5 ml3-ns mt4`}
          >
            {text}
          </h2>
          <div
            className={`${handles.textContainerDescription} t-body lh-copy c-muted-1 mb7 ml3 false`}
          >
            {description}
          </div>
        </div>
      )}
      <div
        className={`${handles.componentContainer} ${
          !componentOnly ? 'w-80-l w-100-ns fr-l flex' : ''
        }`}
      >
        <div className="w-100 mb5">
          <div className="bg-base t-body c-on-base pa7 br3 b--muted-4">
            {!selectedItem && <QuickOrderAutocomplete onSelect={onSelect} />}
            {!!selectedItem && (
              <div>
                <div
                  className="w-one-thirds-l w-100-ns fl-l"
                  style={{ maxWidth: '430px', width: '100%' }}
                >
                  <div
                    className={`flex flex-column w-10 fl ${handles.productThumb}`}
                  >
                    <img
                      src={thumb(selectedItem.thumb)}
                      width="50"
                      height="50"
                      alt=""
                    />
                  </div>
                  <div
                    className={`flex flex-column w-90 fl ${handles.productLabel}`}
                  >
                    <span className={`${handles.productTitle}`}>
                      {selectedItem.label}
                    </span>
                    {!!selectedItem &&
                      selectedItem.data.product.items.length > 1 && (
                        <div className={`${handles.productSku} flex flex-row`}>
                          {selectedItem.data.product.items.map((item: any) => {
                            return (
                              <span
                                key={item.itemId}
                                className={`mr4 ${handles.skuSelection}`}
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
                </div>
                <div
                  className="w-two-thirds-l w-100-ns fr-l"
                  style={{ maxWidth: '430px', width: '100%' }}
                >
                  <div
                    className={`flex flex-column w-40 ph5-l ph2 p fl ${handles.inputQuantity}`}
                  >
                    {numStepper(selectedItem, quantitySelected)}
                  </div>
                  {!hideAddToCart ? (
                    <div
                      className={`flex flex-column w-40 fl ${handles.buttonAdd}`}
                    >
                      <Button
                        variation="primary"
                        size="small"
                        isLoading={loading}
                        onClick={() => {
                          callAddUnitToCart()
                        }}
                      >
                        <FormattedMessage id="store/quickorder.addToCart" />
                      </Button>
                    </div>
                  ) : (
                    <div
                      className={`flex flex-column w-40 fl ${handles.inactiveAddToCart}`}
                    >
                      <Button variation="primary" size="small">
                        <FormattedMessage id="store/quickorder.addToCart" />
                      </Button>
                    </div>
                  )}
                  <div
                    className={`flex flex-column w-20 fl ${handles.buttonClear}`}
                  >
                    <Button
                      variation="tertiary"
                      size="small"
                      disabled={loading}
                      onClick={() => {
                        clear()
                      }}
                    >
                      <IconClear
                        onClick={() => {
                          clear()
                        }}
                      />
                    </Button>
                  </div>
                </div>
              </div>
            )}
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
  orderForm: OrderFormType | undefined
  setOrderForm: (orderForm: Partial<OrderFormType>) => void
}

interface MessageDescriptor {
  id: string
  description?: Record<string, unknown>
  defaultMessage?: string
}

export default injectIntl(AutocompleteBlock)
