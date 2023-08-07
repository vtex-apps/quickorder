import React, { useEffect, useState } from 'react';
import { Table, NumericStepper } from 'vtex.styleguide';
import AutocompleteBlock from './AutocompleteBlock';
import { useCssHandles } from 'vtex.css-handles';
import AddMoreLinesButton from './AddMoreLinesButton';
import AddAllToListButton from './AddAllToListButton';
import ClearAllLink from './ClearAllLink';
import AddAllToCart from './AddAllToCart';
import './global.css'

interface Item {
  id?: {
    thumb?: string;
    label?: string;
  };
}

const QuickOrderPad: React.FC = () => {
  const CSS_HANDLES = [
    'centerDiv',
    'productThumb',
    'productLabel',
    'productTitle',
    'tableActions',
    'tableWrapper',
    'headerActions'
  ] as const;

  const handles = useCssHandles(CSS_HANDLES);

  const [quantity, setQuantity] = useState<{ [key: number]: number }>({});

  const [items, setItems] = useState<Item[]>([
    {}
  ]);

  useEffect(() => {
    setQuantity({ 0: 0 });
  }, []);

  const addRow = () => {
    setItems([...items, {}]);
  };

  const removeItems = () => {
    setItems([]);
  };

  const handleQuantityChange = (rowIndex: number, value: number) => {
    setQuantity({ ...quantity, [rowIndex]: value });
  };

  const handleIdChange = (rowIndex: number, newSelectedItem: any) => {
    const newItems = [...items];
    newItems[rowIndex] = { ...newItems[rowIndex], id: newSelectedItem };
    setItems(newItems);
  };

  const createCellRenderer = (cellRenderer: Function) => ({ rowIndex }: { rowIndex: number }) =>
    cellRenderer({ rowIndex });

  const schema = {
    properties: {
      id: {
        title: 'Part Number/Keyword',
        cellRenderer: createCellRenderer(({ rowIndex }: { rowIndex: number }) => (
          <div>
            <AutocompleteBlock
              onSelectedItemChange={(newSelectedItem: any) => handleIdChange(rowIndex, newSelectedItem)}
              componentOnly={false}
            />
          </div>
        )),
      },
      quantity: {
        title: 'Quantity',
        cellRenderer: createCellRenderer(({ rowIndex }: { rowIndex: number }) => (
          <div className={handles.centerDiv}>
            <div>
              <NumericStepper
                size="small"
                minValue={0}
                maxValue={10}
                defaultValue={quantity[rowIndex] || 1}
                onChange={(event) => handleQuantityChange(rowIndex, event.value)}
              />
            </div>
          </div>
        )),
      },
      product: {
        title: 'Product',
        cellRenderer: createCellRenderer(({ rowIndex }: { rowIndex: number }) => {
          const selectedItem = items[rowIndex];

          return (
            <div className="w-two-thirds-l w-100-ns fl-l">
              <div className={`flex flex-column w-10 fl ${handles.productThumb}`}>
                {selectedItem?.id?.thumb && (
                  <img src={selectedItem?.id.thumb} width="50" height="50" alt="" />
                )}
              </div>
              <div className={`flex flex-column w-90 fl ${handles.productLabel}`}>
                <span className={`${handles.productTitle}`}>
                  {selectedItem?.id?.label && selectedItem?.id?.label}
                </span>
              </div>
            </div>
          );
        }),
      },
      price: {
        title: 'Price',
      },
    },
  };

  return (
    <>
      <div className={`${handles.headerActions}`}>
        <span>Quickly place an order using either the Quick Order Pad or Copy & Paste Pad.</span>
        <ClearAllLink removeItems={removeItems} />
        <AddAllToListButton />
        <AddAllToCart />
      </div>
      <div className={`${handles.tableWrapper}`}>
        <Table fullWidth items={items} schema={schema} density="low" />
      </div>
      <div className={`${handles.tableActions}`}>
        <AddMoreLinesButton addRow={addRow} />
        <ClearAllLink removeItems={removeItems} />
        <AddAllToListButton />
        <AddAllToCart />
      </div>
    </>
  );
};

export default QuickOrderPad;
