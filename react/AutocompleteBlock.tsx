/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/prop-types */
import type { FunctionComponent } from 'react'
import React, { useState } from 'react'
import type { WrappedComponentProps } from 'react-intl'
import {  injectIntl } from 'react-intl'
import { Tag, Spinner } from 'vtex.styleguide'
import PropTypes from 'prop-types'
import { useCssHandles } from 'vtex.css-handles'
import { useApolloClient } from 'react-apollo'

import QuickOrderAutocomplete from './components/QuickOrderAutocomplete'
import productQuery from './queries/product.gql'
import { getSession } from './modules/session'
import GET_ORGANIZATIONS_BY_EMAIL from './queries/getOrganizationsByEmail.gql'
import './global.css'

// const StateContext = React.createContext({ state });

const AutocompleteBlock: FunctionComponent<any & WrappedComponentProps> = ({
  onSelectedItemChange,
  text,
  description,
  componentOnly,
}) => {
  const client = useApolloClient()
  const[loading, setLoading] = useState(false)
  const [state, setState] = useState<any>({
    selectedItem: null,
    quantitySelected: 1,
    unitMultiplier: 1,
  })

  const { selectedItem } = state
  const onSelect = async (product: any) => {
    setLoading(true)
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

      const productAvailability = async (params: any) => {
        const skuID = JSON.parse(params)
        fetch(`/api/catalog_system/pub/products/search?fq=skuId:${skuID}&sc=3`)
          .then(res => {
            if (res.ok) {
              return res.json()
            } else {
              throw new Error('Error in response')
            }
          })
          .then(quantity => {
            const availability = quantity[0].items[0].sellers.find((seller: any) => {
              return seller.sellerId === "uselectricalcd01"
            }).commertialOffer.AvailableQuantity

            product[0].quantity = availability
          })
      }

      productAvailability(product[0].value)
      console.log(`Quantity Change: ${product[0]}`)

      const productPrice = async (productId: any) => {
        try {
          const sessionResponse = await getSession();
          const userInfo = sessionResponse?.response?.namespaces?.profile?.email?.value;

          const userEmailResponse = await client.query({
            query: GET_ORGANIZATIONS_BY_EMAIL,
            variables: { email: userInfo },
          });

          const userOrganizationId = userEmailResponse.data.getOrganizationsByEmail[0].costId;

          const postData = {
            customerId: userOrganizationId,
            branchId: "",
            productId: productId,
            orderQty: 1,
            shouldHidePrice: "false",
          };

          const response = await fetch('/v0/customerPrice', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(postData),
          });

          const data = await response.json();
          const formattedPrice = parseInt(data?.price?.CustomersPrice?.Products[0]?.ListPrice);

          return formattedPrice;
        } catch (error) {
          // Handle errors here
          console.error(error);
          throw error; // Rethrow the error for the calling code to handle if necessary
        }
      };

      const productId = product[0].value

      productPrice(productId)
        .then((price) => {
          product[0].price = price
          onSelectedItemChange(product[0])
        })
        .catch((error) => {
          console.error(`Error fetching product price: ${error}`);
        })

      setState({
        ...state,
        selectedItem: product?.length
          ? { ...product[0], value: selectedSku, seller, data }
          : null,
        unitMultiplier: multiplier,
        quantitySelected: multiplier,
      })
    }


    setLoading(false)
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
            {!selectedItem && !loading && <QuickOrderAutocomplete onSelect={onSelect} />}
            {loading && <Spinner color="black" />}
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
