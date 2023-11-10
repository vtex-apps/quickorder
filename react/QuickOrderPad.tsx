import React, { useEffect, useState } from 'react'
import { Table, NumericStepper, Spinner } from 'vtex.styleguide'
import { useCssHandles } from 'vtex.css-handles'
import { useMutation } from 'react-apollo'
import { OrderForm } from 'vtex.order-manager'
import type { OrderForm as OrderFormType } from 'vtex.checkout-graphql'
import { addToCart as ADD_TO_CART } from 'vtex.checkout-resources/Mutations'
import CopyPastePad from './CopyPastePad';
import { useApolloClient } from 'react-apollo'
import autocomplete from './queries/autocomplete.gql'
import productQuery from './queries/product.gql'
import { getSession } from './modules/session'
import GET_ORGANIZATIONS_BY_EMAIL from './queries/getOrganizationsByEmail.gql'

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
    'quickorderPad',
    'quickorderPadContainer',
    'quickOrderPageTitle',
    'quickOrderPadHeader',
    'quickOrderMainContent',
    'quickOrderTableContainer',
    'quickOrderActionsContainer',
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
  const client = useApolloClient()

  const [
    addToCart,
    { error: mutationError },
  ] = useMutation<{ addToCart: OrderFormType }, { items: any }>(ADD_TO_CART)

  const [selectedItem, setSelectedItem] = useState<any | null>(null)
  const [copyProduct, setCopyProduct] = useState()
  const [tableData, setTableData] = useState([
    { id: 1, quantity: 1, thumb: '', price: '', label: '', seller: '', skuId: '', stock: 0 }
  ])
  const [loading, setLoading] = useState(false)
  const { setOrderForm }: OrderFormContext = OrderForm.useOrderForm()
  const orderForm = OrderForm.useOrderForm()

  useEffect(() => {
    console.info('autocompleteState changed:', selectedItem)
  }, [selectedItem])

  const USDollar = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  });


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

  const productPrice = async (productId: any) => {
    try {
      const sessionResponse = await getSession();
      const userInfo = sessionResponse?.response?.namespaces?.profile?.email?.value;

      const userEmailResponse = await client.query({
        query: GET_ORGANIZATIONS_BY_EMAIL,
        variables: { email: userInfo },
      });

      const userOrganizationId = userEmailResponse.data.getOrganizationsByEmail[0].costId;

      const postData = {
        customerId: userOrganizationId,
        branchId: "",
        productId: [productId],
        orderQty: 1,
        shouldHidePrice: "false",
      };

      const response = await fetch('/v0/customerPrice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });

      const data = await response.json();
      const formattedPrice = parseFloat(data?.price?.CustomersPrice?.Products[0]?.PricePer);

      return formattedPrice;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

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

  const addRow = (selectedProduct: any = null) => {
    const highestId =
      tableData.length > 0 ? tableData[tableData.length - 1].id || 0 : 0;
    if (selectedProduct?.itemId) {
      const { images, sellers, name, itemId } = selectedProduct
      const seller = selectedProduct
        ? sellers.find((item: any) => {
          if (sellers.length > 1 && item.sellerId === "uselectricalcd01") {
            return item.sellerId === "uselectricalcd01"
          } else {
            return item.sellerDefault === true
          }
        }).sellerId
        : null

      productPrice(itemId)
        .then((price) => {
          selectedProduct.price = price
        })
        .catch((error) => {
          console.error(`Error fetching product price: ${error}`);
        })


      const quantity = selectedProduct.sellers.find((id: { sellerId: string }) => id.sellerId == 'uselectricalcd01').commertialOffer.AvailableQuantity

      console.log(selectedProduct.price)
      const newId = highestId + 1;
      const newItem = {
        id: newId,
        quantity: 1,
        thumb: images[0]?.imageUrl || '',
        price: USDollar.format(selectedProduct?.price) || '',
        label: name || '',
        seller: seller || '',
        skuId: itemId || '',
        stock: quantity || 0,
      };

      setTableData([...tableData, newItem]);
    } else {
      const newId = highestId + 1
      const newItem = { id: newId, quantity: 1, thumb: '', price: '', label: '', seller: '', skuId: '', stock: 0 }

      setTableData([...tableData, newItem])
    }
  };

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

  const handleReviewItemsChange = async (item: any) => {
    if (copyProduct !== undefined) return
    const skuId = item[0].sku
    const { data } = await client.query({
      query: autocomplete,
      variables: { inputValue: skuId },
    })

    const slug = data.productSuggestions.products[0].linkText

    setCopyProduct(slug)
    const query = {
      query: productQuery,
      variables: { slug: slug },
    }

    const product = await client.query(query)
    const productSelected = product.data.product.items[0]


    addRow(productSelected)
  }

  const schema = {
    properties: {
      id: {
        title: 'Part Number/Keyword',
        width: 300,
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
        width: 200,
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
        width: 200,
        cellRenderer: (rowIndex: { rowData: { id: number } }) => {
          const tableRow = tableData[rowIndex.rowData.id - 1];
          return (
            <div className={`${handles.productContainer}`}>
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
        width: 100,
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
                    {tableRow?.stock == 0 || tableRow?.stock == undefined ? '' : tableRow?.stock}
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
        width: 50,
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
    <div className={handles.quickorderPad}>
      <div className={handles.quickOrderPadHeader}>
        <h1 className={handles.quickOrderPageTitle}>Quick Order</h1>
        <span>
          Quickly place an order using either the Quick Order Pad or Copy &
          Paste Pad.
        </span>
        <div className={`${handles.headerActions}`}>
          <ClearAllLink removeItems={removeItems} />
          <AddAllToCart isLoading={false} onClick={() => { handleAddAllToCart() }} />
        </div>
      </div>
      <div className={handles.quickOrderMainContent}>
        <div className={handles.quickOrderTableContainer}>
          <Table items={tableData} schema={schema} fullWidth={false} />
          <div className={handles.quickOrderActionsContainer}>
            <AddMoreLinesButton addRow={addRow} />
            <ClearAllLink removeItems={removeItems} />
            <AddAllToCart isLoading={false} onClick={() => { handleAddAllToCart() }} />
          </div>
        </div>
        <CopyPastePad onReviewItemsChange={handleReviewItemsChange} />
      </div>
      <div className={`${handles.tableActions}`}>
      </div>
    </div>
  )
}

interface OrderFormContext {
  loading: boolean
  orderForm: OrderFormType | undefined
  setOrderForm: (orderForm: Partial<OrderFormType>) => void
}

export default QuickOrderPad
