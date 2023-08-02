import React from 'react';
//import { useState, useContext } from 'react';
import { Table, NumericStepper } from 'vtex.styleguide';
import AutocompleteBlock from './AutocompleteBlock';
import { useCssHandles } from 'vtex.css-handles'

const QuickOrderPad = () => {
  const CSS_HANDLES = [
    'centerDiv',
    'productThumb',
    'productLabel',
    'productTitle',
  ] as const

  const handles = useCssHandles(CSS_HANDLES)
  //const { state, setState } = useContext(StateContext);

  const tableData = [
    { id: 1, quantity: 3, product: "Sample Product", price: "45" }
  ];

  const schema = {
    properties: {
      id: {
        title: 'Part Number/Keyword',
        cellRenderer: () => {
          return (
            <div>
              <AutocompleteBlock componentOnly='false'></AutocompleteBlock>
            </div>
          )
        },
      },
      quantity: {
        title: 'Quantity',
        cellRenderer: () => {
          return (
            < div className={handles.centerDiv} >
              <NumericStepper
                size="small"
                values={1}
              //value={state.value}
              //onChange={(event: any) => setState(event.value)}
              />
            </div >
          )
        },
      },
      product: {
        title: 'Product',
        cellRenderer: () => {
          return (
            <div className="w-two-thirds-l w-100-ns fl-l">
              <div className={`flex flex-column w-10 fl ${handles.productThumb}`}>
                <img src="https://usesi.vtexassets.com/arquivos/ids/158831-50-50/image-be47931b95944a1f8185c94c7d0374ef.jpg?v=1777300663" width="50" height="50" alt="" />
              </div>
              <div className={`flex flex-column w-90 fl ${handles.productLabel}`}>
                <span className={`${handles.productTitle}`}>
                  Product Name Test long Product Name
                </span>
              </div>
            </div >
          )

        }
      },
      price: {
        title: 'Price'
      }
    },
  };

  return (
    <div>
      <Table
        fullWidth
        items={tableData}
        schema={schema}
        density="low"
      />
    </div>
  );
};

export default QuickOrderPad;


