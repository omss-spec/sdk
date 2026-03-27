<div align="center">

# OMSS SDK

[![NPM Version](https://img.shields.io/npm/v/@omss/sdk.svg)](https://www.npmjs.com/package/@omss/sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-blue.svg)](https://www.typescriptlang.org/)
[![OMSS Spec](https://img.shields.io/badge/OMSS-v1.0.0-orange.svg)](https://github.com/omss-spec/omss-spec)

A strongly typed TypeScript client for backends that implement the **OMSS (Open Media Streaming Standard)**. It provides a thin, zero-dependency wrapper around the OMSS REST API so you can fetch streaming sources with a single line:

```ts
const { data, error } = await omssService.getMovie('155')
```

---

</div>

## 🎯 What is OMSS?

OMSS is an open standard for streaming media aggregation. It provides a unified API for fetching movie and TV show streaming sources from multiple providers, with built-in proxy support, subtitle handling, and quality selection.

---

## 🔍 What is `@omss/sdk`?

The `@omss/sdk` is the official TypeScript client library for consuming any OMSS-compliant backend.

Instead of manually crafting fetch calls, handling URL construction, and parsing typed responses, developers can use the SDK's ready-made methods — with full TypeScript autocompletion matching the OMSS spec types.

---

## ✨ Key Features

* **Typed Client**: Strongly-typed methods for all OMSS endpoints
* **Unified Result Shape**: Every call returns `{ data, error }` — no try/catch needed
* **Zero Runtime Dependencies**: Thin `fetch` wrapper
* **Custom Fetch**: Swap in your own `fetch` for SSR, tests, or interceptors
* **Auth Headers**: Inject headers via `getDefaultHeaders`
* **Error Typing**: Typed OMSS error codes
* **Framework Agnostic**: Works with React, Vue, Angular, or vanilla JS
* **Full Type Safety**: All OMSS spec entities exported

---

## 🚀 Installation

```bash
npm install @omss/sdk
```

---

## 🚀 Quick Start

```ts
import { createOmssClient } from '@omss/sdk'

export const omssService = createOmssClient({
    baseUrl: 'https://api.example.com',
})
```

```ts
const { data, error } = await omssService.getMovie('155')

if (error) {
    console.error(error.error.code, error.error.message)
    return
}

console.log(data.sources)
```

---

## ⚙️ Configuration

```ts
interface OmssClientConfig {
    baseUrl: string
    fetchFn?: typeof fetch
    getDefaultHeaders?: () => HeadersInit
}
```

---

## 📡 Client API

All methods return:

```ts
export type OmssResult<T> =
    | { data: T; error: null }
    | { data: null; error: ErrorResponse }
```

meaning it is either an error or data. One `if` check is enough.

---

### Available Methods

```ts
import { createOmssClient } from '@omss/sdk'

const client = createOmssClient({ baseUrl: '...' })

// Health
client.getHealth()
client.getVersion()
client.getHealthStatus()

// Sources
client.getMovie(id: string)
client.getTvEpisode(id: string, season: number, episode: number)

// Cache
client.refreshSource(responseId: string)

// Runtime Config change
client.getBaseUrl()
client.setBaseUrl(newBaseUrl: string)
```

---

## 🛡️ Error Handling

```ts
const { data, error } = await omssService.getMovie('invalid')

if (error) {
    console.log(error.error.code)
    console.log(error.error.message)
    console.log(error.traceId)
}
```

Network errors are normalized into an `INTERNAL_ERROR` with:

```ts
traceId: 'network-error'
```

---

# 🧩 Framework Integration

The SDK is **framework-agnostic**. You can create your own context/provider pattern depending on your framework.

---

## ⚛️ React Example

### Create Context

```tsx
import { createContext, useContext } from 'react'
import { createOmssClient, OmssClient } from '@omss/sdk'

const OmssContext = createContext<OmssClient | null>(null)

export function OmssProvider({ children }: { children: React.ReactNode }) {
    const client = createOmssClient({
        baseUrl: 'https://api.example.com',
    })

    return (
        <OmssContext.Provider value={client}>
            {children}
        </OmssContext.Provider>
    )
}

export function useOmssClient() {
    const ctx = useContext(OmssContext)
    if (!ctx) throw new Error('OmssProvider missing')
    return ctx
}
```

---

## 🟢 Vue (Composition API)

```ts
import { inject, provide } from 'vue'
import { createOmssClient } from '@omss/sdk'

const OMSS_KEY = Symbol('omss')

export function provideOmss() {
    const client = createOmssClient({
        baseUrl: 'https://api.example.com',
    })

    provide(OMSS_KEY, client)
}

export function useOmssClient() {
    const client = inject(OMSS_KEY)
    if (!client) throw new Error('OMSS not provided')
    return client
}
```

---

## 🅰️ Angular

```ts
import { Injectable } from '@angular/core'
import { createOmssClient, OmssClient } from '@omss/sdk'

@Injectable({ providedIn: 'root' })
export class OmssService {
    private client: OmssClient

    constructor() {
        this.client = createOmssClient({
            baseUrl: 'https://api.example.com',
        })
    }

    getMovie(id: string) {
        return this.client.getMovie(id)
    }
}
```

---

# 🧠 Design Philosophy

* The SDK is **transport-focused**, not framework-bound
* Framework integrations are thin wrappers around `OmssClient`
* You can share the same client across environments (SSR, browser, tests)

---

## 📚 Additional Resources

* [OMSS Standard](https://github.com/omss-spec/omss-spec)
* [OMSS Framework](https://github.com/omss-spec/framework)
* [OMSS Template](https://github.com/omss-spec/template)

---

## 📄 License

[MIT License](./LICENSE)
