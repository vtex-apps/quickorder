/* eslint-disable no-console */
import { useContext } from 'react'
import { ToastContext } from 'vtex.styleguide'
import { addToCart as ADD_TO_CART } from 'vtex.checkout-resources/Mutations'
import { usePixel } from 'vtex.pixel-manager/PixelContext'
import { OrderForm } from 'vtex.order-manager'
import { usePWA } from 'vtex.store-resources/PWAContext'
import { useMutation } from 'react-apollo'
import { defineMessages, IntlFormatters } from 'react-intl'

const messages = defineMessages({
  success: {
    id: 'store/toaster.cart.success',
    defaultMessage: '',
    label: '',
  },
  duplicate: {
    id: 'store/toaster.cart.duplicated',
    defaultMessage: '',
    label: '',
  },
  error: { id: 'store/toaster.cart.error', defaultMessage: '', label: '' },
  seeCart: {
    id: 'store/toaster.cart.seeCart',
    defaultMessage: '',
    label: '',
  },
})

interface Props {
  cartItems: any
  intl: IntlFormatters
}

const AddToCart = async ({ intl, cartItems }: Props) => {
  const { showToast } = useContext(ToastContext)
  const [
    addToCart,
    { error: mutationError, loading: mutationLoading },
  ] = useMutation<{ addToCart: OrderForm }, { items: [] }>(ADD_TO_CART)
  const { push } = usePixel()
  const { settings = {}, showInstallPrompt = undefined } = usePWA() || {}
  const { setOrderForm }: OrderFormContext = OrderForm.useOrderForm()

  console.log('After hooks')

  const mutationResult = await addToCart({
    variables: {
      items: cartItems.map((item: any) => {
        return {
          ...item,
        }
      }),
    },
  })

  const translateMessage = (message: MessageDescriptor) => {
    return intl.formatMessage(message)
  }

  const resolveToastMessage = (success: boolean, isNewItem: boolean) => {
    if (!success) return translateMessage(messages.error)
    if (!isNewItem) return translateMessage(messages.duplicate)

    return translateMessage(messages.success)
  }
  const toastMessage = ({
    success,
    isNewItem,
  }: {
    success: boolean
    isNewItem: boolean
  }) => {
    const message = resolveToastMessage(success, isNewItem)

    const action = success
      ? {
          label: translateMessage(messages.seeCart),
          href: '/checkout/#/cart',
        }
      : undefined
    console.log('showToast', { message, action })
    showToast({ message, action })
  }

  if (mutationError) {
    console.error(mutationError)
    toastMessage({ success: false, isNewItem: false })
    return
  }

  // Update OrderForm from the context
  mutationResult.data && setOrderForm(mutationResult.data.addToCart)

  const adjustSkuItemForPixelEvent = (item: any) => {
    return {
      skuId: item.id,
      quantity: item.quantity,
    }
  }
  // Send event to pixel-manager
  const pixelEventItems = cartItems.map(adjustSkuItemForPixelEvent)
  push({
    event: 'addToCart',
    items: pixelEventItems,
  })

  if (
    mutationResult.data?.addToCart?.messages?.generalMessages &&
    mutationResult.data.addToCart.messages.generalMessages.length
  ) {
    mutationResult.data.addToCart.messages.generalMessages.map((msg: any) => {
      return showToast({
        message: msg.text,
        action: undefined,
        duration: 30000,
      })
    })
  } else {
    toastMessage({ success: true, isNewItem: true })
  }

  const { promptOnCustomEvent } = settings
  window.postMessage(
    {
      action: {
        type: `QUICKORDER_CHECKOUT_${
          mutationLoading ? 'START' : 'STOP'
        }_LOADING`,
      },
    },
    '*'
  )

  if (mutationError) {
    window.postMessage(
      {
        action: {
          type: `QUICKORDER_CHECKOUT_ERROR`,
        },
      },
      '*'
    )
  }

  if (promptOnCustomEvent === 'addToCart' && showInstallPrompt) {
    showInstallPrompt()
  }

  return showInstallPrompt
}
interface OrderFormContext {
  loading: boolean
  orderForm: OrderForm | undefined
  setOrderForm: (orderForm: Partial<OrderForm>) => void
}

interface MessageDescriptor {
  id: string
  description?: string | object
  defaultMessage?: string
}

export default AddToCart
