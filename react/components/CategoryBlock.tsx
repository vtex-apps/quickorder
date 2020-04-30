/* eslint-disable no-console */
/* eslint-disable react/jsx-key */
import PropTypes from 'prop-types'
import React, { useState, useContext } from 'react'
import { FormattedMessage, WrappedComponentProps } from 'react-intl'
import { Collapsible, Input, Button, ToastContext } from 'vtex.styleguide'
import { useCssHandles } from 'vtex.css-handles'
import { graphql, useApolloClient, compose } from 'react-apollo'
import _ from 'lodash'

import styles from '../styles.css'
import getCategories from '../queries/categoriesQuery.gql'
import SearchByCategory from '../queries/productsByCategory.gql'

const CategoryBlock: StorefrontFunctionComponent<any &
  WrappedComponentProps> = ({ onAddToCart, loading, success, intl, data }) => {
  const [state, setState] = useState<any>({
    categories: data.categories || [],
    categoryItems: {},
    quantitySelected: {},
  })

  const { showToast } = useContext(ToastContext)

  const client = useApolloClient()

  const { categories, categoryItems, quantitySelected } = state

  const translateMessage = (message: MessageDescriptor) => {
    return intl.formatMessage(message)
  }

  const toastMessage = (messsageKey: string) => {
    const message = translateMessage({
      id: messsageKey,
    })

    const action = undefined

    showToast({ message, action })
  }

  const CSS_HANDLES = [
    'categoryContainer',
    'categoryTitle',
    'categoryHelper',
    'categoryProductLabel',
    'categoryInputQuantity',
    'categoryButtonAdd',
    'categoriesSubCategory',
    'categoriesProductContainer',
    'categoryLoadingProducts',
  ] as const
  const handles = useCssHandles(CSS_HANDLES)

  const _setState = (props: any) => {
    setState((previousState: any) => {
      const newState = _.merge(props, previousState)
      return newState
    })
  }

  const setOptions = (categoryId: any, result: any) => {
    const copy = categoryItems
    copy[categoryId] = result
    _setState({
      categoryItems: copy,
    })
  }

  const handleSearch = async (categoryId: any) => {
    if (!categoryItems[categoryId]) {
      const { data: dataProducts } = await client.query({
        query: SearchByCategory,
        variables: { categoryId },
      })
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
          quantity: parseFloat(quantitySelected[item]),
          seller: '1',
        }
      })
      onAddToCart(items).then(() => {
        if (!loading && success) {
          const quantitiesCopy = quantitySelected
          skus.map((sku: any) => {
            quantitiesCopy[sku] = 0
            return true
          })
          _setState({
            quantitySelected: quantitiesCopy,
          })
          setTimeout(() => {
            window.location.href = '/checkout'
          }, 1000)
        }
        return true
      })
    } else {
      toastMessage('store/quickorder.category.noneSelection')
    }
  }

  const drawProducts = (a: any) => {
    return a.length ? (
      a.map((b: any) => {
        return b.items.length
          ? b.items.map((content: any) => {
              return (
                <div className="flex flex-row pa2 pl4 bg-white hover-bg-near-white">
                  <div
                    className={`flex flex-column w-90 ${styles.pcc} fl ${handles.categoryProductLabel}`}
                  >
                    {content.nameComplete}
                  </div>
                  <div
                    className={`flex flex-column w-10 ph5-l ph2 p fl ${handles.categoryInputQuantity}`}
                  >
                    <Input
                      value={quantitySelected[content.itemId] || 0}
                      size="small"
                      disabled={loading}
                      onChange={(e: any) => {
                        const newQtd = quantitySelected
                        newQtd[content.itemId] = e.target.value
                        _setState({
                          quantitySelected: newQtd,
                        })
                      }}
                    />
                  </div>
                </div>
              )
            })
          : ''
      })
    ) : (
      <span>No products</span>
    )
  }

  const openClose = (id: number) => {
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
    handleSearch(id)
  }

  const collapsible = (item: any) => {
    return (
      <Collapsible
        header={<span className="ml5 fw5">{item.name}</span>}
        isOpen={item.isOpen}
        onClick={() => {
          openClose(item.id)
        }}
      >
        <div className={`${handles.categoriesProductContainer}`}>
          {(!categoryItems || !categoryItems[item.id]) && (
            <span className={`${handles.categoryLoadingProducts}`}>
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
              return collapsible(child)
            })}
          </div>
        )}
      </Collapsible>
    )
  }

  return (
    <div className={`${handles.categoryContainer}`}>
      <div className="w-third-l w-100-ns fl-l">
        <div className="flex-grow-1">
          <h2
            className={`t-heading-3 mb3 ml5 ml3-ns mt4 ${handles.categoryTitle}`}
          >
            <FormattedMessage id="store/quickorder.category.label" />
          </h2>
          <div
            className={`t-body lh-copy c-muted-1 mb7 ml3 false ${handles.categoryHelper}`}
          >
            <FormattedMessage id="store/quickorder.category.helper" />
          </div>
        </div>
      </div>
      <div className="w-two-thirds-l w-100-ns fr-l">
        {categories && (
          <div>
            <div className="flex flex-row">
              <div
                className={`flex flex-column w-100 items-end fl ${handles.categoryButtonAdd}`}
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
              return collapsible(item)
            })}
          </div>
        )}
      </div>
    </div>
  )
}

CategoryBlock.propTypes = {
  onAddToCart: PropTypes.func,
  loading: PropTypes.bool,
  success: PropTypes.bool,
  data: PropTypes.shape({
    loading: PropTypes.bool,
    success: PropTypes.bool,
    categories: PropTypes.any,
  }),
}

interface MessageDescriptor {
  id: string
  description?: string | object
  defaultMessage?: string
}

export default compose(graphql(getCategories))(CategoryBlock)
