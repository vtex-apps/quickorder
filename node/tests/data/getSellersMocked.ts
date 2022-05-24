const getSellersMocked = () => ({
  items: [
    {
      id: '1',
      SellerId: 'externalseller',
      name: 'External Seller',
      email: 'seller@email.com',
      description: '',
      exchangeReturnPolicy: '',
      deliveryPolicy: '',
      useHybridPaymentOptions: false,
      userName: '',
      password: '',
      secutityPrivacyPolicy: '',
      CNPJ: '',
      CSCIdentification: '',
      ArchiveId: null,
      UrlLogo: '',
      ProductCommissionPercentage: 30.0,
      FreightCommissionPercentage: 10.0,
      CategoryCommissionPercentage: null,
      FulfillmentEndpoint: 'https://sellerendpoint.com/',
      CatalogSystemEndpoint: null,
      isActive: true,
      MerchantName: '',
      FulfillmentSellerId: '',
      SellerType: 1,
      IsBetterScope: false,
    },
  ],
})

export default getSellersMocked
