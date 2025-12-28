# AGENTS.md - Coding Agent Guidelines

This document provides guidelines for AI coding agents working in this repository.

## Project Overview

A Next.js 16 reading list application with Supabase backend, featuring:
- Next.js App Router with Server and Client Components
- Supabase for authentication and PostgreSQL database
- Tailwind CSS 4 with shadcn/ui components (New York style)
- Vercel AI SDK for embeddings and text generation
- Biome for linting and formatting (not ESLint/Prettier)
- Bun as the package manager/runtime

## Build/Lint/Test Commands

```bash
# Development
bun run dev              # Start Next.js dev server

# Build
bun run build            # Build for production
bun run start            # Start production server

# Linting & Formatting
bun run lint             # Run Biome linter
bun run lint:fix         # Run Biome linter with auto-fix
bun run check            # Run Biome check (lint + format)
bun run check:fix        # Run Biome check with auto-fix
bun run format           # Format code with Biome

# Type Generation
bun run types:local      # Generate Supabase TypeScript types

# Single file lint
bunx @biomejs/biome check path/to/file.ts
bunx @biomejs/biome check --write path/to/file.ts  # with auto-fix
```

**Note:** No test framework is currently configured.

## Code Style Guidelines

### Formatting (Biome enforced)

- **Indentation:** 2 spaces
- **Quotes:** Single quotes for JS/TS
- **Semicolons:** Omit when possible (ASI)
- **Trailing commas:** ES5 style
- **Line width:** 80 characters
- **Line endings:** LF

### Import Ordering

1. Third-party libraries (`ai`, `next`, `react`)
2. Path alias imports (`@/lib/...`, `@/components/...`)
3. Relative imports (`./globals.css`)

```typescript
// Correct ordering
import { generateText } from 'ai'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
```

### Type Imports

Use `import type` for type-only imports (Biome enforced):

```typescript
import type React from 'react'
import type { Metadata } from 'next'
import type { Database } from './types/database.types'
```

### Path Aliases

Always use `@/*` for internal imports (maps to project root):

```typescript
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'
```

### TypeScript Patterns

**Types vs Interfaces:**
- Use `interface` for component props
- Use `type` for data shapes and unions

```typescript
// Props use interface
interface ReadingCardProps {
  reading: Reading
  onUpdate: (updater: (prev: Reading[]) => Reading[]) => void
  showSimilarity?: boolean
}

// Data shapes use type
type Reading = {
  id: string
  url: string
  title: string
  og_image: string | null
  is_read: boolean
  created_at: string
}
```

**Nullable types:** Use explicit `| null`:
```typescript
const [error, setError] = useState<string | null>(null)
```

**Generic patterns:**
```typescript
return createBrowserClient<Database>(...)
function Input({ className, ...props }: React.ComponentProps<'input'>)
```

### Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Files | kebab-case | `add-article-form.tsx` |
| Components | PascalCase | `AddArticleForm` |
| Functions/Variables | camelCase | `handleSubmit` |
| Props interfaces | PascalCase + Props | `ReadingCardProps` |
| Boolean state | `is` prefix | `isLoading`, `isUpdating` |
| Event handlers | `handle` prefix | `handleClick`, `handleSubmit` |
| Database columns | snake_case | `created_at`, `user_id` |

### React Component Patterns

**Server Components (default):** No directive needed
```typescript
// app/page.tsx - Server Component
export default async function HomePage() {
  const data = await fetchData()
  return <div>{data}</div>
}
```

**Client Components:** Add `"use client"` directive
```typescript
'use client'

import { useState } from 'react'

export function InteractiveComponent() {
  const [state, setState] = useState(false)
  // ...
}
```

**Component structure:**
- Use function declarations (not arrow functions)
- Destructure props with rest operator
- Use `cn()` for class merging

```typescript
function Button({ className, variant, ...props }: ButtonProps) {
  return (
    <button className={cn(buttonVariants({ variant }), className)} {...props} />
  )
}
```

### Error Handling

**API Routes:**
```typescript
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // ... business logic

  } catch (error) {
    console.error('Operation failed:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

**Client-side:**
```typescript
try {
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  router.push('/dashboard')
} catch (error: unknown) {
  setError(error instanceof Error ? error.message : 'An error occurred')
} finally {
  setIsLoading(false)
}
```

### API Route Patterns

- Location: `app/api/[endpoint]/route.ts`
- Export HTTP methods as named functions: `POST`, `GET`
- Always verify authentication first
- Use `NextResponse.json()` for responses

```typescript
export async function POST(request: Request) {
  const { url } = await request.json()

  // Auth check
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Business logic...
  return NextResponse.json({ success: true, data: result })
}
```

### Supabase Patterns

```typescript
// Server-side client
import { createClient } from '@/lib/supabase/server'
const supabase = await createClient()

// Client-side client
import { createClient } from '@/lib/supabase/client'
const supabase = createClient()

// Query pattern
const { data, error } = await supabase
  .from('readings')
  .select('*')
  .eq('user_id', user.id)
  .order('created_at', { ascending: false })

if (error) {
  console.error('Query failed:', error)
}
```

### shadcn/ui Components

- Located in `components/ui/`
- Use `cva` for variant definitions
- Support `asChild` prop with Radix UI Slot
- Add `data-slot` attribute for styling hooks

## Project Structure

```
app/                    # Next.js App Router
  api/                  # API routes
  auth/                 # Auth pages
  dashboard/            # Dashboard page
  layout.tsx            # Root layout
  page.tsx              # Home page

components/             # React components
  ui/                   # shadcn/ui primitives

lib/                    # Utilities
  supabase/             # Supabase clients & types
  utils.ts              # Utility functions

supabase/               # Supabase local config
  migrations/           # Database migrations
```

## Common Gotchas

1. **Biome, not ESLint:** This project uses Biome for linting/formatting
2. **Bun, not npm:** Use `bun` commands instead of `npm`
3. **No tests:** No test framework is configured
4. **TypeScript errors ignored:** `ignoreBuildErrors: true` in next.config.mjs
5. **Unoptimized images:** Image optimization disabled in Next.js config
6. **Server Components default:** Only add `"use client"` when needed
