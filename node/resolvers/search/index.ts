import { UserInputError } from '@vtex/api'

import { resolvers as refidsResolvers } from './refids'
import {
  BRAND_CLIENT_ACRONYM,
  BRAND_CLIENT_SCHEMA,
  BRNAD_CLIENT_FIELDS,
  PLANT_ACRONYM,
  PLANT_FIELDS,
  PLANT_SCHEMA,
  // UMMOQ_CLIENT_ACRONYM,
  // UMMOQ_CLIENT_FIELDS,
  // UMMOQ_CLIENT_SCHEMA,
} from '../../utils/consts'

export const fieldResolvers = {
  ...refidsResolvers,
}

export const queries = {
  skuFromRefIds: async (
    _: any,
    args: { refids: [string]; orderFormId: string },
    ctx: Context
  ) => {
    const {
      clients: { search },
    } = ctx

    if (!args.refids) {
      throw new UserInputError('No refids provided')
    }

    const items = await search.skuFromRefIds({
      refids: args.refids,
      orderFormId: args.orderFormId,
    })

    return {
      cacheId: args.refids,
      items,
    }
  },
  // eslint-disable-next-line @typescript-eslint/ban-types
  sellers: async (_: any, __: {}, ctx: Context) => {
    const {
      clients: { search },
    } = ctx

    const items = await search.sellers()
    return {
      cacheId: 'sellers',
      items,
    }
  },
  getSkuAvailability: async (
    _: any,
    args: {
      refIds: string[]
      customerNumber: string
      targetSystem: string
      salesOrganizationCode: string
    },
    ctx: Context
  ) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const { refIds, customerNumber, targetSystem, salesOrganizationCode } = args
    const {
      clients: { search, masterdata, catalog },
    } = ctx

    const skuIds = await search.getSkusByRefIds(refIds)
    const refIdsFound = Object.getOwnPropertyNames(skuIds)
    const skus = refIdsFound
      .map((rfId: any) => ({
        skuId: skuIds[rfId],
        refId: rfId,
      }))
      .filter((sku: any) => sku.skuId != null)

    const products = await Promise.all(
      skus.map(async (sku: any) => search.searchProductBySkuId(sku.skuId))
    )

    const plants = await Promise.all(
      refIds.map((refId: string) => {
        const where = `skuRefId=${refId} ${
          salesOrganizationCode
            ? `AND salesOrganizationCode=${salesOrganizationCode}`
            : ''
        }`

        return masterdata.searchDocumentsWithPaginationInfo<SalesOrgPlant>({
          dataEntity: PLANT_ACRONYM,
          schema: PLANT_SCHEMA,
          fields: PLANT_FIELDS,
          where,
          pagination: { pageSize: 100, page: 1 },
        })
      })
    )

    const plantList = refIds.map((refId: string, index: number) => {
      return {
        refId,
        plants: plants[index]?.data ?? [],
      }
    })

    const brands = await masterdata.searchDocumentsWithPaginationInfo<
      BrandForClients
    >({
      dataEntity: BRAND_CLIENT_ACRONYM,
      schema: BRAND_CLIENT_SCHEMA,
      fields: BRNAD_CLIENT_FIELDS,
      where: `(user=${customerNumber ?? ''} AND targetSystem=${targetSystem ??
        ''})`,
      pagination: { pageSize: 100, page: 1 },
    })

    const brandsList = brands?.data ?? []

    const allInventoryByItemIds = await Promise.all(
      ((Object.values(skuIds ?? {}) as string[]) ?? []).map((skuId: string) => {
        return catalog.inventoryBySkuId(skuId)
      })
    )

    const allSkus = (products ?? [])
      .filter((r: any) => Object.entries(r).length > 0)
      .map((product: any) => {
        if (
          (product.items ?? []).length === 0 ||
          (product.items[0]?.sellers ?? []).length === 0
        ) {
          return {}
        }
        const { items, productId, productName } = product

        const itemId = items[0]?.itemId
        const skuRefId = skus.find((sku: any) => sku.skuId === itemId)?.refId
        // const refId = (items[0]?.referenceId ?? []).find((ref: any) => ref.Key === 'RefId')?.Value ?? ''
        const { commertialOffer, sellerId, sellerName } = items[0].sellers[0]

        let availableQuantity = 0
        let isAvailable = false
        const unitMultiplier =
          items.find((item: any) => item)?.unitMultiplier ?? 1

        if (targetSystem.toUpperCase() === 'SAP') {
          const productPlants =
            plantList
              .find(
                (plant: any) =>
                  plant?.refId?.toLowerCase() === skuRefId.toLowerCase()
              )
              ?.plants?.map((plant: any) => plant.plant) ?? []
          const selectedProductWearhouses =
            allInventoryByItemIds
              .find((inventory: any) => inventory.skuId === itemId)
              ?.balance?.filter((wearhouse: any) =>
                productPlants.includes(wearhouse.warehouseName)
              ) ?? []
          availableQuantity = selectedProductWearhouses.reduce(
            (partialSum: number, current: { totalQuantity: number }) =>
              partialSum + current?.totalQuantity ?? 0,
            0
          )
          isAvailable = selectedProductWearhouses.length > 0
        } else if (targetSystem.toUpperCase() === 'JDE') {
          const { AvailableQuantity } = commertialOffer

          const productBrand = product.brand
          // const brandClientData = brandData?.brandClient?.data ?? []
          const brandDataMatch: any = brandsList?.find(
            (data: any) => data.trade === productBrand
          )

          availableQuantity =
            brandDataMatch?.trade === productBrand ? AvailableQuantity : 0
          isAvailable = brandDataMatch?.trade === productBrand
        }

        const price = commertialOffer.SellingPrice
          ? commertialOffer.SellingPrice
          : commertialOffer.Price
          ? commertialOffer.Price
          : commertialOffer.ListPrice

        return {
          refid: skuRefId,
          sku: itemId,
          productId,
          productName,
          price,
          availableQuantity,
          seller: {
            id: sellerId,
            name: sellerName,
          },
          availability: isAvailable ? 'available' : 'unavailable',
          unitMultiplier,
        }
      })

    const itemsRequested = (refIds ?? []).map((refId: string) => {
      const existing = allSkus.find((s: any) => s.refid === refId)
      return (
        existing || {
          refid: refId,
          sku: null,
          productId: null,
          productName: null,
          price: null,
          availableQuantity: null,
          seller: null,
          availability: 'unavailable',
        }
      )
    })

    return {
      items: itemsRequested,
    }
  },
}
