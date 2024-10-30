import { useQuery } from 'react-apollo'
import AppSettings from '../queries/getSettings.gql'
import { useEffect, useState } from 'react'
import { pathOr } from 'ramda'

const useAppSettings = () => {
    const { data: appSettingsData } = useQuery(AppSettings, {
        variables: {
            version: process.env.VTEX_APP_VERSION,
        },
        ssr: false,
    })

    const [appSettings, setAppSettings] = useState({ checkoutUrl: "/checkout#/cart" })

    useEffect(() => {
        if (appSettingsData) {
            const settingsString = pathOr(`""`, ['publicSettingsForApp', 'message'], appSettingsData)

            try {
                const parsedAppSettings = JSON.parse(settingsString)
                setAppSettings(parsedAppSettings)
            } catch (error) {
                console.error("Error parsing app settings:", error)
            }
        }
    }, [appSettingsData])

    return appSettings
}

export default useAppSettings
