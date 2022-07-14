import { MetricsAccumulator } from '@vtex/api'

if (!global.metrics) {
  global.metrics = new MetricsAccumulator()
}

jest.mock('@vtex/api', () => {
  const getStockMocked = () => ({
    Id: 2001773,
    ProductId: 2001426,
    NameComplete: 'Tabela de Basquete',
    ProductName: 'Tabela de Basquete',
    ProductDescription: 'Tabela de Basquete',
    SkuName: 'Tabela de Basquete',
    IsActive: true,
    IsTransported: true,
    IsInventoried: true,
    IsGiftCardRecharge: false,
    ImageUrl:
      'https://ambienteqa.vteximg.com.br/arquivos/ids/168952-55-55/7508800GG.jpg',
    DetailUrl: '/tabela-de-basquete/p',
    CSCIdentification: null,
    BrandId: '2000018',
    BrandName: 'MARCA ARGOLO TESTE',
    Dimension: {
      cubicweight: 81.6833,
      height: 65,
      length: 58,
      weight: 10000,
      width: 130,
    },
    RealDimension: {
      realCubicWeight: 274.1375,
      realHeight: 241,
      realLength: 65,
      realWeight: 9800,
      realWidth: 105,
    },
    ManufacturerCode: '',
    IsKit: false,
    KitItems: [],
    Services: [],
    Categories: [],
    Attachments: [
      {
        Id: 3,
        Name: 'Mensagem',
        Keys: ['nome;20', 'foto;40'],
        Fields: [
          {
            FieldName: 'nome',
            MaxCaracters: '20',
            DomainValues: 'Adalberto,Pedro,João',
          },
          {
            FieldName: 'foto',
            MaxCaracters: '40',
            DomainValues: null,
          },
        ],
        IsActive: true,
        IsRequired: false,
      },
    ],
    Collections: [],
    SkuSellers: [
      {
        SellerId: '1',
        StockKeepingUnitId: 2001773,
        SellerStockKeepingUnitId: '2001773',
        IsActive: true,
        FreightCommissionPercentage: 0,
        ProductCommissionPercentage: 0,
      },
    ],
    SalesChannels: [1, 2, 3, 10],
    Images: [
      {
        ImageUrl:
          'https://ambienteqa.vteximg.com.br/arquivos/ids/168952/7508800GG.jpg',
        ImageName: '',
        FileId: 168952,
      },
      {
        ImageUrl:
          'https://ambienteqa.vteximg.com.br/arquivos/ids/168953/7508800_1GG.jpg',
        ImageName: '',
        FileId: 168953,
      },
      {
        ImageUrl:
          'https://ambienteqa.vteximg.com.br/arquivos/ids/168954/7508800_2GG.jpg',
        ImageName: '',
        FileId: 168954,
      },
    ],
    SkuSpecifications: [
      {
        FieldId: 102,
        FieldName: 'Cor',
        FieldValueIds: [266],
        FieldValues: ['Padrão'],
      },
    ],
    ProductSpecifications: [
      {
        FieldId: 7,
        FieldName: 'Faixa Etária',
        FieldValueIds: [58, 56, 55, 52],
        FieldValues: [
          '5 a 6 anos',
          '7 a 8 anos',
          '9 a 10 anos',
          'Acima de 10 anos',
        ],
      },
      {
        FieldId: 23,
        FieldName: 'Fabricante',
        FieldValueIds: [],
        FieldValues: ['Xalingo'],
      },
    ],
    ProductClustersIds: '176,187,192,194,211,217,235,242',
    ProductCategoryIds: '/59/',
    ProductGlobalCategoryId: null,
    ProductCategories: {
      '59': 'Brinquedos',
    },
    CommercialConditionId: 1,
    RewardValue: 100,
    AlternateIds: {
      Ean: '8781',
      RefId: '878181',
    },
    AlternateIdValues: ['8781', '878181'],
    EstimatedDateArrival: null,
    MeasurementUnit: 'un',
    UnitMultiplier: 1,
    InformationSource: 'Indexer',
    ModalType: '',
  })

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
        availableSalesChannels: [
          {
            id: 2,
          },
          {
            id: 4,
          },
        ],
      },
    ],
  })

  const orderFormMocked = () => ({
    salesChannel: '1',
    storePreferencesData: {
      countryCode: 'BR',
    },
    shippingData: {},
  })

  const postStockMocked = () => ({
    'D25133K-B2': 100,
    '14-556': 5,
    '123': 100,
    'DCF880L2-BR': 1515,
  })

  const simulationMocked = () => ({
    items: [
      {
        sku: 'SKU-MOCKED-1',
        id: '100',
      },
    ],
  })

  return {
    IOContext: jest.fn(),
    MetricsAccumulator: jest.fn((): any => ({
      trackCache: jest.fn(),
    })),
    JanusClient: jest.fn(() => ({
      http: {
        getRaw: jest.fn((url): any => {
          if (url.match(/stockkeep/)) {
            return {
              status: 200,
              data: getStockMocked(),
            }
          }

          if (url.match(/sellers/)) {
            return {
              status: 200,
              data: getSellersMocked(),
            }
          }
        }),
        get: jest.fn((url: string): any => {
          if (url.match(/orderForm/)) {
            return orderFormMocked()
          }
        }),
        post: jest.fn((url: string): any => {
          if (url.match(/simulation/)) {
            return simulationMocked()
          }
        }),
        postRaw: jest.fn((url: string): any => {
          if (url.match(/stockkeep/)) {
            return {
              status: 200,
              data: postStockMocked(),
            }
          }
        }),
      },
      context: {
        authToken: 'tokenMocked',
      },
    })),
    IOClients: jest.fn(() => ({
      getOrSet: jest.fn(),
    })),
    Segment: jest.fn((): any => ({
      getSegment: jest.fn(() => ({
        channel: jest.fn(),
      })),
    })),
    LRUCache: jest.fn(),
    RecorderState: jest.fn(),
    UserInputError: jest.fn(),
    Service: jest.fn((config): any => {
      return { config }
    }),
  } as any
})
