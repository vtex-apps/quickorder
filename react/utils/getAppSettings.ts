import { useQuery } from 'react-apollo'
import { useEffect, useState } from 'react'
/* eslint-disable no-restricted-imports */
import { pathOr } from 'ramda'

import AppSettings from '../queries/getSettings.gql'
import { DEFAULT_UPLOAD_CHUNK_SETTINGS } from './uploadAddToCart'
import type { UploadChunkSettings } from './uploadAddToCart'

export type AppSettings = {
  checkoutUrl: string
} & UploadChunkSettings

export const DEFAULT_APP_SETTINGS: AppSettings = {
  checkoutUrl: '/checkout#/cart',
  ...DEFAULT_UPLOAD_CHUNK_SETTINGS,
}

const useAppSettings = () => {
  const { data: appSettingsData } = useQuery(AppSettings, {
    variables: {
      version: process.env.VTEX_APP_VERSION,
    },
    ssr: false,
  })

  const [appSettings, setAppSettings] = useState<AppSettings>(
    DEFAULT_APP_SETTINGS
  )

  useEffect(() => {
    if (appSettingsData) {
      const settingsString = pathOr(
        `""`,
        ['publicSettingsForApp', 'message'],
        appSettingsData
      )

      try {
        const parsedAppSettings = JSON.parse(settingsString)

        setAppSettings({
          ...DEFAULT_APP_SETTINGS,
          ...parsedAppSettings,
        })
      } catch (error) {
        console.error('Error parsing app settings:', error)
      }
    }
  }, [appSettingsData])

  return appSettings
}

export default useAppSettings
