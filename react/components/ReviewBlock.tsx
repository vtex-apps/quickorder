/* eslint-disable vtex/prefer-early-return */
import React, { useEffect, useState } from 'react'
import {
  ButtonWithIcon,
  IconDelete,
  IconInfo,
  Input,
  Table,
  Tooltip,
} from 'vtex.styleguide'
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl'
import PropTypes from 'prop-types'
import { useApolloClient, useQuery } from 'react-apollo'

import { GetText, ParseText, validateQuantity } from '../utils'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// import getRefIdTranslation from '../queries/refids.gql'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// import OrderFormQuery from '../queries/orderForm.gql'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import GET_PRODUCT_DATA from '../queries/getPrductAvailability.graphql'
// import { stubFalse } from 'lodash'
import GET_ACCOUNT_INFO from '../queries/orderSoldToAccount.graphql'

const remove = <IconDelete />

const messages = defineMessages({
  valid: {
    id: 'store/quickorder.valid',
  },
  available: {
    id: 'store/quickorder.available',
  },
  unavailable: {
    id: 'store/quickorder.unavailable',
  },
  invalidPattern: {
    id: 'store/quickorder.invalidPattern',
  },
  withoutStock: {
    id: 'store/quickorder.withoutStock',
  },
  skuNotFound: {
    id: 'store/quickorder.skuNotFound',
  },
  withoutPriceFulfillment: {
    id: 'store/quickorder.withoutPriceFulfillment',
  },
  cannotBeDelivered: {
    id: 'store/quickorder.cannotBeDelivered',
  },
  ORD002: {
    id: 'store/quickorder.ORD002',
  },
  ORD003: {
    id: 'store/quickorder.ORD003',
  },
  ORD004: {
    id: 'store/quickorder.ORD004',
  },
  ORD005: {
    id: 'store/quickorder.ORD005',
  },
  ORD006: {
    id: 'store/quickorder.ORD006',
  },
  ORD007: {
    id: 'store/quickorder.ORD007',
  },
  ORD008: {
    id: 'store/quickorder.ORD008',
  },
  ORD009: {
    id: 'store/quickorder.ORD009',
  },
  ORD011: {
    id: 'store/quickorder.ORD011',
  },
  ORD012: {
    id: 'store/quickorder.ORD012',
  },
  ORD013: {
    id: 'store/quickorder.ORD013',
  },
  ORD014: {
    id: 'store/quickorder.ORD014',
  },
  ORD015: {
    id: 'store/quickorder.ORD015',
  },
  ORD016: {
    id: 'store/quickorder.ORD016',
  },
  ORD017: {
    id: 'store/quickorder.ORD017',
  },
  ORD019: {
    id: 'store/quickorder.ORD019',
  },
  ORD020: {
    id: 'store/quickorder.ORD020',
  },
  ORD021: {
    id: 'store/quickorder.ORD021',
  },
  ORD022: {
    id: 'store/quickorder.ORD022',
  },
  ORD023: {
    id: 'store/quickorder.ORD023',
  },
  ORD024: {
    id: 'store/quickorder.ORD024',
  },
  ORD025: {
    id: 'store/quickorder.ORD025',
  },
  ORD026: {
    id: 'store/quickorder.ORD026',
  },
  ORD027: {
    id: 'store/quickorder.ORD027',
  },
  ORD028: {
    id: 'store/quickorder.ORD028',
  },
  ORD029: {
    id: 'store/quickorder.ORD029',
  },
  ORD030: {
    id: 'store/quickorder.ORD030',
  },
  ORD031: {
    id: 'store/quickorder.ORD031',
  },
})

// let orderFormId = ''

