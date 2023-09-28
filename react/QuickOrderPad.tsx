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
    newSelectedItem: { thumb: string; label: string }
  ) => {
    const tableInfo = [...tableData] // Create a copy of the original array
    const { rowData } = rowIndex
    const rowId = rowData.id - 1

    tableInfo[rowId].thumb = newSelectedItem.thumb
    tableInfo[rowId].label = newSelectedItem.label
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
            <div className="w-two-thirds-l w-100-ns fl-l">
              <div
                className={`flex flex-column w-10 fl ${handles.productThumb}`}
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
                className={`flex flex-column w-90 fl ${handles.productLabel}`}
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
      },
    },
  }

  return (
    <>
      <div className={`${handles.headerActions}`}>
        <span>
          Quickly place an order using either the Quick Order Pad or Copy &
          Paste Pad.
        </span>
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
