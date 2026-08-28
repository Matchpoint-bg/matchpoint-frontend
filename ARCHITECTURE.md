# Front-end architecture

The source follows a small feature-oriented structure. The goal is predictable ownership,
not a framework inside the framework.

## Layers

Dependencies flow downward:

```text
app -> pages -> features -> shared
                    \-> demo
```

- `app/` wires providers, routes, guards, and the application shell.
- `pages/` coordinate a route. They compose queries and feature UI but do not implement HTTP.
- `features/` own domain behavior. Each feature may contain `api/`, `model/`, and `ui/`.
- `shared/` contains code that has no MatchPoint domain knowledge.
- `demo/` is the development data source used by feature API modules.

## Feature public APIs

Every feature exposes its supported page/app surface through `features/<name>/index.ts`.
Pages and app composition import from that public entry point. Code inside a feature uses
direct relative imports; low-level cross-feature type/query-key dependencies may also import
their exact module to avoid pulling a sibling feature's aggregate barrel into a cycle.

Component folders expose a small local `index.ts`, for example:

```text
ui/CourtCard/
  CourtCard.tsx
  CourtCard.module.css
  index.ts
```

Do not turn root indexes into wildcard re-export files. Export only names that callers are
expected to use.

## Server state

TanStack Query is the only server-state layer:

- Query keys live beside the feature query hooks in `model/*.queries.ts`.
- Components consume named hooks such as `useClubQuery`; they do not call `fetch` directly.
- Writes use `useMutation` and invalidate the narrow domain key families they affect.
- Query keys include the demo/API scope, and the cache is cleared on login, logout, demo
  changes, API URL changes, and terminal session expiry.
- UI-only state stays local (`useState`) or in a focused provider. It does not belong in the
  Query cache.

## Styling

Component-specific styles are colocated as CSS modules. Files under `styles/` are reserved
for tokens and cross-app primitives such as the shell, buttons, forms, overlays, and booking
grid. Avoid adding feature-specific rules to those files when a component module can own them.

## Adding a feature

1. Add domain types and API operations under the feature.
2. Wrap reads and writes in named query/mutation hooks.
3. Build feature UI in component folders with local indexes and CSS modules.
4. Export only the required public surface from the feature root index.
5. Keep the route page focused on composition, navigation, and loading/error/empty states.
