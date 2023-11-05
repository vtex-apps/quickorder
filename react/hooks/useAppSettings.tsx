import { useState, useEffect } from 'react'
import { useLazyQuery } from 'react-apollo'

import GetAppSettings from '../graphql/queries/getAppSettings.graphql'
import initialContextState from '../utils/initialContextState'

const useAppSettings = (app: string, version: string) => {
  const [settings, setSettings] = useState(initialContextState)
  const [getContent, { data, loading, error }] = useLazyQuery(GetAppSettings, {
    notifyOnNetworkStatusChange: true,
  })

  useEffect(() => {
    if (app && version) {
      getContent({
        variables: {
          app: `${app}`,
          version: `${version}`,
        },
      })
    }
  }, [])

  useEffect(() => {
    if (!loading && !error && data) {
      const aux = JSON.parse(data?.publicSettingsForApp?.message)
      setSettings(aux)
    }
  }, [data, loading, error])

  return { settings, loading, error }
}

export default useAppSettings
