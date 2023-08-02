import React from 'react';
import { Table } from 'vtex.styleguide';

const QuickOrderPad = () => {
  const tableData = [
    { id: 1, quantity: 3, product: "Sample Product", price: "45" },
    { id: 2, quantity: 9, product: "Sample Product 2", price: "85" },
  ];

  const schema = {
    properties: {
      id: {
        title: 'Part Number/Keyword',
      },
      quantity: {
        title: 'Quantity',
      },
      product: {
        title: 'Product',
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
