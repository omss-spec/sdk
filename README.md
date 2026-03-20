<div align="center">

# OMSS SDK

A simple TypeScript client and optional React integration for backends that implement the **Open Media Streaming Specification (OMSS)** v1.0.  
It provides a strongly typed wrapper around the OMSS REST API, so you can call methods like:

</div>

```ts
const { data, error } = await omssService.getMovie('155')
```

without worrying about URL construction or response shapes.

> OMSS spec: [omss-spec/omss-spec – `spec/v1.0/omss-v1.0.yml`](https://github.com/omss-spec/omss-spec/blob/main/spec/v1.0/omss-v1.0.yml)

---

## Features

- Typed client for OMSS endpoints (`getMovie`, `getTvEpisode`, `getHealth`, `refreshSource`).
- Unified result shape: `{ data, error, status }` for every call.
- Plain TypeScript usage (no React required).
- Optional React context (`OmssProvider`) + hook (`useOmssClient`) to avoid prop-drilling the client.
- Lightweight: just a thin `fetch` wrapper, no runtime dependencies besides `react` as a peer (for the context).

---

## Installation

```bash
npm install @omss/sdk
# or
yarn add @omss/sdk
# or
pnpm add @omss/sdk
```

---

## Getting started (no React)

If you don’t want hooks, you can just use the plain client object.

```ts
// omssService.ts
import { createOmssClient } from '@omss/sdk'

export const omssService = createOmssClient({
    baseUrl: 'https://api.example.com', // your OMSS backend base URL
})
```

Use it anywhere in your frontend:

```ts
// example.ts
import { omssService } from './omssService'

async function loadMovie(id: string) {
    const { data, error, status } = await omssService.getMovie(id)

    if (error) {
        console.error('Failed to load movie', status, error.error.code, error.error.message)
        return
    }

    if (!data) {
        console.warn('No data returned from OMSS backend')
        return
    }

    // data is a typed SourceResponse
    console.log('Sources:', data.sources)
    console.log('Subtitles:', data.subtitles)
}
```

This matches the style you described:

```ts
const { data, error } = await omssService.getMovie(id)
```

---

## OMSS client API

All methods return `Promise<OmssResult<T>>`:

```ts
interface OmssResult<T> {
    data: T | null // success payload if status is 2xx
    error: ErrorResponse | null // typed error if status is non-2xx
    status: number // HTTP status code (0 on network error)
}
```

Core methods (aligned with OMSS v1.0):

```ts
import { OmssClient, createOmssClient } from '@omss/sdk';

// health / metadata
client.getHealth():      Promise<OmssResult<HealthResponse>>; // GET /
client.getVersion():     Promise<OmssResult<HealthResponse>>; // GET /v1
client.getHealthStatus():Promise<OmssResult<HealthResponse>>; // GET /v1/health

// content
client.getMovie(id: string): Promise<OmssResult<SourceResponse>>;
// GET /v1/movies/{id}

client.getTvEpisode(
  id: string,
  season: number,
  episode: number,
): Promise<OmssResult<SourceResponse>>;
// GET /v1/tv/{id}/seasons/{s}/episodes/{e}

// cache refresh
client.refreshSource(responseId: string): Promise<OmssResult<RefreshResponse>>;
// GET /v1/refresh/{responseId}
```

Types like `SourceResponse`, `Source`, `Subtitle`, `Diagnostic`, `ErrorResponse`, etc., mirror the OMSS spec.

---

## Using with React (optional)

If you later decide to use React context, you can.

### 1) Wrap your app

```tsx
// main.tsx or App.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { OmssProvider } from '@omss/sdk'
import { App } from './App'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <OmssProvider
            config={{
                baseUrl: 'https://api.example.com',
                // optionally:
                // getDefaultHeaders: () => ({ Authorization: 'Bearer xyz' }),
            }}
        >
            <App />
        </OmssProvider>
    </React.StrictMode>
)
```

### 2) Access the client via `useOmssClient`

```tsx
// MovieButton.tsx
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

        // e.g. start playback with data.sources[0].url
        console.log('Start playback from:', data.sources[0].url)
    }

    return <button onClick={handleClick}>Play</button>
}
```

You can ignore this context API completely if you prefer to keep using a single imported `omssService` object.

---

## Configuration

The client constructor (and `OmssProvider`) accept this config:

```ts
interface OmssClientConfig {
    baseUrl: string // e.g. 'https://api.example.com'
    fetchFn?: typeof fetch // custom fetch implementation (e.g. for SSR or tests)
    getDefaultHeaders?: () => HeadersInit // e.g. inject auth headers
}
```

Example with auth:

```ts
const omssService = createOmssClient({
    baseUrl: 'https://api.example.com',
    getDefaultHeaders: () => ({
        Authorization: `Bearer ${window.localStorage.getItem('token') ?? ''}`,
    }),
})
```

---

## Error handling

When the backend returns one of the OMSS error responses (e.g. `INVALID_TMDB_ID`, `NO_SOURCES_AVAILABLE`, etc.), you get a typed `ErrorResponse`:

```ts
const { data, error, status } = await omssService.getMovie('not-a-number')

if (error) {
    console.log(status) // e.g. 400
    console.log(error.error.code) // 'INVALID_TMDB_ID'
    console.log(error.error.message) // 'TMDB ID must be numeric'
    console.log(error.traceId) // for logging/tracing
}
```

Network errors are normalized to `status = 0` with an `INTERNAL_ERROR`-like object and a `traceId` of `"network-error"` so you can handle them uniformly.

---

## Type safety

The SDK ships with TypeScript definitions for all OMSS entities you typically use on the frontend:

- `HealthResponse`
- `SourceResponse`, `Source`, `AudioTrack`, `Subtitle`, `Provider`, `Diagnostic`
- `RefreshResponse`
- `ErrorResponse`, `ErrorObject`, `ErrorCode`
- `OmssResult<T>`

This means your editor/IDE will autocomplete fields like `data.sources[0].quality`, `data.subtitles[0].format`, or `error.error.code` according to the OMSS spec.

---

## Development

If you're hacking on the SDK itself:

```bash
git clone https://github.com/omss-spec/sdk.git
cd sdk
npm install
npm run build
```
