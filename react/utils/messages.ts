import { defineMessages } from 'react-intl'

const storePrefix = 'store/quickorder.'
const toasterPrefix = 'store/toaster.cart.'

export const reviewMessages = defineMessages({
  valid: {
    id: `${storePrefix}valid`,
  },
  available: {
    id: `${storePrefix}available`,
  },
  invalidPattern: {
    id: `${storePrefix}invalidPattern`,
  },
  withoutStock: {
    id: `${storePrefix}withoutStock`,
  },
  skuNotFound: {
    id: `${storePrefix}skuNotFound`,
  },
  withoutPriceFulfillment: {
    id: `${storePrefix}withoutPriceFulfillment`,
  },
  limited: {
    id: `${storePrefix}limited`,
  },
  cannotBeDelivered: {
    id: `${storePrefix}cannotBeDelivered`,
  },
  ORD002: {
    id: `${storePrefix}ORD002`,
  },
  ORD003: {
    id: `${storePrefix}ORD003`,
  },
  ORD004: {
    id: `${storePrefix}ORD004`,
  },
  ORD005: {
    id: `${storePrefix}ORD005`,
  },
  ORD006: {
    id: `${storePrefix}ORD006`,
  },
  ORD007: {
    id: `${storePrefix}ORD007`,
  },
  ORD008: {
    id: `${storePrefix}ORD008`,
  },
  ORD009: {
    id: `${storePrefix}ORD009`,
  },
  ORD011: {
    id: `${storePrefix}ORD011`,
  },
  ORD012: {
    id: `${storePrefix}ORD012`,
  },
  ORD013: {
    id: `${storePrefix}ORD013`,
  },
  ORD014: {
    id: `${storePrefix}ORD014`,
  },
  ORD015: {
    id: `${storePrefix}ORD015`,
  },
  ORD016: {
    id: `${storePrefix}ORD016`,
  },
  ORD017: {
    id: `${storePrefix}ORD017`,
  },
  ORD019: {
    id: `${storePrefix}ORD019`,
  },
  ORD020: {
    id: `${storePrefix}ORD020`,
  },
  ORD021: {
    id: `${storePrefix}ORD021`,
  },
  ORD022: {
    id: `${storePrefix}ORD022`,
  },
  ORD023: {
    id: `${storePrefix}ORD023`,
  },
  ORD024: {
    id: `${storePrefix}ORD024`,
  },
  ORD025: {
    id: `${storePrefix}ORD025`,
  },
  ORD026: {
    id: `${storePrefix}ORD026`,
  },
  ORD027: {
    id: `${storePrefix}ORD027`,
  },
  ORD028: {
    id: `${storePrefix}ORD028`,
  },
  ORD029: {
    id: `${storePrefix}ORD029`,
  },
  ORD030: {
    id: `${storePrefix}ORD030`,
  },
  ORD031: {
    id: `${storePrefix}ORD031`,
  },
  cannotGetSkuInfo: {
    id: `${storePrefix}cannotGetSkuInfo`,
  },
})

export const categoryMessages = defineMessages({
  success: {
    id: `${toasterPrefix}success`,
  },
  duplicate: {
    id: `${toasterPrefix}duplicate`,
  },
  noneSelection: {
    id: `${storePrefix}category.noneSelection`,
  },
  multiplier: {
    id: `${storePrefix}category.multiplier`,
  },
  error: {
    id: `${toasterPrefix}error`,
  },
  seeCart: {
    id: `${toasterPrefix}seeCart`,
  },
})

export const autocompleteMessages = defineMessages({
  placeholder: {
    id: `${storePrefix}autocomplete.placeholder`,
  },
  success: {
    id: `${toasterPrefix}success`,
  },
  duplicate: {
    id: `${toasterPrefix}duplicate`,
  },
  selectSku: {
    id: `${storePrefix}autocomplete.selectSku`,
  },
  multiplier: {
    id: `${storePrefix}category.multiplier`,
  },
  error: {
    id: `${toasterPrefix}error`,
  },
  seeCart: {
    id: `${toasterPrefix}seeCart`,
  },
})
