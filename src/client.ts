import type { HealthResponse, SourceResponse, RefreshResponse, ErrorResponse, OmssResult } from './types'

export interface OmssClientConfig {
    baseUrl: string
    fetchFn?: typeof fetch
    getDefaultHeaders?: () => HeadersInit
}

export class OmssClient {
    private baseUrl: string
    private fetchFn: typeof fetch
    private getDefaultHeaders?: () => HeadersInit

    constructor(config: OmssClientConfig) {
        this.baseUrl = config.baseUrl.replace(/\/+$/, '')
        this.fetchFn = config.fetchFn ?? fetch.bind(globalThis)
        this.getDefaultHeaders = config.getDefaultHeaders
    }

    static create(config: OmssClientConfig) {
        return new OmssClient(config)
    }

    private async requestJson<T>(path: string, init?: RequestInit): Promise<OmssResult<T>> {
        const url = `${this.baseUrl}${path}`
        const headers: HeadersInit = {
            Accept: 'application/json',
            ...(this.getDefaultHeaders ? this.getDefaultHeaders() : {}),
            ...(init?.headers ?? {}),
        }

        let res: Response
        try {
            res = await this.fetchFn(url, { ...init, headers })
        } catch (e) {
            // Network error, synthesize an ErrorResponse-like object
            const error: ErrorResponse = {
                error: {
                    code: 'INTERNAL_ERROR',
                    message: (e as Error).message ?? 'Network error',
                },
                traceId: 'network-error',
            }
            return { data: null, error, status: 0 }
        }

        const status = res.status

        // Try parse JSON; if it fails, treat as generic error/success without body
        let body: unknown = null
        try {
            if (res.headers.get('Content-Type')?.includes('application/json')) {
                body = await res.json()
            } else {
                body = await res.text()
            }
        } catch {
            // ignore parse errors
        }

        if (res.ok) {
            return { data: body as T, error: null, status }
        }

        const error = body as ErrorResponse
        return { data: null, error, status }
    }

    // ---- OMSS operations ----

    /**
     * GET /
     */
    getHealth() {
        return this.requestJson<HealthResponse>('/')
    }

    /**
     * GET /v1
     */
    getVersion() {
        return this.requestJson<HealthResponse>('/v1')
    }

    /**
     * GET /v1/health
     */
    getHealthStatus() {
        return this.requestJson<HealthResponse>('/v1/health')
    }

    /**
     * GET /v1/movies/{id}
     * TMDB movie ID as string (numeric).
     */
    getMovie(id: string) {
        return this.requestJson<SourceResponse>(`/v1/movies/${encodeURIComponent(id)}`)
    }

    /**
     * GET /v1/tv/{id}/seasons/{s}/episodes/{e}
     */
    getTvEpisode(id: string, season: number, episode: number) {
        const path = `/v1/tv/${encodeURIComponent(id)}/seasons/${season}/episodes/${episode}`
        return this.requestJson<SourceResponse>(path)
    }

    /**
     * GET /v1/refresh/{responseId}
     */
    refreshSource(responseId: string) {
        return this.requestJson<RefreshResponse>(`/v1/refresh/${encodeURIComponent(responseId)}`)
    }

    /**
     * Utils Function to set the base URL of the API client after instantiation.
     * Useful when the base URL is not known at the time of client creation.
     */
    setBaseUrl(newBaseUrl: string) {
        this.baseUrl = newBaseUrl.replace(/\/+$/, '')
    }
    
    /** 
     * Utils Function to get the current base URL of the API client.
     */
    getBaseUrl() {
        return this.baseUrl
    }
}

// Factory
export const createOmssClient = (config: OmssClientConfig) => OmssClient.create(config)

export type { OmssResult } from './types'
