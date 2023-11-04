import React, { useEffect, useState } from 'react'
import { Table, NumericStepper, Spinner } from 'vtex.styleguide'
import { useCssHandles } from 'vtex.css-handles'
import { useMutation } from 'react-apollo'
import { OrderForm } from 'vtex.order-manager'
import type { OrderForm as OrderFormType } from 'vtex.checkout-graphql'
import { addToCart as ADD_TO_CART } from 'vtex.checkout-resources/Mutations'

import AutocompleteBlock from './AutocompleteBlock'
import AddMoreLinesButton from './AddMoreLinesButton'
import ClearAllLink from './ClearAllLink'
import AddAllToCart from './AddAllToCart'
import './global.css'

interface ItemType {
  id: number
  quantity: number
  seller: string
  skuId: string
}

const QuickOrderPad = () => {
  const CSS_HANDLES = [
    'centerDiv',
    'productThumb',
    'productLabel',
    'productTitle',
    'tableActions',
    'tableWrapper',
    'headerActions',
    'productContainer',
    'priceContainer',
    'productPrice',
    'productQuantity',
    'closeIcon'
  ] as const

  const handles = useCssHandles(CSS_HANDLES)


  const [
    addToCart,
    { error: mutationError },
  ] = useMutation<{ addToCart: OrderFormType }, { items: any }>(ADD_TO_CART)

  const [selectedItem, setSelectedItem] = useState<any | null>(null)
  const [tableData, setTableData] = useState([
    { id: 1, quantity: 1, thumb: '', price: '', label: '', seller: '', skuId: '', stock: 0 }
  ])
  const [loading, setLoading] = useState(false)
  const { setOrderForm }: OrderFormContext = OrderForm.useOrderForm()
  const orderForm = OrderForm.useOrderForm()

  useEffect(() => {
    console.info('autocompleteState changed:', selectedItem)
  }, [selectedItem])


  const handleSelectedItemChange = (
    rowIndex: { rowData: any },
    newSelectedItem: { thumb: string, label: string, price: number, seller: string, value: string, quantity: 0 }
  ) => {
    setLoading(true)
    const tableInfo = [...tableData]
    if (tableInfo.length === 0) {
      return
    }
    const { rowData } = rowIndex
    const rowId = rowData.id - 1

    const USDollar = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    });

    const sellerId = newSelectedItem.seller

    tableInfo[rowId].thumb = newSelectedItem.thumb
    tableInfo[rowId].label = newSelectedItem.label
    tableInfo[rowId].price = USDollar.format(newSelectedItem.price)
    tableInfo[rowId].seller = sellerId
    tableInfo[rowId].skuId = newSelectedItem.value
    tableData[rowId].stock = newSelectedItem.quantity
    setSelectedItem(newSelectedItem)
    setLoading(false)
  }

  const handleQuantityChange = (
    rowIndex: { rowData: any },
    newValue: number
  ) => {
    const updatedTableData = [...tableData];
    const { rowData } = rowIndex;
    const rowId = rowData.id - 1;

    updatedTableData[rowId].quantity = newValue;

    console.info(updatedTableData);
    setTableData(updatedTableData);
  };

  const addRow = () => {
    const highestId =
      tableData.length > 0 ? tableData[tableData.length - 1].id || 0 : 0

    const newId = highestId + 1
    const newItem = { id: newId, quantity: 1, thumb: '', price: '', label: '', seller: '', skuId: '', stock: 0 }

    setTableData([...tableData, newItem])
  }

  const removeItems = () => {
    setTableData([])
  }

  const removeRow = (rowData: { id: number }) => {
    const { id } = rowData;
    const updatedTableData = tableData.filter(item => item.id !== id);

    const updatedTableDataWithNewIds = updatedTableData.map((item, index) => {
      return {
        ...item,
        id: index + 1,
      };
    });

    setTableData(updatedTableDataWithNewIds);
  };

  const handleAddAllToCart = async () => {
    const currentItemsInCart = orderForm.orderForm.items

    const mutationResult = await addToCart({
      variables: {
        items: tableData.map((item: ItemType) => {
          const [existsInCurrentOrder] = currentItemsInCart.filter(
            (el: any) => el.id === item.skuId
          )

          let updatedQuantity = item.quantity

          if (existsInCurrentOrder) {
            updatedQuantity += parseInt(existsInCurrentOrder.quantity, 10)
          }

          const skuId = parseInt(item.skuId)

          return {
            id: skuId,
            quantity: updatedQuantity,
            seller: item.seller
          }
        }),
      },
    })

    if (mutationError) {
      console.error(mutationError)
      console.log({ success: false, isNewItem: false })

      return
    }

    // Update OrderForm from the context
    mutationResult.data && setOrderForm(mutationResult.data.addToCart)


    if (
      mutationResult.data?.addToCart?.messages?.generalMessages &&
      mutationResult.data.addToCart.messages.generalMessages.length
    ) {
      mutationResult.data.addToCart.messages.generalMessages.forEach(
        (msg: any) => {
          return console.log({
            message: msg.text,
            action: undefined,
            duration: 30000,
          })
        }
      )
    } else {
      console.log({ success: true, isNewItem: true })
    }

  }

  const schema = {
    properties: {
      id: {
        title: 'Part Number/Keyword',
        cellRenderer: (rowIndex: any) => {
          const tableRow = tableData[rowIndex.rowData.id - 1];
          return (
            <div>
              {!tableRow?.skuId ? (
                <AutocompleteBlock
                  onSelectedItemChange={(event: any) =>
                    handleSelectedItemChange(rowIndex, event)
                  }
                  componentOnly="false"
                />) : tableRow?.skuId}
            </div>
          )
        },
      },
      quantity: {
        title: 'Quantity',
        cellRenderer: (rowIndex: { rowData: { id: number } }) => {
          const tableRow = tableData[rowIndex.rowData.id - 1];
          return (
            <div className={handles.centerDiv}>
              {loading && <Spinner color="black" />}
              {tableRow?.thumb && (
                <NumericStepper
                  size="small"
                  value={tableRow?.quantity}
                  onChange={(event: any) =>
                    handleQuantityChange(rowIndex, event.value)
                  }
                />
              )}
            </div>
          );
        },
      },
      product: {
        title: 'Product',
        cellRenderer: (rowIndex: { rowData: { id: number } }) => {
          const tableRow = tableData[rowIndex.rowData.id - 1];
          return (
            <div className={`${handles.productContainer} w-two-thirds-l w-100-ns fl-l`}>
              {loading && <Spinner color="black" />}
              <div
                className={`flex fl ${handles.productThumb}`}
              >
                {tableRow?.thumb && (
                  <img
                    src={tableRow?.thumb}
                    width="50"
                    height="50"
                    alt=""
                  />
                )}
              </div>
              <div
                className={`flex  fl ${handles.productLabel}`}
              >
                <span className={`${handles.productTitle}`}>
                  {tableRow?.label ?? ''}
                </span>
              </div>
            </div>
          )
        },
      },
      price: {
        title: 'Price',
        cellRenderer: (rowIndex: { rowData: { id: number } }) => {
          const tableRow = tableData[rowIndex.rowData.id - 1];
          return (
            <div>
              {loading && <Spinner color="black" />}
              {tableRow?.price && (
                <div className={`${handles.priceContainer}`}>
                  <p className={`${handles.productPrice}`}>
                    {tableRow?.price}
                    <span>/each</span>
                  </p>
                  <p className={`${handles.productQuantity}`}>
                    {tableRow?.stock == 0  || tableRow?.stock == undefined ? '' : tableRow?.stock}
                    {tableRow?.stock == 0 || tableRow?.stock == undefined ? 'Backorder Available' : 'Available'}
                  </p>
                </div>
              )}
            </div>
          )
        }
      },
      close: {
        title: ' ',
        cellRenderer: (rowIndex: { rowData: { id: number } }) => {
          const handleDeleteClick = () => {
            const { id } = rowIndex.rowData;
            removeRow({ id });
          }

          const tableRow = tableData[rowIndex.rowData.id - 1];

          return (
            <div>
              {tableRow?.price && (
                <span className={`${handles.closeIcon}`} onClick={handleDeleteClick}>X</span>
              )}
            </div>
          );
        }
      }
    },
  }

  return (
    <>
      <span>
        Quickly place an order using either the Quick Order Pad or Copy &
        Paste Pad.
      </span>
      <div className={`${handles.headerActions}`}>
        <ClearAllLink removeItems={removeItems} />
        <AddAllToCart isLoading={false} onClick={() => { handleAddAllToCart() }} />
      </div>
      <Table dynamicRowHeight="true" fullWidth items={tableData} schema={schema} density="low" />
      <div className={`${handles.tableActions}`}>
        <AddMoreLinesButton addRow={addRow} />
        <ClearAllLink removeItems={removeItems} />
        <AddAllToCart isLoading={false} onClick={() => { handleAddAllToCart() }} />
      </div>
    </>
  )
}

interface OrderFormContext {
  loading: boolean
  orderForm: OrderFormType | undefined
  setOrderForm: (orderForm: Partial<OrderFormType>) => void
}

export default QuickOrderPad