const ReviewBlock: StorefrontFunctionComponent<WrappedComponentProps & any> = ({
  onReviewItems,
  reviewedItems,
  onRefidLoading,
  intl,
}: any) => {
  const client = useApolloClient()

  // const { data: orderFormData } = useQuery<{
  //   orderForm
  // }>(OrderFormQuery, {
  //   ssr: false,
  //   skip: !!orderFormId,
  // })

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

  const [state, setReviewState] = useState<any>({
    reviewItems:
      reviewedItems.map((item: any, index: number) => {
        return {
          ...item,
          index,
        }
      }) || [],
  })

  const { reviewItems } = state

  // if (orderFormData?.orderForm?.orderFormId) {
  //   orderFormId = orderFormData.orderForm.orderFormId
  // }

  const errorMessage = {
    'store/quickorder.valid': messages.valid,
    'store/quickorder.available': messages.available,
    'store/quickorder.unavailable': messages.unavailable,
    'store/quickorder.invalidPattern': messages.invalidPattern,
    'store/quickorder.skuNotFound': messages.skuNotFound,
    'store/quickorder.withoutStock': messages.withoutStock,
    'store/quickorder.withoutPriceFulfillment':
      messages.withoutPriceFulfillment,
    'store/quickorder.cannotBeDelivered': messages.cannotBeDelivered,
    'store/quickorder.ORD002': messages.ORD002,
    'store/quickorder.ORD003': messages.ORD003,
    'store/quickorder.ORD004': messages.ORD004,
    'store/quickorder.ORD005': messages.ORD005,
    'store/quickorder.ORD006': messages.ORD006,
    'store/quickorder.ORD007': messages.ORD007,
    'store/quickorder.ORD008': messages.ORD008,
    'store/quickorder.ORD009': messages.ORD009,
    'store/quickorder.ORD011': messages.ORD011,
    'store/quickorder.ORD012': messages.ORD012,
    'store/quickorder.ORD013': messages.ORD013,
    'store/quickorder.ORD014': messages.ORD014,
    'store/quickorder.ORD015': messages.ORD015,
    'store/quickorder.ORD016': messages.ORD016,
    'store/quickorder.ORD017': messages.ORD017,
    'store/quickorder.ORD019': messages.ORD019,
    'store/quickorder.ORD020': messages.ORD020,
    'store/quickorder.ORD021': messages.ORD021,
    'store/quickorder.ORD022': messages.ORD022,
    'store/quickorder.ORD023': messages.ORD023,
    'store/quickorder.ORD024': messages.ORD024,
    'store/quickorder.ORD025': messages.ORD025,
    'store/quickorder.ORD026': messages.ORD026,
    'store/quickorder.ORD027': messages.ORD027,
    'store/quickorder.ORD028': messages.ORD028,
    'store/quickorder.ORD029': messages.ORD029,
    'store/quickorder.ORD030': messages.ORD030,
    'store/quickorder.ORD031': messages.ORD031,
  }

  const validateRefids = (refidData: any, reviewed: any) => {
    let error = false

    reviewed = reviewed.map(i => {
      const unit = refidData.getSkuAvailability?.items?.find(
        d => i.sku === d.refid
      )?.unitMultiplier
      const minQty = refidData.getSkuAvailability?.items?.find(
        d => i.sku === d.refid
      )?.minQty
      i.quantity = validateQuantity(minQty, unit, i.quantity)
      return {
        ...i,
        unit,
        minQty,
      }
    })

    if (refidData) {
      const itemsFromQuery = refidData.getSkuAvailability?.items ?? []
      const refIdNotFound = itemsFromQuery.filter((item: any) => {
        return item.sku === null
      })

      const refIdFound = itemsFromQuery.filter((item: any) => {
        return item.sku !== null
      })

      const refNotAvailable = itemsFromQuery.filter((item: any) => {
        return item.availability !== 'available'
      })

      const vtexSku = (item: any) => {
        const ret: any = itemsFromQuery.find((curr: any) => {
          return !!item.sku && item.sku === curr.refid
        })

        return ret?.sku
      }

      const getPrice = (item: any) => {
        const ret: any = itemsFromQuery.find((curr: any) => {
          return !!item.sku && item.sku === curr.refid
        })

        return ret?.price
      }

      const getAvailableQuantity = (item: any) => {
        const ret: any = itemsFromQuery.find((curr: any) => {
          return !!item.sku && item.sku === curr.refid
        })

        return ret?.availableQuantity
      }

      const getAvailability = (item: any) => {
        const ret: any = itemsFromQuery.find((curr: any) => {
          return !!item.sku && item.sku === curr.refid
        })

        return ret?.availability
      }

      const getSeller = (item: any) => {
        const ret: any = itemsFromQuery.find((curr: any) => {
          return !!item.sku && item.sku === curr.refid
        })

        return ret?.seller
      }

      // const getSellers = (item: any) => {
      //   let ret: any = []
      //
      //   if (!!refidData && !!refidData.getSkuAvailability.items) {
      //     ret = refidData.getSkuAvailability.items.find((curr: any) => {
      //       return !!item.sku && item.sku === curr.refid
      //     })
      //     if (!!ret && !!ret.sellers) {
      //       ret = ret.sellers
      //     }
      //   }
      //
      //   return ret
      // }

      const errorMsg = (item: any) => {
        let ret: any = null
        const notfound = refIdNotFound.find((curr: any) => {
          return curr.refid === item.sku && curr.sku === null
        })

        const found = refIdFound.find((curr: any) => {
          return curr.refid === item.sku && curr.sku !== null
        })

        ret = notfound
          ? 'store/quickorder.skuNotFound'
          : found?.availability && found.availability !== 'available'
          ? `store/quickorder.${found.availability}`
          : null

        return ret
      }

      if (refIdNotFound.length || refNotAvailable.length) {
        error = true
      }

      const items = reviewed.map((item: any) => {
        // const sellers = getSellers(item)

        return {
          ...item,
          availableQuantity: getAvailableQuantity(item),
          price: getPrice(item),
          vtexSku: vtexSku(item),
          error: errorMsg(item),
          availability: getAvailability(item),
          seller: getSeller(item)?.id,
        }
      })

      const merge = (original: any) => {
        const item = items.find((curr: any) => {
          return original.sku === curr.sku
        })

        return item || original
      }

      const updated = reviewItems.map((item: any) => {
        return merge(item)
      })

      onReviewItems(updated)
      setReviewState({
        ...state,
        reviewItems: updated,
        hasError: error,
      })
    }
  }

  const getRefIds = async (_refids: any, reviewed: any) => {
    onRefidLoading(true)
    let refids = {}

    if (_refids.length) {
      _refids.forEach(refid => {
        refids[refid] = true
      })
      refids = Object.getOwnPropertyNames(refids)
    }

    try {
      const { data } = await client.query({
        query: GET_PRODUCT_DATA,
        variables: {
          refIds: refids as string[],
          customerNumber,
          targetSystem,
          salesOrganizationCode,
        },
      })

      validateRefids(data, reviewed)
    } catch (error) {
      console.error(error)
    }

    onRefidLoading(false)
  }

  const convertRefIds = (items: any) => {
    const refids = items
      .filter((item: any) => {
        return item.error === null
      })
      .map((item: any) => {
        return item.sku
      })

    getRefIds(refids, items)
  }

  const checkValidatedItems = () => {
    const items: [any] = reviewItems.filter((item: any) => {
      return item.sku !== null && item.error === null && !item.vtexSku
    })

    if (items.length) {
      convertRefIds(items)
    }
  }

  useEffect(() => {
    checkValidatedItems()
  })

  const removeLine = (i: number) => {
    const items: [any] = reviewItems
      .filter((item: any) => {
        return item.index !== i
      })
      .map((item: any, index: number) => {
        return {
          ...item,
          line: index,
          index,
        }
      })

    onReviewItems(items)
    setReviewState({
      ...state,
      reviewItems: items,
    })
  }

  const updateLineContent = (index: number, content: string) => {
    const items = reviewItems.map((item: any) => {
      return item.index === index
        ? {
            ...item,
            content,
          }
        : item
    })

    setReviewState({
      ...state,
      reviewItems: items,
    })
  }

  // const updateLineSeller = (index: number, seller: string) => {
  //   const items = reviewItems.map((item: any) => {
  //     return item.index === index
  //       ? {
  //           ...item,
  //           seller,
  //         }
  //       : item
  //   })
  //
  //   setReviewState({
  //     ...state,
  //     reviewItems: items,
  //   })
  // }

  const onBlurField = (line: number) => {
    const joinLines = GetText(reviewItems)
    const reviewd: any = ParseText(joinLines)

    if (reviewd[line].error === null) {
      setReviewState({
        ...state,
        reviewItems: reviewd,
      })
    }
  }

  const tableSchema = {
    properties: {
      line: {
        type: 'object',
        title: intl.formatMessage({
          id: 'store/quickorder.review.label.lineNumber',
        }),
        // eslint-disable-next-line react/display-name
        cellRenderer: ({ rowData }: any) => {
          return <div>{parseInt(rowData.line, 10) + 1}</div>
        },
      },
      content: {
        type: 'object',
        title: intl.formatMessage({
          id: 'store/quickorder.review.label.content',
        }),
        // eslint-disable-next-line react/display-name
        cellRenderer: ({ cellData, rowData }: any) => {
          if (rowData.error) {
            return (
              <div>
                <Input
                  value={cellData}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    updateLineContent(rowData.index, e.target.value)
                  }}
                  onBlur={() => {
                    onBlurField(rowData.line)
                  }}
                />
              </div>
            )
          }

          return <span>{cellData}</span>
        },
      },
      sku: {
        type: 'string',
        title: intl.formatMessage({ id: 'store/quickorder.review.label.sku' }),
      },
      quantity: {
        type: 'string',
        title: intl.formatMessage({
          id: 'store/quickorder.review.label.quantity',
        }),
      },
      unit: {
        hidden: true,
        type: 'string',
        title: 'Unit',
      },
      // price: {
      //   type: 'string',
      //   title: 'Price',
      // },
      // availableQuantity: {
      //   type: 'string',
      //   title: 'Available Quantity',
      // },
      // seller: {
      //   type: 'string',
      //   title: intl.formatMessage({
      //     id: 'store/quickorder.review.label.seller',
      //   }),
      //   cellRenderer: ({ rowData }: any) => {
      //     if (rowData?.sellers?.length > 1) {
      //       return (
      //         <div className="mb5">
      //           <Dropdown
      //             label="Regular"
      //             options={rowData.sellers.map((item: any) => {
      //               return {
      //                 label: item.name,
      //                 value: item.id,
      //               }
      //             })}
      //             value={rowData.seller}
      //             onChange={(_: any, v: any) =>
      //               updateLineSeller(rowData.index, v)
      //             }
      //           />
      //         </div>
      //       )
      //     }
      //
      //     return rowData.sellers && rowData.sellers.length
      //       ? rowData.sellers[0].name
      //       : ''
      //   },
      // },
      error: {
        type: 'string',
        title: intl.formatMessage({
          id: 'store/quickorder.review.label.status',
        }),

        cellRenderer: ({ cellData, rowData }: any) => {
          if (rowData.error) {
            const text = intl.formatMessage(
              errorMessage[
                cellData !== null && cellData !== void 0
                  ? cellData
                  : 'store/quickorder.valid'
                ]
            )

            return (
              <span className="pa3 br2 dib mr5 mv0">
                <Tooltip label={text}>
                  <span className="c-danger pointer">
                    <IconInfo />
                  </span>
                </Tooltip>
              </span>
            )
          }

          return intl.formatMessage({ id: 'store/quickorder.valid' })
        },
      },
      delete: {
        type: 'object',
        title: ' ',
        // eslint-disable-next-line react/display-name
        cellRenderer: ({ rowData }: any) => {
          return (
            <div>
              <ButtonWithIcon
                icon={remove}
                variation="tertiary"
                onClick={() => {
                  removeLine(rowData.index)
                }}
              />
            </div>
          )
        },
      },
    },
  }

  return accountDataLoading ? (
    <div />
  ) : (
    <div>
      <Table schema={tableSchema} items={reviewItems} fullWidth />
    </div>
  )
}

ReviewBlock.propTypes = {
  onReviewItems: PropTypes.func,
  reviewItems: PropTypes.array,
  onRefidLoading: PropTypes.func,
}

export default injectIntl(ReviewBlock)
