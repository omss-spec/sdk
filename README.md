<div align="center">

# OMSS SDK

[![NPM Version](https://img.shields.io/npm/v/@omss/sdk.svg)](https://www.npmjs.com/package/@omss/sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-blue.svg)](https://www.typescriptlang.org/)
[![OMSS Spec](https://img.shields.io/badge/OMSS-v1.0.0-orange.svg)](https://github.com/omss-spec/omss-spec)

A strongly typed TypeScript/React client for backends that implement the **[OMSS (Open Media Streaming Standard)](https://github.com/omss-spec/omss-spec)**. It provides a thin, zero-dependency wrapper around the OMSS REST API so you can fetch streaming sources with a single line:

```ts
const { data, error } = await omssService.getMovie('155')
```

---

</div>

## 🎯 What is OMSS?

OMSS is an open standard for streaming media aggregation. It provides a unified API for fetching movie and TV show streaming sources from multiple providers, with built-in proxy support, subtitle handling, and quality selection.

## 🔍 What is `@omss/sdk`?

The `@omss/sdk` is the official TypeScript client library for consuming any OMSS-compliant backend. Instead of manually crafting fetch calls, handling URL construction, and parsing typed responses, developers can use the SDK's ready-made methods — with full TypeScript autocompletion matching the OMSS spec types.

### Key Features

- **Typed Client**: Strongly-typed methods for all OMSS endpoints
- **Unified Result Shape**: Every call returns `{ data, error, status }` — no try/catch needed
- **React Integration**: Optional `OmssProvider` context and `useOmssClient` hook
- **Zero Runtime Dependencies**: Thin `fetch` wrapper — React is only a peer dep for the context
- **Custom Fetch**: Swap in your own `fetch` for SSR, tests, or custom interceptors
- **Auth Headers**: Inject auth tokens via `getDefaultHeaders`
- **Error Typing**: Typed OMSS error codes (e.g. `INVALID_TMDB_ID`, `NO_SOURCES_AVAILABLE`)
- **Full Type Safety**: All OMSS spec entities exported as TypeScript types

## 🚀 Installation

### Prerequisites

- Node.js 18.x or higher
- npm, yarn, or pnpm
- A running OMSS-compliant backend (see [@omss/framework](https://github.com/omss-spec/framework))

### Install the Package

```bash
# npm
npm install @omss/sdk

# yarn
yarn add @omss/sdk

# pnpm
pnpm add @omss/sdk
```

## 🚀 Quick Start

Minimal example — create a client and fetch a movie's streaming sources:

```ts
// omssService.ts
import { createOmssClient } from '@omss/sdk'

export const omssService = createOmssClient({
    baseUrl: 'https://api.example.com', // your OMSS backend base URL
})
```

Use it anywhere in your application:

```ts
import { omssService } from '@omss/sdk'

async function loadMovie(id: string) {
    const { data, error, status } = await omssService.getMovie(id)

    if (error) {
        console.error('Failed to load movie', status, error.error.code, error.error.message)
        return
    }

    // data is a fully typed SourceResponse
    console.log('Sources:', data.sources)
    console.log('Subtitles:', data.subtitles)
}
```

## ⚙️ Configuration

The client constructor (and `OmssProvider`) accept the following config:

```ts
interface OmssClientConfig {
    baseUrl: string                       // e.g. 'https://api.example.com'
    fetchFn?: typeof fetch                // custom fetch (for SSR, tests, etc.)
    getDefaultHeaders?: () => HeadersInit // inject headers on every request
}
```

### Example Configurations

#### Basic

```ts
const omssService = createOmssClient({
    baseUrl: 'https://api.example.com',
})
```

#### With Auth Token

```ts
const omssService = createOmssClient({
    baseUrl: 'https://api.example.com',
    getDefaultHeaders: () => ({
        Authorization: `Bearer ${window.localStorage.getItem('token') ?? ''}`,
    }),
})
```

#### With Custom Fetch (e.g. for SSR or testing)

```ts
import nodeFetch from 'node-fetch'

const omssService = createOmssClient({
    baseUrl: 'https://api.example.com',
    fetchFn: nodeFetch as typeof fetch,
})
```

## 📡 Client API

All methods return `Promise<OmssResult<T>>`:

```ts
interface OmssResult<T> {
    data: T | null           // success payload if HTTP 2xx
    error: ErrorResponse | null // typed OMSS error if HTTP non-2xx
    status: number           // HTTP status code (0 on network error)
}
```

### Available Methods

```ts
import { createOmssClient } from '@omss/sdk'

const client = createOmssClient({ baseUrl: '...' })

// Health / Metadata
client.getHealth():        Promise<OmssResult<HealthResponse>>  // GET /
client.getVersion():       Promise<OmssResult<HealthResponse>>  // GET /v1
client.getHealthStatus():  Promise<OmssResult<HealthResponse>>  // GET /v1/health

// Content
client.getMovie(id: string): Promise<OmssResult<SourceResponse>>
// GET /v1/movies/{id}

client.getTvEpisode(
    id: string,
    season: number,
    episode: number,
): Promise<OmssResult<SourceResponse>>
// GET /v1/tv/{id}/seasons/{season}/episodes/{episode}

// Cache Refresh
client.refreshSource(responseId: string): Promise<OmssResult<RefreshResponse>>
// GET /v1/refresh/{responseId}
```

### Response Shape

The Response Shape follows the OMSS Specification v1.0.0. You can read more about it here: https://github.com/omss-spec/omss-spec/blob/main/spec/v1.0/omss-v1.0.md#6-response-specifications

## ⚛️ React Integration

The SDK ships an optional React context so you don't have to prop-drill your client instance.

### 1) Wrap your app with `OmssProvider`

```tsx
// main.tsx or App.tsx
// and other imports
import { OmssProvider } from '@omss/sdk'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <OmssProvider
            config={{
                baseUrl: 'https://api.example.com',
                // optionally:
                // getDefaultHeaders: () => ({ "foo": 'bar' }),
            }}
        >
            <App />
        </OmssProvider>
    </React.StrictMode>
)
```

### 2) Access the client via `useOmssClient`

```tsx
import { useOmssClient } from '@omss/sdk'

export function MovieButton({ id }: { id: string }) {
    const omss = useOmssClient()

    const handleClick = async () => {
        const { data, error } = await omss.getMovie(id)

        if (error) {
            alert(`Failed to load movie: ${error.error.message}`)
            return
        }

        if (!data || data.sources.length === 0) {
            alert('No sources available')
            return
        }

        console.log('Start playback from:', data.sources.url)
    }

    return <button onClick={handleClick}>Play</button>
}
```

> You can skip the context entirely and just import a shared `omssService` singleton if you prefer.

## 🛡️ Error Handling

When the backend returns an OMSS error response, you get a fully typed `ErrorResponse`:

```ts
const { data, error, status } = await omssService.getMovie('not-a-number')

if (error) {
    console.log(status)              // e.g. 400
    console.log(error.error.code)    // 'INVALID_TMDB_ID'
    console.log(error.error.message) // 'TMDB ID must be numeric'
    console.log(error.traceId)       // for logging/tracing
}
```

Network errors are normalized to `status = 0` with an `INTERNAL_ERROR`-like object and a `traceId` of `"network-error"`, so you can handle all failure modes uniformly.

##  OMSS Compliance

This SDK follows the [OMSS Standard v1.0.0](https://github.com/omss-spec/omss-spec):

-  **Typed API Endpoints**: All v1.0 endpoints covered
-  **Standardized Response Types**: Mirrors OMSS schema exactly
-  **Typed Error Codes**: All OMSS error codes represented
-  **Source Identification**: `responseId` and provider attribution supported
-  **Audio Track Support**: `AudioTrack[]` per source
-  **Subtitle Support**: `Subtitle[]` with format metadata
-  **Quality Indicators**: Resolution-based quality tags typed
-  **Diagnostics**: `Diagnostic[]` per response typed
-  **Cache Refresh**: `refreshSource` endpoint supported

## 📚 Additional Resources

- [OMSS Standard](https://github.com/omss-spec/omss-spec)
- [OMSS Framework (backend)](https://github.com/omss-spec/framework)
- [OMSS Template (starter)](https://github.com/omss-spec/template)
- [OMSS Spec – OpenAPI](https://github.com/omss-spec/omss-spec/blob/main/spec/v1.0/omss-v1.0.yml)

## 🤝 Contributing

Contributions are welcome! Please read [our contributing guidelines](https://github.com/omss-spec/omss-spec/blob/main/CONTRIBUTING.md) before submitting PRs.

## 📄 License

MIT License - see [LICENSE](./LICENSE) file for details.

## 🙏 Acknowledgments

- All maintainers
- OMSS Foundation
