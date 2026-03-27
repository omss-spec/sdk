export interface HealthResponse {
    name: string
    version: string
    status: 'operational' | 'degraded' | 'maintenance' | 'offline'
    endpoints?: {
        movie?: string
        tv?: string
        proxy?: string
    }
    spec: 'omss'
    note?: string
}

export interface AudioTrack {
    language: string // ISO 639-1
    label: string
}

export type SourceType = 'hls' | 'dash' | 'http' | 'mp4' | 'mkv' | 'webm'

export interface Provider {
    id: string
    name: string
}

export interface Source {
    url: string
    type: SourceType
    quality: string // e.g. "1080"
    audioTracks: AudioTrack[]
    provider: Provider
}

export type SubtitleFormat = 'vtt' | 'srt' | 'ass' | 'ssa'

export interface Subtitle {
    url: string
    label: string
    format: SubtitleFormat
}

export type DiagnosticSeverity = 'info' | 'warning' | 'error'

export interface Diagnostic {
    code: 'QUALITY_INFERRED' | 'LANGUAGE_INFERRED' | 'TYPE_INFERRED' | 'SUBTITLE_LABEL_INFERRED' | 'PROVIDER_ERROR' | 'PARTIAL_SCRAPE'
    message: string
    field?: string
    severity: DiagnosticSeverity
}

export interface SourceResponse {
    responseId: string
    expiresAt: string // ISO8601
    sources: Source[]
    subtitles: Subtitle[]
    diagnostics: Diagnostic[]
}

export interface RefreshResponse {
    status: 'OK'
}

export type ErrorCode =
    | 'INVALID_TMDB_ID'
    | 'INVALID_PARAMETER'
    | 'MISSING_PARAMETER'
    | 'INVALID_SEASON'
    | 'INVALID_EPISODE'
    | 'INVALID_RESPONSE_ID'
    | 'RESPONSE_ID_NOT_FOUND'
    | 'NO_SOURCES_AVAILABLE'
    | 'ENDPOINT_NOT_FOUND'
    | 'METHOD_NOT_ALLOWED'
    | 'INTERNAL_ERROR'
    | 'UNSUPPORTED_MEDIA_TYPE'

export interface ErrorObject {
    code: ErrorCode
    message: string
    details?: Record<string, unknown>
}

export interface ErrorResponse {
    error: ErrorObject
    traceId: string
}

/**
 * Generic wrapper shape returned by OmssClient methods.
 */
export type OmssResult<T> =
    | { data: T; error: null }
    | { data: null; error: ErrorResponse }
