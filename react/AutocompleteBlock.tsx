/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/prop-types */
import type { FunctionComponent } from 'react'
import React, { useState } from 'react'
import type { WrappedComponentProps } from 'react-intl'
import {  injectIntl } from 'react-intl'
import { Tag } from 'vtex.styleguide'
import PropTypes from 'prop-types'
import { useCssHandles } from 'vtex.css-handles'
import { useApolloClient } from 'react-apollo'

import QuickOrderAutocomplete from './components/QuickOrderAutocomplete'
import productQuery from './queries/product.gql'
import './global.css'

// const StateContext = React.createContext({ state });

const AutocompleteBlock: FunctionComponent<any & WrappedComponentProps> = ({
  onSelectedItemChange,
  text,
  description,
  componentOnly,
}) => {
  const client = useApolloClient()
  const [state, setState] = useState<any>({
    selectedItem: null,
    quantitySelected: 1,
    unitMultiplier: 1,
  })

  const { selectedItem } = state
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
          if (data.product.items[0].sellers.length > 1) {
            return item.sellerId === "uselectricalcd01"
          } else {
            return item.sellerDefault === true
          }
        }).sellerId
        : null


      let multiplier = 1;

      if (data.product.items.length === 1) {
        multiplier = data.product.items[0].unitMultiplier
      }

      setState({
        ...state,
        selectedItem: product?.length
          ? { ...product[0], value: selectedSku, seller, data }
          : null,
        unitMultiplier: multiplier,
        quantitySelected: multiplier,
      })
    }

    onSelectedItemChange(product[0])

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
      (item: { itemId: string }) => item.itemId === value
    )

    setState({
      ...state,
      selectedItem: newSelected,
      unitMultiplier: matchedItem.unitMultiplier,
      quantitySelected: matchedItem.unitMultiplier,
    })
  }

  const CSS_HANDLES = [
    'skuSelection',
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
  ] as const

  const handles = useCssHandles(CSS_HANDLES)

  return (
    <div>
      {/* <StateContext.Provider value={{ state, setState }}> */}
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
          <div className="bg-base t-body c-on-base pa0 br3 b--muted-4">
            {!selectedItem && <QuickOrderAutocomplete onSelect={onSelect} />}
            {!!selectedItem && (
              <div>
                <div className="w-two-thirds-l w-100-ns fl-l">
                  <div
                    className={`flex flex-column w-90 fl ${handles.productLabel}`}
                  >
                    <span className={`${handles.productTitle}`}>
                      {selectedItem.value}
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
              </div>
            )}
          </div>
        </div>
      </div>
      {/* </StateContext.Provider> */}
    </div>
  )
}

AutocompleteBlock.propTypes = {
  componentOnly: PropTypes.bool,
  text: PropTypes.string,
  description: PropTypes.string,
}

export default injectIntl(AutocompleteBlock)
