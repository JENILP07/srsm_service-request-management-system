# Repository Guidelines

## Project Structure & Module Organization
- `src/app/` contains Next.js App Router routes, layouts, and server actions under `src/app/actions/`.
- `src/views/` holds feature-rich view components that are rendered by route components.
- `src/components/` and `src/components/ui/` provide shared UI primitives (shadcn-style) and higher-level components.
- `src/contexts/`, `src/hooks/`, `src/lib/`, and `src/types/` are for state, shared utilities, and types.
- `prisma/` contains schema and seed scripts. `public/` stores static assets.

## Build, Test, and Development Commands
- `npm run dev` starts the local Next.js dev server.
- `npm run build` builds the production bundle.
- `npm run start` serves the production build.
- `npm run lint` runs ESLint on the codebase.
- `npm run build:dev` runs a Vite build in development mode (legacy/auxiliary).
- Prisma helpers: `npx prisma db pull`, `npx prisma generate`, `npx prisma db seed`.
- Quick data check: `npx tsx check_data.ts`.

## Coding Style & Naming Conventions
- TypeScript + React with Tailwind CSS utilities.
- 2-space indentation and no semicolons, matching existing files in `src/`.
- Prefer server actions in `src/app/actions/` with consistent return shape: `{ data, error }`.
- For roles and permissions, use `user_roles` lookups; for non-unique fields use `findFirst`.

## Testing Guidelines
- No automated test framework is configured yet.
- If you add tests, document how to run them and keep naming consistent with the tool you introduce (e.g., `*.spec.tsx`).

## Commit & Pull Request Guidelines
- Recent commits use short, imperative descriptions without a strict convention. Keep messages concise and scoped (e.g., "Fix status check").
- PRs should include a clear summary, linked issues if applicable, and screenshots for UI changes.

## Configuration & Security Notes
- Create a local `.env` with `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `DATABASE_URL`.
- Prisma config lives in `prisma.config.ts`; use the shared Prisma client in `src/lib/prisma.ts`.
