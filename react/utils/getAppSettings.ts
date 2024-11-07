import { useQuery } from 'react-apollo'
import { useEffect, useState } from 'react'
/* eslint-disable no-restricted-imports */
import { pathOr } from 'ramda'

import AppSettings from '../queries/getSettings.gql'

const useAppSettings = () => {
  const { data: appSettingsData } = useQuery(AppSettings, {
    variables: {
      version: process.env.VTEX_APP_VERSION,
    },
    ssr: false,
  })

  const [appSettings, setAppSettings] = useState({
    checkoutUrl: '/checkout#/cart',
  })

  useEffect(() => {
    if (appSettingsData) {
      const settingsString = pathOr(
        `""`,
        ['publicSettingsForApp', 'message'],
        appSettingsData
      )

      try {
        const parsedAppSettings = JSON.parse(settingsString)

        setAppSettings(parsedAppSettings)
      } catch (error) {
        console.error('Error parsing app settings:', error)
      }
    }
  }, [appSettingsData])

  return appSettings
}

export default useAppSettings
