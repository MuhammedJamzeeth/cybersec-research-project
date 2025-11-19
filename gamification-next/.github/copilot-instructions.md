# Gamification Next.js - AI Coding Instructions

## Project Overview
This is a cybersecurity awareness gamification platform built with Next.js 16 (App Router), React 19, TypeScript, and Tailwind CSS v4. The app assesses users' cybersecurity knowledge across five key topics through interactive assessments.

## Tech Stack
- **Framework**: Next.js 16.0.1 (App Router architecture)
- **React**: 19.2.0 (latest with React 19 features)
- **TypeScript**: Strict mode enabled
- **Styling**: Tailwind CSS v4 with PostCSS, shadcn/ui components
- **Package Manager**: pnpm (use `pnpm` commands, not npm)
- **Fonts**: Geist Sans and Geist Mono via `next/font/google`

## Project Architecture

### Directory Structure
```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout with font configuration
│   ├── page.tsx           # Home page (landing/dashboard)
│   ├── globals.css        # Tailwind imports + theme variables
│   ├── (auth)/            # Auth route group (login, register)
│   ├── categories/        # Category pages with assessments
│   └── api/               # API routes for backend logic
├── components/            # Reusable React components
│   ├── ui/               # shadcn/ui components
│   ├── Header.tsx        # Navigation with auth state
│   ├── Footer.tsx        # Site footer
│   └── CategoryCard.tsx  # Topic cards on homepage
├── lib/                   # Utilities and shared logic
│   ├── utils.ts          # Helper functions (cn, etc.)
│   └── auth.ts           # Authentication utilities
└── types/                 # TypeScript type definitions
```

### Core Features & Data Flow
1. **Authentication Flow**: Users must log in to access category assessments
   - Unauthenticated users see home page with 5 topic cards
   - Clicking a card prompts login/register
   - After auth, username appears in header (top-right) with profile/logout dropdown

2. **Cybersecurity Categories** (5 topics):
   - Password Management
   - Social Media Privacy
   - Safe Browsing
   - Phishing Awareness
   - Mobile App Permissions

3. **Assessment System**: First-time category visits show knowledge assessment form
   - Questions are category-specific
   - Results stored per user/category
   - Subsequent visits show progress/gamification elements

## Development Conventions

### Styling Patterns
- **Tailwind CSS v4**: Use new Tailwind syntax (check `globals.css` for theme variables)
- **Theme Variables**: Define CSS custom properties in `:root` and `@theme inline`
  ```css
  :root {
    --background: #ffffff;
    --foreground: #171717;
  }
  @theme inline {
    --color-background: var(--background);
  }
  ```
- **Dark Mode**: Use media query approach (`@media (prefers-color-scheme: dark)`)
- **Component Classes**: Use shadcn/ui conventions with `cn()` utility for merging classes

### TypeScript Best Practices
- **Strict Mode**: Enabled - all types must be explicit
- **Path Alias**: Use `@/*` for imports from `src/` (e.g., `import { Button } from "@/components/ui/button"`)
- **Type Safety**: Define interfaces in `src/types/` for user data, assessment questions, etc.

### Component Patterns
- **Server Components**: Default for all components unless client interactivity needed
- **Client Components**: Mark with `"use client"` directive for hooks, event handlers, auth state
- **Metadata**: Define `metadata` export for SEO in page.tsx files
- **Fonts**: Already configured in `layout.tsx` - use CSS variables (`--font-geist-sans`, `--font-geist-mono`)

### Authentication Integration
- Store auth state using appropriate method (consider Next.js server actions or API routes)
- Header component should conditionally render:
  - Guest: "Login" link
  - Authenticated: Username + dropdown (Profile Settings, Logout)
- Protect category routes - redirect to login if unauthenticated

## Development Workflow

### Running the Project
```bash
pnpm install        # Install dependencies
pnpm dev           # Start dev server (http://localhost:3000)
pnpm build         # Production build
pnpm start         # Run production server
pnpm lint          # Run ESLint
```

### Adding shadcn/ui Components
```bash
pnpm dlx shadcn@latest add button card form input
```
Components install to `src/components/ui/` - import as `@/components/ui/[component]`

### File Creation Guidelines
1. **New Pages**: Create in `src/app/[route]/page.tsx`
2. **API Routes**: Create in `src/app/api/[endpoint]/route.ts`
3. **Components**: Reusable in `src/components/`, UI primitives in `src/components/ui/`
4. **Types**: Shared interfaces in `src/types/[feature].ts`

## Key Implementation Notes

### Category Cards (Homepage)
Create 5 cards with:
- Icon representing the topic
- Title and brief description
- Click handler that checks auth state
- Redirect to `/categories/[slug]` if authenticated, `/login?redirect=/categories/[slug]` if not

### Assessment Forms
- Each category has unique questions (5-10 questions recommended)
- Store responses in database/local storage with user ID + category ID
- Track completion status and scores
- Show form only on first visit (check user's completed categories)

### Header Component
- Responsive navigation: "Home", "About"
- Right side: 
  - Unauthenticated: "Login" button
  - Authenticated: User avatar/name + dropdown menu (Profile Settings, Logout)
- Sticky positioning recommended for better UX

## Common Patterns from Existing Code

### Tailwind Utility Classes
- Flexbox centering: `flex items-center justify-center`
- Responsive design: Use `sm:`, `md:`, `lg:` prefixes
- Dark mode: `dark:` prefix for dark theme styles
- Spacing: Follow existing patterns (e.g., `gap-4`, `px-16`, `py-32`)

### Next.js Image Usage
```tsx
import Image from "next/image";
// Optimize with priority for above-fold images
<Image src="/icon.svg" alt="..." width={100} height={100} priority />
```

## Dependencies & Extensions
- Install auth library as needed (NextAuth.js, Clerk, or similar)
- Consider form library: React Hook Form for assessment forms
- State management: React Context or Zustand for auth state
- Database: Add Prisma, Supabase, or MongoDB for persistence

## Testing & Quality
- Run `pnpm lint` before committing
- Test responsive layouts at mobile, tablet, desktop breakpoints
- Verify dark mode styling across all components
- Check auth flows thoroughly (login, register, protected routes, logout)

## Important Reminders
- This is a **gamification education platform**, not a security testing tool
- Focus on user engagement and clear knowledge assessment
- Keep UI clean, accessible, and mobile-friendly
- Document any external API integrations (if added later)
