<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture
- Frontend-only: UI calls typed services (`src/services/interfaces.ts`) via `services` in `src/services/mocks.ts`; swap that export for an Electron IPC adapter later. Never call Node/Electron/fs from components.
- App data + prefs live in one persisted zustand store (`src/stores/app-store.ts`, `skipHydration`, rehydrated in AppShell); pages render only after hydration to avoid SSR mismatch.
- Zustand selectors that return new arrays must use `useShallow`, or React loops infinitely.
- Routing is TanStack Router (fixed by the platform), not React Router.
