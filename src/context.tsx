import React, { createContext, useContext, useMemo } from 'react'
import { OmssClient, OmssClientConfig } from './client'

const OmssClientContext = createContext<OmssClient | null>(null)

export interface OmssProviderProps {
    config: OmssClientConfig
    children: React.ReactNode
}

export const OmssProvider: React.FC<OmssProviderProps> = ({ config, children }) => {
    const client = useMemo(() => new OmssClient(config), [config.baseUrl])
    return <OmssClientContext.Provider value={client}>{children}</OmssClientContext.Provider>
}

export const useOmssClient = (): OmssClient => {
    const ctx = useContext(OmssClientContext)
    if (!ctx) {
        throw new Error('useOmssClient must be used within an OmssProvider')
    }
    return ctx
}
