# GnoseonX

A Discord-style real-time chat platform with neumorphic dark design, status stories, voice/video calls, and location sharing — running entirely on mock data.

## Run & Operate

- Workflow: `artifacts/gnoseonx: web` — starts the Vite dev server for the frontend
- `pnpm --filter @workspace/gnoseonx run dev` — run frontend manually (port auto-assigned)
- `pnpm run typecheck` — full typecheck across all packages

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React 19 + Vite + Tailwind v4 (neumorphic dark theme)
- State: Zustand (`artifacts/gnoseonx/src/store/appStore.ts`)
- Data: 100% mock data, no backend or database needed
- Fonts: Inter + JetBrains Mono (Google Fonts)

## Where things live

- `artifacts/gnoseonx/` — the main frontend artifact (react-vite, previewPath: `/`)
- `artifacts/gnoseonx/src/index.css` — source of truth for the GnoseonX theme (CSS vars + Tailwind v4 @theme)
- `artifacts/gnoseonx/src/lib/mockData.ts` — all mock data (users, servers, messages, DMs, notifications)
- `artifacts/gnoseonx/src/store/appStore.ts` — global Zustand state
- `artifacts/gnoseonx/src/types/index.ts` — shared TypeScript types
- `artifacts/gnoseonx/src/components/` — all UI components (layout, auth, chat, call, status, ui)

## Architecture decisions

- All data is mock/in-memory — no API server or database needed for the current feature set
- Zustand for global state management (not React Query) since there's no real API
- Tailwind v4 with `@theme inline` to map custom CSS vars (--violet, --bg, --neu-*) to utility classes
- `"use client"` directives from the original Next.js app are harmless no-ops in Vite (React components are always client-side)

## Product

- Login (mock auth, any credentials work)
- Discord-like chat with servers, channels, and direct messages
- Status stories (ephemeral user status updates)
- Voice/video call modal
- Friends list and location view
- Notifications panel
- Neumorphic dark purple UI with violet, neon green, and lava red accents

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- No real backend or database — all data lives in Zustand store and resets on page refresh
- The app uses Tailwind v4 (`@tailwindcss/vite`), NOT the legacy v3 PostCSS plugin — `postcss.config.mjs` must NOT be present
- Custom Tailwind color utilities (e.g. `bg-bg`, `text-violet`, `shadow-neu-flat`) are defined in `src/index.css` via `@theme inline`

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
