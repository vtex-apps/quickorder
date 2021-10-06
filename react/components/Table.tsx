import React from 'react'

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const Table = ({ onReviewItems, reviewedItems, onRefidLoading }: any) => {
  // eslint-disable-next-line no-console
  console.log('ReviewedItems : ', reviewedItems)

  onRefidLoading(true)

  const tableSchema = {
    properties: {},
  }

  return (
    <div>
      <Table schema={tableSchema} items={reviewedItems} fullWidth />
    </div>
  )
}

export default Table
