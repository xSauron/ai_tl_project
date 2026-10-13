# MikroORM + Next.js: never share the ORM across module layers

## Symptom
`MetadataError: Metadata for entity h not found` (minified `Garden`) — but only depending on request order:
hitting `/api/health` (Route Handler) first broke `/admin/gardens` (Server Component), and vice versa.

## Root cause
Next.js evaluates server code in separate module **layers** (Server Components, Route Handlers, Server Actions).
Each layer has its own instance of every bundled module, including `@plant-ai/core` and therefore its own
`Garden` class. The ORM was cached on `globalThis`, so the first layer's ORM (with metadata keyed to *its*
`Garden` class) was reused by other layers. MikroORM 7 matches entities **by class reference**
(`Utils.normalizeEntityRef` keeps class refs), so the other layer's `Garden` was unknown.

## What did not work
- `serverExternalPackages: ["@plant-ai/core"]` — Turbopack still bundles workspace packages (realpath is
  outside `node_modules`), so the setting is ignored for them.

## Fix
`getOrm()` / `getContainer()` cache at **module level** (no `globalThis`). Each layer gets its own ORM and pool
(size `DB_POOL_MAX` per layer). In dev, HMR re-creates the ORM; old pools drain via idle timeout (`DB_POOL_MIN=0`).

## Verification
Fresh `next start`, request order Route Handler → Server Component → Server Action (form POST) all succeed.
