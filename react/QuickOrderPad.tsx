import React from 'react';
import { useState, useEffect } from 'react';
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

  const [autocompleteState, setSelectedItem] = useState<any | null>(null);
  const handleSelectedItemChange = (newSelectedItem) => {
    setSelectedItem(newSelectedItem);
  };

  useEffect(() => {
    console.log('autocompleteState changed:', autocompleteState);
  }, [autocompleteState]);

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
              <AutocompleteBlock
                onSelectedItemChange={handleSelectedItemChange}
                componentOnly='false'>
              </AutocompleteBlock>
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
                {autocompleteState?.thumb && (
                  <img src={autocompleteState?.thumb} width="50" height="50" alt="" />
                )}
              </div>
              <div className={`flex flex-column w-90 fl ${handles.productLabel}`}>
                <span className={`${handles.productTitle}`}>
                  {autocompleteState?.label ?? '12123'}
                </span>
              </div>
            </div>
          )

        }
      },
      price: {
        title: 'Price',
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


