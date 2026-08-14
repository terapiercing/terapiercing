'use client'

import { createContext, useContext } from 'react'
import { DEFAULT_CONFIG, type AppConfig } from '@/lib/config-shared'

const ConfigContext = createContext<AppConfig>(DEFAULT_CONFIG)

export function ConfigProvider({
  value,
  children,
}: {
  value: AppConfig
  children: React.ReactNode
}) {
  return <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>
}

export function useConfig(): AppConfig {
  return useContext(ConfigContext)
}
