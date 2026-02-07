# GEMINI.md - Instructional Context for TaskPathPal (SRSM)

This document provides a comprehensive overview of the TaskPathPal (Service Request Management System) project to guide future development and maintenance.

## Project Overview

TaskPathPal is an enterprise-grade Service Request Management System (SRSM) built with a focus on role-based support workflows. It transforms chaotic support requests into trackable, streamlined processes.

### Main Technologies
- **Frontend:** Next.js 15 (App Router), React 18, Tailwind CSS, Shadcn UI.
- **Backend:** Supabase (PostgreSQL), Next.js Server Actions.
- **ORM:** Prisma 7.3.0.
- **State Management:** React Context (Auth), Server Actions.
- **Validation:** Zod.
- **Authentication:** Custom session management using JOSE (JWT) and cookies.

### Core Architecture
- **Multi-Role Portals:** Four distinct user portals: Admin, HOD (Head of Department), Technician, and Requestor.
- **RBAC:** Role-Based Access Control managed via the `user_roles` table.
- **Database:** PostgreSQL hosted on Neon (connected via Prisma with `@prisma/adapter-pg`).
- **Views vs Pages:** Core logic is often contained in the `src/views/` directory, which is then rendered by the respective `src/app/` route components.

---

## Building and Running

### Prerequisites
- Node.js >= 18.0.0
- npm (or bun/pnpm)
- A running PostgreSQL database (Neon/Supabase)

### Installation
```bash
npm install
```

### Environment Setup
Create a `.env` file in the root directory with the following variables:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
DATABASE_URL="postgresql://user:password@host:port/dbname?sslmode=require"
```

### Database Management
- **Introspect Database:** `npx prisma db pull`
- **Generate Client:** `npx prisma generate`
- **Seed Data:** `npx prisma db seed` (Requires `tsx`)
- **Note:** Prisma 7 configuration is managed in `prisma.config.ts`.

### Running Development Server
```bash
npm run dev
```

---

## Development Conventions

### 1. Data Fetching and Mutations
- **Server Actions:** All data interactions should preferably use Next.js Server Actions located in `src/app/actions/`.
- **Response Format:** Server actions should follow a consistent return type: `{ data: T | null, error: string | null }`.
- **Date Serialization:** Dates returned from Prisma should be serialized to ISO strings (via `.toISOString()`) before being sent to client components to avoid serialization errors.

### 2. UI Components
- **Shadcn UI:** Use existing components in `src/components/ui/`.
- **Tailwind CSS:** Follow the project's utility-first styling approach.
- **Responsive Design:** Ensure all new features are mobile-friendly as per the project's mandates.

### 3. Database Interactions
- **Prisma Client:** Use the singleton instance provided in `src/lib/prisma.ts`.
- **Adapters:** The project uses `@prisma/adapter-pg` for database connections. Ensure new scripts (like seeds or checks) also use this adapter for consistency.
- **Unique Constraints:** Be aware that some fields (like `system_name` or `request_no`) may not have `@unique` constraints in the schema; use `findFirst` instead of `findUnique` for lookups on these fields.

### 4. Authentication
- Use the `useAuth` hook from `src/contexts/AuthContext.tsx` to access the current user and their role in client components.
- Check permissions in server actions using the session and `user_roles` lookup.

### 5. Seeding and Testing
- The primary seed script is `prisma/seed.ts`. It is designed to be idempotent using manual existence checks.
- For quick data verification, `check_data.ts` can be used via `npx tsx check_data.ts`.

---

## Key File Locations
- `/src/app/`: Next.js App Router pages and layouts.
- `/src/views/`: Main view components for different portals.
- `/src/app/actions/`: Server actions for database operations.
- `/prisma/schema.prisma`: Database model definition.
- `/prisma/seed.ts`: Database seed script.
- `/src/lib/prisma.ts`: Prisma Client initialization with PostgreSQL adapter.
