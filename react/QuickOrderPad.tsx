import React, { useEffect, useState } from 'react'
import { Table, NumericStepper } from 'vtex.styleguide'
import { useCssHandles } from 'vtex.css-handles'

import AutocompleteBlock from './AutocompleteBlock'
import AddMoreLinesButton from './AddMoreLinesButton'
import AddAllToListButton from './AddAllToListButton'
import ClearAllLink from './ClearAllLink'
import AddAllToCart from './AddAllToCart'
import './global.css'

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
    'productPrice'
  ] as const

  const handles = useCssHandles(CSS_HANDLES)

  const [selectedItem, setSelectedItem] = useState<any | null>(null)

  useEffect(() => {
    console.info('autocompleteState changed:', selectedItem)
  }, [selectedItem])

  const [tableData, setTableData] = useState([
    { id: 1, quantity: 1, thumb: '', price: '', label: '' },
  ])

  const handleSelectedItemChange = (
    rowIndex: { rowData: any },
    newSelectedItem: { thumb: string; label: string, price: number }
  ) => {
    const tableInfo = [...tableData] // Create a copy of the original array
    const { rowData } = rowIndex
    const rowId = rowData.id - 1

    const USDollar = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    });

    tableInfo[rowId].thumb = newSelectedItem.thumb
    tableInfo[rowId].label = newSelectedItem.label
    tableInfo[rowId].price = USDollar.format(newSelectedItem.price)
    setSelectedItem(newSelectedItem)
  }

  const handleQuantityChange = (
    rowIndex: { rowData: any },
    newValue: number
  ) => {
    const updatedTableData = [...tableData] // Create a copy of the original array
    const { rowData } = rowIndex
    const rowId = rowData.id - 1

    updatedTableData[rowId].quantity = newValue

    console.info(updatedTableData)
    setTableData(updatedTableData)
  }

  const addRow = () => {
    const highestId =
      tableData.length > 0 ? tableData[tableData.length - 1].id || 0 : 0

    const newId = highestId + 1
    const newItem = { id: newId, quantity: 1, thumb: '', price: '', label: '' }

    setTableData([...tableData, newItem])
  }

  const removeItems = () => {
    setTableData([])
  }

  const schema = {
    properties: {
      id: {
        title: 'Part Number/Keyword',
        cellRenderer: (rowIndex: any) => {
          return (
            <div>
              <AutocompleteBlock
                onSelectedItemChange={(event: any) =>
                  handleSelectedItemChange(rowIndex, event)
                }
                componentOnly="false"
              />
            </div>
          )
        },
      },
      quantity: {
        title: 'Quantity',
        cellRenderer: (rowIndex: { rowData: { id: number } }) => {
          return (
            <div className={handles.centerDiv}>
              <NumericStepper
                size="small"
                value={tableData[rowIndex.rowData.id - 1].quantity}
                onChange={(event: any) =>
                  handleQuantityChange(rowIndex, event.value)
                }
              />
            </div>
          )
        },
      },
      product: {
        title: 'Product',
        cellRenderer: (rowIndex: { rowData: { id: number } }) => {
          return (
            <div className={`${handles.productContainer} w-two-thirds-l w-100-ns fl-l`}>
              <div
                className={`flex fl ${handles.productThumb}`}
              >
                {tableData[rowIndex.rowData.id - 1]?.thumb && (
                  <img
                    src={tableData[rowIndex.rowData.id - 1]?.thumb}
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
                  {tableData[rowIndex.rowData.id - 1]?.label ?? ''}
                </span>
              </div>
            </div>
          )
        },
      },
      price: {
        title: 'Price',
        cellRenderer: (rowIndex: { rowData: { id: number } }) => {
          return (
            <div>
              {tableData[rowIndex.rowData.id - 1]?.price && (
                <div className={`${handles.priceContainer}`}>
                  <p className={`${handles.productPrice}`}>{tableData[rowIndex.rowData.id - 1]?.price}</p>
                  <span>/each</span>
                </div>
              )}
            </div>
          )
        }
      },
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
        <AddAllToListButton />
        <AddAllToCart />
      </div>
      <Table dynamicRowHeight="true" fullWidth items={tableData} schema={schema} density="low" />
      <div className={`${handles.tableActions}`}>
        <AddMoreLinesButton addRow={addRow} />
        <ClearAllLink removeItems={removeItems} />
        <AddAllToListButton />
        <AddAllToCart />
      </div>
    </>
  )
}

export default QuickOrderPad
