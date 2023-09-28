/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable vtex/prefer-early-return */
import type { FunctionComponent } from 'react'
import React, { useState, useEffect, useContext, useCallback } from 'react'
import {
  Table,
  Input,
  ButtonWithIcon,
  IconDelete,
  IconInfo,
  Tooltip,
  Dropdown,
  ToastContext,
} from 'vtex.styleguide'
import type { MessageDescriptor, WrappedComponentProps } from 'react-intl'
import { injectIntl } from 'react-intl'
import PropTypes from 'prop-types'
import { useApolloClient, useQuery } from 'react-apollo'

import { reviewMessages as messages } from '../utils/messages'
import { ParseText, GetText } from '../utils'
import getRefIdTranslation from '../queries/refids.gql'
import OrderFormQuery from '../queries/orderForm.gql'
import autocomplete from '../queries/autocomplete.gql'

const remove = <IconDelete />

let orderFormId = ''

const ReviewBlock: FunctionComponent<WrappedComponentProps & any> = ({
  onReviewItems,
  hiddenColumns,
  reviewedItems,
  onRefidLoading,
  backList,
  intl,
}: any) => {
  const client = useApolloClient()
  const { showToast } = useContext(ToastContext)

  const { data: orderFormData } = useQuery<{
    orderForm: { orderFormId: string }
  }>(OrderFormQuery, {
    ssr: false,
    skip: !!orderFormId,
  })

  const checkRestriction = useCallback(
    async (sku: any) => {
      return client.query({
        query: autocomplete,
        variables: { inputValue: sku },
      })
    },
    [client]
  )

  const setRestriction = useCallback(
    async (data: any) => {
      return Promise.all(
        data.map(async (item: any) => {
          const res: any = await checkRestriction(item.refid)

          const foundSku = res?.data?.productSuggestions?.products[0]?.items.find(
            (suggestedItem: { itemId: any }) =>
              suggestedItem.itemId === item.sku
          )

          return foundSku ? item : null
        })
      )
    },
    [checkRestriction]
  )

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

  if (orderFormData?.orderForm?.orderFormId) {
    orderFormId = orderFormData.orderForm.orderFormId
  }

  const errorMessage = {
    'store/quickorder.valid': messages.valid,
    'store/quickorder.available': messages.available,
    'store/quickorder.invalidPattern': messages.invalidPattern,
    'store/quickorder.skuNotFound': messages.skuNotFound,
    'store/quickorder.partiallyAvailable': messages.partiallyAvailable,
    'store/quickorder.withoutStock': messages.withoutStock,
    'store/quickorder.withoutPriceFulfillment':
      messages.withoutPriceFulfillment,
    'store/quickorder.limited': messages.limited,
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
  } as Record<string, MessageDescriptor>

  const validateRefids = useCallback(
    async (refidData: any, reviewed: any) => {
      let error = false

      // drops sellers without stock from refidData
      refidData?.skuFromRefIds.items.forEach((item: any) => {
        if (!item.sellers) return
        item.sellers = item.sellers.filter(
          (seller: any) =>
            seller.availability === 'available' ||
            seller.availability === 'partiallyAvailable'
        )
      })

      if (refidData) {
        const refIdNotFound = refidData?.skuFromRefIds?.items?.length
          ? refidData.skuFromRefIds.items.filter((item: any) => {
              return item.sku === null
            })
          : []

        const refIdFound = refidData?.skuFromRefIds?.items?.length
          ? refidData.skuFromRefIds.items.filter((item: any) => {
              return item.sku !== null
            })
          : []

        const refNotAvailable = refidData?.skuFromRefIds?.items?.length
          ? refidData.skuFromRefIds.items.filter((item: any) => {
              return !!item.sellers?.length
            })
          : []

        const mappedRefId = {} as Record<string, Record<string, any>>

        if (refidData?.skuFromRefIds?.items) {
          const restrictedData = await setRestriction(
            refidData.skuFromRefIds.items
          ).then((data) =>
            data.filter((item: any) => {
              return item != null
            })
          )

          restrictedData.forEach((item: any) => {
            mappedRefId[item.refid] = item
          })
        }

        const errorMsg = (item: any, sellerWithStock: string) => {
          let ret: any = null

          /* order of precedence for errors
           * 1) Item not found
           * 2) Item availability
           * 3) Item restriction
           */
          const notfound = refIdNotFound.find((curr: any) => {
            return curr.refid === item.sku && curr.sku === null
          })

          const found = refIdFound.find((curr: any) => {
            return curr.refid === item.sku && curr.sku !== null
          })

          let selectedSellerHasPartialStock
          const foundHasStock =
            found?.sellers?.length &&
            found.sellers.filter((seller: any) => {
              if (seller.id === sellerWithStock) {
                selectedSellerHasPartialStock =
                  seller.availability === 'partiallyAvailable'
              }

              return (
                seller.availability &&
                (seller.availability === 'available' ||
                  seller.availability === 'partiallyAvailable')
              )
            }).length

          const itemRestricted = sellerWithStock
            ? null
            : `store/quickorder.limited`

          const partialStockError = selectedSellerHasPartialStock
            ? 'store/quickorder.partiallyAvailable'
            : null

          const availabilityError = foundHasStock
            ? partialStockError
            : `store/quickorder.withoutStock`

          ret = notfound
            ? 'store/quickorder.skuNotFound'
            : availabilityError ?? itemRestricted

          return ret
        }

        if (refIdNotFound.length || refNotAvailable.length) {
          error = true
        }

        const items = reviewed.map((item: any) => {
          const sellerWithStock = item.seller
            ? item.seller
            : item.sku && mappedRefId[item.sku]?.sellers?.length
            ? mappedRefId[item.sku]?.sellers.find(
                (seller: any) =>
                  seller.availability === 'available' ||
                  seller.availability === 'partiallyAvailable'
              )?.id ?? ''
            : ''

          const sellerUnitMultiplier =
            item.sku && mappedRefId[item.sku]?.sellers?.length
              ? mappedRefId[item.sku]?.sellers.find(
                  (seller: any) => seller.id === sellerWithStock
                )?.unitMultiplier ?? '1'
              : '1'

          const sellerAvailableQuantity =
            item.sku && mappedRefId[item.sku]?.sellers?.length
              ? mappedRefId[item.sku]?.sellers.find(
                  (seller: any) => seller.id === sellerWithStock
                )?.availableQuantity
              : null

          return {
            ...item,
            sellers: item.sku ? mappedRefId[item.sku]?.sellers : [],
            seller: sellerWithStock,
            vtexSku: item.sku ? mappedRefId[item.sku]?.sku : '1',
            unitMultiplier: sellerUnitMultiplier,
            totalQuantity: sellerUnitMultiplier
              ? sellerUnitMultiplier * item.quantity
              : '',
            availableQuantity: sellerAvailableQuantity ?? item.quantity,
            error: errorMsg(item, sellerWithStock),
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
        if (JSON.stringify(reviewItems) !== JSON.stringify(updated)) {
          setReviewState({
            ...state,
            reviewItems: updated,
            hasError: error,
          })
        }
      }
    },
    [onReviewItems, reviewItems, setRestriction, state]
  )

  const getRefIds = useCallback(
    async (_refids: any, reviewed: any, refIdSellerMap: any) => {
      onRefidLoading(true)
      const refids = _refids.length ? Array.from(new Set(_refids)) : []

      const refIdQuantityMap = reviewed.reduce(
        (prev: any, item: { sku: any; quantity: any }) => {
          return {
            ...prev,
            [item.sku]: item.quantity,
          }
        },
        {}
      )

      const query = {
        query: getRefIdTranslation,
        variables: { refids, orderFormId, refIdSellerMap, refIdQuantityMap },
      }

      try {
        const { data } = await client.query(query)

        await validateRefids(data, reviewed)
        onRefidLoading(false)
      } catch (err) {
        showToast({
          message: intl.formatMessage(messages.cannotGetSkuInfo),
        })
        backList()
      }
    },
    [backList, client, intl, onRefidLoading, showToast, validateRefids]
  )

  const convertRefIds = useCallback(
    (items: any) => {
      const refIdSellerMap = {} as Record<string, unknown>
      const refids = items
        .filter((item: any) => {
          return item.error === null
        })
        .map((item: any) => {
          refIdSellerMap[item.sku] = ['1']

          return item.sku
        })

      getRefIds(refids, items, refIdSellerMap)
    },
    [getRefIds]
  )

  const checkValidatedItems = useCallback(() => {
    const items: [any] = reviewItems.filter((item: any) => {
      return item.sku !== null && item.error === null && !item.vtexSku
    })

    if (items.length) {
      convertRefIds(items)
    }
  }, [convertRefIds, reviewItems])

  useEffect(() => {
    checkValidatedItems()
  }, [checkValidatedItems, reviewItems])

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

  const updateLineSeller = (index: number, seller: string) => {
    const refIdSellerMap = {} as Record<string, unknown>
    const items = reviewItems.map((item: any) => {
      return item.index === index
        ? {
            ...item,
            seller,
          }
        : item
    })

    const refids = items.map((item: any) => {
      refIdSellerMap[item.sku] = [item.seller]

      return item.sku
    })

    getRefIds(refids, items, refIdSellerMap)
  }

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

  const tableSchema: {
    properties: any
  } = {
    properties: {},
  }

  const createSchema = (columnsToBeHidden: string[]) => {
    if (columnsToBeHidden.indexOf('line') === -1) {
      tableSchema.properties.line = {
        type: 'object',
        title: intl.formatMessage({
          id: 'store/quickorder.review.label.lineNumber',
        }),
        width: 50,
        // eslint-disable-next-line react/display-name
        cellRenderer: ({ rowData }: any) => {
          return <div>{parseInt(rowData.line, 10) + 1}</div>
        },
      }
    }

    if (columnsToBeHidden.indexOf('content') === -1) {
      tableSchema.properties.content = {
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
      }
    }

    if (columnsToBeHidden.indexOf('sku') === -1) {
      tableSchema.properties.sku = {
        type: 'string',
        title: intl.formatMessage({ id: 'store/quickorder.review.label.sku' }),
        width: 125,
      }
    }

    if (columnsToBeHidden.indexOf('quantity') === -1) {
      tableSchema.properties.quantity = {
        type: 'string',
        title: intl.formatMessage({
          id: 'store/quickorder.review.label.quantity',
        }),
        width: 75,
      }
    }

    if (columnsToBeHidden.indexOf('unitMultiplier') === -1) {
      tableSchema.properties.unitMultiplier = {
        type: 'float',
        title: intl.formatMessage({
          id: 'store/quickorder.review.label.multiplier',
        }),
        width: 100,
      }
    }

    if (columnsToBeHidden.indexOf('totalQuantity') === -1) {
      tableSchema.properties.totalQuantity = {
        type: 'float',
        title: intl.formatMessage({
          id: 'store/quickorder.review.label.totalQuantity',
        }),
        width: 100,
      }
    }

    if (columnsToBeHidden.indexOf('seller') === -1) {
      tableSchema.properties.seller = {
        type: 'string',
        title: intl.formatMessage({
          id: 'store/quickorder.review.label.seller',
        }),
        cellRenderer: ({ rowData }: any) => {
          if (rowData?.sellers?.length > 1) {
            return (
              <div>
                <Dropdown
                  options={rowData.sellers.map((item: any) => {
                    return {
                      label: item.name,
                      value: item.id,
                    }
                  })}
                  value={rowData.seller}
                  onChange={(_: any, v: any) => {
                    updateLineSeller(rowData.index, v)
                  }}
                />
              </div>
            )
          }

          return rowData?.sellers?.length ? rowData.sellers[0].name : ''
        },
      }
    }

    if (columnsToBeHidden.indexOf('error') === -1) {
      tableSchema.properties.error = {
        type: 'string',
        title: intl.formatMessage({
          id: 'store/quickorder.review.label.status',
        }),
        width: 75,
        cellRenderer: ({
          cellData,
          rowData,
        }: {
          cellData: string
          rowData: any
        }) => {
          if (rowData.error) {
            const errMsg = errorMessage[cellData || 'store/quickorder.valid']
            const text =
              errMsg === messages.partiallyAvailable
                ? intl.formatMessage(errMsg, {
                    quantity: rowData.availableQuantity,
                    totalQuantity:
                      rowData.availableQuantity * rowData.unitMultiplier,
                  })
                : intl.formatMessage(errMsg)

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
      }
    }

    if (columnsToBeHidden.indexOf('delete') === -1) {
      tableSchema.properties.delete = {
        type: 'object',
        title: ' ',
        width: 75,
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
      }
    }
  }

  createSchema(hiddenColumns)

  return (
    <div>
      <Table
        schema={tableSchema}
        items={reviewItems}
        emptyStateLabel={intl.formatMessage({
          id: 'store/quickorder.review.label.emptyState',
        })}
        fullWidth
      />
    </div>
  )
}

ReviewBlock.propTypes = {
  onReviewItems: PropTypes.func,
  reviewItems: PropTypes.array,
  hiddenColumns: PropTypes.array,
  onRefidLoading: PropTypes.func,
}

export default injectIntl(ReviewBlock)
