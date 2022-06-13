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

export default getStockMocked
