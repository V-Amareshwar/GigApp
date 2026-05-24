# GigWork

A full-stack gig-based local job marketplace for India, connecting daily wage workers (seekers) with employers (providers).

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080, proxied at `/api`)
- `pnpm --filter @workspace/gigwork run dev` — run the frontend (port 23524, proxied at `/`)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string, `SESSION_SECRET` — JWT signing key

## Test Credentials

- **Provider:** phone=`9876543210`, password=`password123` (Ravi Kumar, Mumbai)
- **Provider:** phone=`9876543211`, password=`password123` (Priya Sharma, Delhi)
- **Seeker:** phone=`9123456780`, password=`password123` (Suresh Yadav, Mumbai)
- **Seeker:** phone=`9123456781`, password=`password123` (Meena Devi, Delhi)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, wouter, TanStack Query, shadcn/ui, framer-motion
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)
- Auth: Custom JWT (HMAC-SHA256 with SESSION_SECRET), stored in localStorage as `gigwork_token`

## Where things live

- `lib/api-spec/openapi.yaml` — Source of truth for all API contracts
- `lib/db/src/schema/` — Drizzle ORM table definitions (users, categories, jobs, applications, reviews, chat, notifications)
- `lib/api-client-react/src/generated/` — Orval-generated React Query hooks and Zod schemas (do not edit)
- `artifacts/api-server/src/routes/` — Express route handlers (auth, users, categories, jobs, applications, reviews, chat, notifications, stats)
- `artifacts/api-server/src/lib/auth.ts` — JWT sign/verify, requireAuth middleware
- `artifacts/api-server/src/lib/userSerializer.ts` — Converts DB row + profiles to API response shape
- `artifacts/gigwork/src/pages/` — All 15 frontend pages
- `artifacts/gigwork/src/context/AuthContext.tsx` — Auth state, login/logout, role-based redirects

## Architecture decisions

- Contract-first: OpenAPI spec → codegen → React hooks + Zod schemas. Never write raw fetch or manual query hooks.
- `current_role` is a PostgreSQL reserved word — must be quoted as `"current_role"` in raw SQL but works fine through Drizzle ORM.
- JWT stored in localStorage, injected into every request via `setAuthTokenGetter()` from `@workspace/api-client-react/custom-fetch`.
- DB uses text UUIDs (`$defaultFn(() => crypto.randomUUID())`) not native PostgreSQL uuid type to avoid driver serialization issues.
- Decimal/numeric DB columns come back as strings from pg driver — `userSerializer.ts` does `parseFloat`/`parseInt` conversions.
- Password hash: `HMAC-SHA256(password, SESSION_SECRET)` — simple and fast, no bcrypt dependency needed for MVP.

## Product

- **Seekers** browse and apply to jobs, track applications by status, chat with employers, manage their profile and skills, view reviews.
- **Providers** post jobs (hourly/daily/monthly), review applicants, accept/reject with notes, view dashboard stats, chat with hired workers.
- **Both roles** can exist on the same account (role switch in profile/settings).

## User preferences

_None recorded yet._

## Gotchas

- Always run `pnpm --filter @workspace/api-spec run codegen` after changing `openapi.yaml` — both Zod schemas and React hooks regenerate.
- Orval generates `{OperationId}Params` for path params AND a TypeScript type with the same name for operations with BOTH path + query params — causes TS collision. Fix: remove query params from such operations or rename the operation.
- The `api-server` workflow rebuilds the esbuild bundle on every start. Large bundle (~2.3MB) is expected.
- Do NOT run `pnpm dev` at workspace root — no dev script at root by design.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
