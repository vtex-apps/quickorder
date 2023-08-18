/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/jsx-key */
import PropTypes from 'prop-types'
import type { FunctionComponent } from 'react'
import React, { useState, useContext } from 'react'
import type { WrappedComponentProps } from 'react-intl'
import { FormattedMessage, injectIntl } from 'react-intl'
import {
  Collapsible,
  Input,
  Button,
  ToastContext,
  Spinner,
  Tag,
} from 'vtex.styleguide'
import { OrderForm } from 'vtex.order-manager'
import type { OrderForm as OrderFormType } from 'vtex.checkout-graphql'
import { addToCart as ADD_TO_CART } from 'vtex.checkout-resources/Mutations'
import { usePWA } from 'vtex.store-resources/PWAContext'
import { usePixel } from 'vtex.pixel-manager/PixelContext'
import { useCssHandles } from 'vtex.css-handles'
import { graphql, useApolloClient, useMutation } from 'react-apollo'

import { categoryMessages as messages } from './utils/messages'
import getCategories from './queries/categoriesQuery.gql'
import SearchByCategory from './queries/productsByCategory.gql'

const CategoryBlock: FunctionComponent<WrappedComponentProps & any> = ({
  text,
  description,
  componentOnly,
  intl,
  data: { categories },
}) => {
  const [state, setState] = useState<any>({
    categoryItems: {},
    quantitySelected: {},
    defaultSeller: {},
    // All the items with their respective units
    unitMultiplierList: {},
  })

  const { showToast } = useContext(ToastContext)

  const client = useApolloClient()

  const {
    categoryItems,
    quantitySelected,
    defaultSeller,
    unitMultiplierList,
  } = state

  const [addToCart, { error, loading }] = useMutation<
    { addToCart: OrderFormType },
    { items: [] }
  >(ADD_TO_CART)

  const { push } = usePixel()
  const { settings = {}, showInstallPrompt = undefined } = usePWA() || {}
  const { promptOnCustomEvent } = settings

  const { setOrderForm }: OrderFormContext = OrderForm.useOrderForm()

  const resolveToastMessage = (success: boolean, isNewItem: boolean) => {
    if (!success) return intl.formatMessage(messages.error)
    if (!isNewItem) return intl.formatMessage(messages.duplicate)

    return intl.formatMessage(messages.success)
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
            label: intl.formatMessage(messages.seeCart),
            href: '/checkout/#/cart',
          }
        : undefined
    }

    showToast({ message, action })
  }

  const _setState = (props: any) => {
    setState((previousState: any) => {
      const newState = { ...previousState, props }

      return newState
    })
  }

  const onAddToCart = async (items: any, skus: any) => {
    const mutationResult = await addToCart({
      variables: {
        items: items.map((item: any) => {
          return {
            ...item,
          }
        }),
      },
    })

    if (error || mutationResult.errors?.length) {
      if (error) {
        console.error(error)
      }

      if (mutationResult.errors?.length) {
        for (const element of mutationResult.errors) {
          console.error(element.message)
        }
      }

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
      const quantitiesCopy = quantitySelected

      skus.map((sku: any) => {
        quantitiesCopy[sku] = 0

        return true
      })
      _setState({
        quantitySelected: quantitiesCopy,
      })
    }

    if (promptOnCustomEvent === 'addToCart' && showInstallPrompt) {
      showInstallPrompt()
    }

    return showInstallPrompt
  }

  const CSS_HANDLES = [
    'categoryContainer',
    'categoryTitle',
    'categoryHelper',
    'categoryProductLabel',
    'categoryProductTitle',
    'categoryProductThumb',
    'categoryProductReference',
    'categoryInputQuantity',
    'categoryButtonAdd',
    'categoriesSubCategory',
    'categoriesProductContainer',
    'categoryLoadingProducts',
    'textContainer',
    'componentContainer',
    'categoryProductItem',
  ] as const

  const handles = useCssHandles(CSS_HANDLES)

  const setOptions = (categoryId: any, result: any) => {
    const copy = categoryItems

    copy[categoryId] = result
    _setState({
      categoryItems: copy,
    })
  }

  const handleSearch = async (categoryId: number, categoryName: string) => {
    const selectedFacets = categoryName
      .split('/')
      .filter((cat: string) => {
        return !!cat
      })
      .map((cat: string) => {
        return { key: 'c', value: cat }
      })

    if (!categoryItems[categoryId]) {
      const { data: dataProducts } = await client.query({
        query: SearchByCategory,
        variables: { selectedFacets },
      })

      for (const product of dataProducts.productSearch.products) {
        for (const item of product.items) {
          if (item.unitMultiplier > 1) {
            unitMultiplierList[item.itemId] = item
          }
        }
      }

      setOptions(
        categoryId,
        !!dataProducts &&
          !!dataProducts.productSearch &&
          !!dataProducts.productSearch.products
          ? dataProducts.productSearch.products
          : []
      )
    }

    return true
  }

  const calculateDivisible = (quantity: number, contentItemId: string) => {
    if (contentItemId in unitMultiplierList) {
      const multiplier = unitMultiplierList[contentItemId].unitMultiplier

      return quantity / multiplier
    }

    return quantity
  }

  const callAddToCart = () => {
    const skus: any = Object.getOwnPropertyNames(quantitySelected).filter(
      (sku: any) => {
        return quantitySelected[sku] !== 0
      }
    )

    if (skus?.length) {
      const items = skus.map((item: any) => {
        return {
          id: parseInt(item, 10),
          quantity: calculateDivisible(
            parseFloat(quantitySelected[item]),
            item
          ),
          seller: defaultSeller[item],
        }
      })

      onAddToCart(items, skus)
    } else {
      toastMessage('noneSelection')
    }
  }

  const thumb = (url: string) => {
    const td = url.split('/')
    const ids = td[td.indexOf('ids') + 1]

    return url.replace(ids, `${ids}-50-50`)
  }

  const roundToNearestMultiple = (quantity: number, contentItemId: string) => {
    if (contentItemId in unitMultiplierList) {
      const multiplier = unitMultiplierList[contentItemId].unitMultiplier

      toastMessage('multiplier')

      return Math.round(quantity / multiplier) * multiplier
    }

    return quantity
  }

  const drawProducts = (a: any) => {
    return a.length ? (
      a.map((b: any, i: number) => {
        return (
          <div key={`ifany_${i}`}>
            {b.items.length
              ? b.items.map((content: any) => {
                  const [referenceId] = content.referenceId
                  const [image] = content.images

                  return (
                    <div
                      className="flex flex-row pa2 pl4 bg-white hover-bg-near-white"
                      key={`prod_${i}_${content.itemId}`}
                    >
                      <div
                        className={`flex flex-row w-90 fl ${handles.categoryProductLabel}`}
                      >
                        {image?.imageUrl && (
                          <img
                            src={thumb(image.imageUrl)}
                            title={image.imageLabel}
                            alt={image.imageLabel}
                            width="50"
                            height="50"
                            className={`pr5 ${handles.categoryProductThumb}`}
                          />
                        )}
                        <span className={handles.categoryProductTitle}>
                          {content.nameComplete}
                        </span>
                        {referenceId && (
                          <span
                            className={`pl5 ${handles.categoryProductReference}`}
                          >
                            {referenceId.Value}
                          </span>
                        )}
                        {content.itemId in unitMultiplierList && (
                          <span className="pl5 mr4">
                            <Tag type="warning" variation="low">
                              Unit Multiplier of{' '}
                              {
                                unitMultiplierList[content.itemId]
                                  .unitMultiplier
                              }
                            </Tag>
                          </span>
                        )}
                      </div>
                      <div
                        className={`flex flex-column w-10 ph5-l ph2 p fl ${handles.categoryInputQuantity}`}
                      >
                        <Input
                          value={quantitySelected[content.itemId] ?? 0}
                          size="small"
                          type="number"
                          min={0}
                          disabled={loading}
                          onChange={(e: any) => {
                            const newQtd = quantitySelected

                            newQtd[content.itemId] = e.target.value
                            const newSeller = defaultSeller
                            const seller = content.sellers.find((s: any) => {
                              return s.sellerDefault === true
                            })

                            newSeller[content.itemId] =
                              seller?.sellerId ||
                              (content.sellers.length
                                ? content.sellers[0].sellerId
                                : '1')

                            _setState({
                              quantitySelected: newQtd,
                              defaultSeller: newSeller,
                            })
                          }}
                          onBlur={() => {
                            const roundedValue = roundToNearestMultiple(
                              quantitySelected[content.itemId] || 0,
                              content.itemId
                            )

                            const newQtd = quantitySelected

                            quantitySelected[content.itemId] = String(
                              roundedValue
                            )
                            _setState({
                              quantitySelected: newQtd,
                            })
                          }}
                        />
                      </div>
                    </div>
                  )
                })
              : ''}
          </div>
        )
      })
    ) : (
      <span>No products</span>
    )
  }

  const openClose = (id: number, name: string) => {
    const findNChange = (source: any) => {
      const obj: any = source.map((item: any) => {
        const ret = item

        if (item.id === id) {
          ret.isOpen = !item.isOpen
        }

        if (item.id !== id && item.hasChildren) {
          ret.children = findNChange(item.children)
        }

        return ret
      })

      return obj
    }

    const newCategories = findNChange(categories)

    _setState({
      categories: newCategories,
    })
    handleSearch(id, name)
  }

  const collapsible = (item: any) => {
    return (
      <Collapsible
        key={`collapsable_${item.slug}_${item.id}`}
        header={<span className="ml5 fw5">{item.name}</span>}
        isOpen={item.isOpen}
        onClick={() => {
          openClose(item.id, item.href)
        }}
      >
        <div className={`${handles.categoriesProductContainer}`}>
          {(!categoryItems || !categoryItems[item.id]) && (
            <span className={`${handles.categoryLoadingProducts}`}>
              <Spinner size={10} />{' '}
              <FormattedMessage id="store/quickorder.category.loading" />
            </span>
          )}
          {!!categoryItems &&
            !!categoryItems[item.id] &&
            drawProducts(categoryItems[item.id])}
        </div>
        {item.hasChildren && (
          <div className={`${handles.categoriesSubCategory} pl5`}>
            {item.children.map((child: any) => {
              return (
                <div key={`${child.slug}_${child.slug}`}>
                  {collapsible(child)}
                </div>
              )
            })}
          </div>
        )}
      </Collapsible>
    )
  }

  return (
    <div className={`${handles.categoryContainer}`}>
      {!componentOnly && (
        <div className={`${handles.textContainer} w-third-l w-100-ns fl-l`}>
          <h2
            className={`t-heading-3 mb3 ml5 ml3-ns mt4 ${handles.categoryTitle}`}
          >
            {text}
          </h2>
          <div
            className={`t-body lh-copy c-muted-1 mb7 ml3 false ${handles.categoryHelper}`}
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
        {!categories && (
          <div>
            <Spinner />
          </div>
        )}
        {categories && (
          <div className={`${handles.categoryProductItem}`}>
            <div className="flex flex-row">
              <div
                className={`flex flex-column w-100 items-end fl pr7 ${handles.categoryButtonAdd}`}
              >
                <Button
                  variation="primary"
                  size="small"
                  isLoading={loading}
                  onClick={() => {
                    callAddToCart()
                  }}
                >
                  <FormattedMessage id="store/quickorder.category.addButton" />
                </Button>
              </div>
            </div>
            {categories.map((item: any) => {
              return <div key={item.id}>{collapsible(item)}</div>
            })}
          </div>
        )}
      </div>
    </div>
  )
}

CategoryBlock.propTypes = {
  intl: PropTypes.any,
  componentOnly: PropTypes.bool,
  text: PropTypes.string,
  description: PropTypes.string,
  data: PropTypes.shape({
    loading: PropTypes.bool,
    success: PropTypes.bool,
    categories: PropTypes.any,
  }),
}

interface OrderFormContext {
  loading: boolean
  orderForm: OrderFormType | undefined
  setOrderForm: (orderForm: Partial<OrderFormType>) => void
}

export default injectIntl(graphql(getCategories)(CategoryBlock))
