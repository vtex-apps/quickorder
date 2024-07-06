/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/prop-types */
import type { FunctionComponent } from 'react'
import React, { useState, useContext } from 'react'
import type { WrappedComponentProps } from 'react-intl'
import { FormattedMessage, injectIntl } from 'react-intl'
import { Button, Tag, Input, ToastContext, IconClear } from 'vtex.styleguide'
import { OrderForm } from 'vtex.order-manager'
import type { OrderForm as OrderFormType } from 'vtex.checkout-graphql'
import { addToCart as ADD_TO_CART } from 'vtex.checkout-resources/Mutations'
import { usePWA } from 'vtex.store-resources/PWAContext'
import { usePixel } from 'vtex.pixel-manager/PixelContext'
import PropTypes from 'prop-types'
import { useCssHandles } from 'vtex.css-handles'
import { useApolloClient, useMutation } from 'react-apollo'

import { autocompleteMessages as messages } from './utils/messages'
import QuickOrderAutocomplete from './components/QuickOrderAutocomplete'
import productQuery from './queries/product.gql'
import './global.css'

const AutocompleteBlock: FunctionComponent<any & WrappedComponentProps> = ({
  text,
  description,
  componentOnly,
  intl,
}) => {
  const client = useApolloClient()
  const { showToast } = useContext(ToastContext)
  const [state, setState] = useState<any>({
    selectedItem: null,
    quantitySelected: 1,
    unitMultiplier: 1,
  })

  const [addToCart, { error, loading }] = useMutation<
    { addToCart: OrderFormType },
    { items: [] }
  >(ADD_TO_CART)

  const { push } = usePixel()
  const { settings = {}, showInstallPrompt = undefined } = usePWA() || {}
  const { promptOnCustomEvent } = settings

  const { setOrderForm }: OrderFormContext = OrderForm.useOrderForm()
  const orderForm = OrderForm.useOrderForm()

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

      action = success
        ? {
            label: translateMessage(messages.seeCart),
            href: '/checkout/#/cart',
          }
        : undefined
    }

    showToast({ message, action })
  }

  const clear = () => {
    setState({
      ...state,
      selectedItem: null,
      quantitySelected: 1,
      unitMultiplier: 1,
    })
  }

  interface ItemType {
    id: string
    quantity: number
  }

  const { selectedItem, quantitySelected, unitMultiplier } = state
  const callAddToCart = async (items: any) => {
    const currentItemsInCart = orderForm.orderForm.items
    const mutationResult = await addToCart({
      variables: {
        items: items.map((item: ItemType) => {
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
      clear()
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

      let multiplier = 1

      if (data.product.items.length === 1) {
        multiplier = data.product.items[0].unitMultiplier
      }

      setState({
        ...state,
        selectedItem:
          !!product && product.length
            ? { ...product[0], value: selectedSku, seller, data }
            : null,
        unitMultiplier: multiplier,
        quantitySelected: multiplier,
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

    const matchedItem = selectedItem.data.product.items.find(
      (item) => item.itemId === value
    )

    setState({
      ...state,
      selectedItem: newSelected,
      unitMultiplier: matchedItem.unitMultiplier,
      quantitySelected: matchedItem.unitMultiplier,
    })
  }

  const thumb = (url: string) => {
    return url.replace('25-25', `50-50`)
  }

  const calculateDivisible = (quantity: number, multiplier: number) => {
    if (multiplier) {
      return quantity / multiplier
    }

    return quantity
  }

  const callAddUnitToCart = () => {
    if (selectedItem?.value) {
      const items = [
        {
          id: parseInt(selectedItem.value, 10),
          quantity: calculateDivisible(
            parseFloat(quantitySelected),
            unitMultiplier
          ),
          seller: selectedItem.seller,
        },
      ]

      callAddToCart(items)
    } else {
      toastMessage('selectSku')
    }
  }

  const roundToNearestMultiple = (quantity: number, multiplier: number) => {
    if (multiplier) {
      toastMessage('multiplier')

      return Math.round(quantity / multiplier) * multiplier
    }

    return quantity
  }

  const CSS_HANDLES = [
    'autoCompleteBlock',
    'skuSelection',
    'productThumb',
    'productTitle',
    'productSku',
    'skuSelected',
    'productLabel',
    'inputQuantity',
    'buttonAdd',
    'textContainer',
    'textContainerTitle',
    'textContainerDescription',
    'componentContainer',
    'buttonClear',
  ] as const

  const handles = useCssHandles(CSS_HANDLES)

  return (
    <div className={`${handles.autoCompleteBlock}`}>
      {!componentOnly && (
        <div className={`${handles.textContainer} w-third-l w-100-ns fl-l`}>
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
          !componentOnly ? 'w-two-thirds-l w-100-ns fr-l' : ''
        }`}
      >
        <div className="w-100 mb5">
          <div className="bg-base t-body c-on-base pa7 br3 b--muted-4">
            {!selectedItem && <QuickOrderAutocomplete onSelect={onSelect} />}
            {!!selectedItem && (
              <div>
                <div className="w-two-thirds-l w-100-ns fl-l">
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
                                className={`mr4 ${handles.skuSelection} ${
                                  item.itemId === selectedItem.value &&
                                  handles.skuSelected
                                }`}
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
                  {!!selectedItem && unitMultiplier && (
                    <div
                      className={`flex flex-column w-90 fl ${handles.productLabel}`}
                    >
                      <span className="mr4">
                        <Tag type="warning" variation="low">
                          <FormattedMessage id="store/quickorder.autocomplete.multiplierOf" />{' '}
                          {unitMultiplier}
                        </Tag>
                      </span>
                    </div>
                  )}
                </div>
                <div className="w-third-l w-100-ns fr-l">
                  <div
                    className={`flex flex-column w-40 ph5-l ph2 p fl ${handles.inputQuantity}`}
                  >
                    <Input
                      value={quantitySelected}
                      size="small"
                      type="number"
                      min={unitMultiplier}
                      step={unitMultiplier}
                      onChange={(e: any) => {
                        if (e.target.value > 0) {
                          setState({
                            ...state,
                            quantitySelected: e.target.value,
                          })
                        }
                      }}
                      onBlur={() => {
                        const roundedValue = roundToNearestMultiple(
                          quantitySelected,
                          unitMultiplier
                        )

                        setState({
                          ...state,
                          quantitySelected: roundedValue,
                        })
                      }}
                    />
                  </div>
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
                      <FormattedMessage id="store/quickorder.autocomplete.addButton" />
                    </Button>
                  </div>
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
  description?: string | any
  defaultMessage?: string
}

export default injectIntl(AutocompleteBlock)
