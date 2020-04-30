/* eslint-disable vtex/prefer-early-return */
/* eslint-disable no-console */
import React, { useState, useEffect } from 'react'
import { Table, Input, ButtonWithIcon, IconDelete } from 'vtex.styleguide'
import { WrappedComponentProps, injectIntl } from 'react-intl'
import PropTypes from 'prop-types'
import { ParseText, GetText } from '../utils'
import { useApolloClient } from 'react-apollo'
import getRefIdTranslation from '../queries/refids.gql'

const remove = <IconDelete />

const ReviewBlock: StorefrontFunctionComponent<WrappedComponentProps & any> = ({
  onReviewItems,
  reviewedItems,
  onRefidLoading,
  intl,
}: any) => {
  const client = useApolloClient()

  const [state, setReviewState] = useState<any>({
    reviewItems: reviewedItems || [],
  })
  const { reviewItems } = state

  const translateMessage = (message: MessageDescriptor) => {
    return intl.formatMessage(message)
  }

  const validateRefids = (refidData: any, reviewed: any) => {
    let error = false

    if (refidData) {
      const refIdNotFound =
        !!refidData && !!refidData.skuFromRefIds.itemsReturned
          ? refidData.skuFromRefIds.itemsReturned.filter((item: any) => {
              return item.sku === null
            })
          : []

      const refIdFound =
        !!refidData && !!refidData.skuFromRefIds.itemsReturned
          ? refidData.skuFromRefIds.itemsReturned.filter((item: any) => {
              return item.sku !== null
            })
          : []

      const vtexSku = (item: any) => {
        let ret: any = null
        if (!!refidData && !!refidData.skuFromRefIds.itemsReturned) {
          ret = refidData.skuFromRefIds.itemsReturned.find((curr: any) => {
            return !!item.sku && item.sku === curr.refid
          })
          if (!!ret && !!ret.sku) {
            ret = ret.sku
          } else {
            ret = null
          }
        }
        return ret
      }
      const errorMsg = (item: any) => {
        let ret = null
        const notfound = refIdNotFound.find((curr: any) => {
          return curr.refid === item.sku && curr.sku === null
        })
        const found = refIdFound.find((curr: any) => {
          return curr.refid === item.sku && curr.sku !== null
        })
        ret = notfound
          ? 'store/quickorder.skuNotFound'
          : found
          ? null
          : item.error
        return ret
      }

      if (refIdNotFound.length) {
        error = true
      }

      const items = reviewed.map((item: any) => {
        return {
          ...item,
          vtexSku: vtexSku(item),
          error: errorMsg(item),
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

  const getRefIds = async (refids: any, reviewed: any) => {
    onRefidLoading(true)
    const query = {
      query: getRefIdTranslation,
      variables: { refids },
    }

    const { data } = await client.query(query)

    validateRefids(data, reviewed)
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

  const removeLine = (line: number) => {
    const items: [any] = reviewItems.filter((item: any, pos: number) => {
      ;() => {
        // eslint-disable-next-line no-void
        void item
      }
      return pos !== line
    })

    onReviewItems(items)
    setReviewState({
      ...state,
      reviewItems: items,
    })
  }

  const updateLineContent = (line: number, content: string) => {
    const items = reviewItems
    items[line].content = content
    setReviewState({
      ...state,
      reviewItems: items,
    })
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

  const tableSchema = {
    properties: {
      line: {
        type: 'object',
        title: translateMessage({
          id: 'store/quickorder.review.label.lineNumber',
        }),
        // eslint-disable-next-line react/display-name
        cellRenderer: ({ rowData }: any) => {
          return <div>{parseInt(rowData.line, 0) + 1}</div>
        },
      },
      content: {
        type: 'object',
        title: translateMessage({
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
                    updateLineContent(rowData.line, e.target.value)
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
        title: translateMessage({ id: 'store/quickorder.review.label.sku' }),
      },
      quantity: {
        type: 'string',
        title: translateMessage({
          id: 'store/quickorder.review.label.quantity',
        }),
      },
      error: {
        type: 'string',
        title: translateMessage({ id: 'store/quickorder.review.label.status' }),
        cellRenderer: ({ cellData, rowData }: any) => {
          if (rowData.error) {
            const text = translateMessage({
              id: String(cellData || 'store/quickorder.valid'),
            })
            return (
              <span
                className={`pa3 br2 bg-danger--faded hover-bg-danger-faded active-bg-danger-faded c-danger hover-c-danger active-c-danger dib mr5 mv0 ba b--danger hover-b-danger active-b-danger`}
              >
                {text}
              </span>
            )
          }
          return translateMessage({ id: 'store/quickorder.valid' })
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
                  removeLine(rowData.line)
                }}
              />
            </div>
          )
        },
      },
    },
  }

  return (
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
interface MessageDescriptor {
  id: string
  description?: string | object
  defaultMessage?: string
}
export default injectIntl(ReviewBlock)
