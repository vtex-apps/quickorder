import {
    Table,
    TBody,
    TBodyRow,
    TBodyCell,
    THead,
    THeadCell,
    useTableState,
    createColumns
} from '@vtex/admin-ui'

import React from 'react'
import './global.css'


const QuickOrderPad = () => {
    const columns = createColumns([
        {
            id: 'partNumber',
            header: "PART NUMBER/KEYWORD",
            width: '2fr',
        },
        {
            id: 'quantity',
            header: "QUANTITY",
            width: '2fr',
        },
        {
            id: 'product',
            header: "PRODUCT",
            width: '2fr',
        },
        {
            id: 'price',
            header: "PRICE",
            width: '2fr',
        }
    ])

    const { data, getBodyCell, getHeadCell, getTable } = useTableState({
        columns,
        /**
         * List of items to render
         */
        items: [
            {
                partNumber: 1234, /*this oulw need to be inputed by the user*/
                quantity: 1,
                product: "Product Name",
                price: 1233,
            },
        ],
    })

    return (
        <Table {...getTable()}>
            <THead>
                {columns.map((column) => (
                    <THeadCell {...getHeadCell(column)} />
                ))}
            </THead>
            <TBody>
                {data.map((item) => {
                    return (
                        <TBodyRow key={item.partNumber}>
                            {columns.map(column => {
                                return <TBodyCell {...getBodyCell(column, item)} />
                            })}
                        </TBodyRow>
                    )
                })}
            </TBody>
        </Table>
    );
};

export default QuickOrderPad;