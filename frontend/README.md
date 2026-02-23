# Bakery Management Frontend

Production-ready Next.js frontend for the bakery management system.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Client State**: React Hooks
- **API Integration**: Fetch API with centralized client

## Project Structure

```
src/
├── app/                 # App Router pages and layouts
│   ├── (auth)/         # Authentication routes (grouped layout)
│   ├── (dashboard)/    # Dashboard routes (grouped layout)
│   ├── layout.tsx      # Root layout with Header
│   ├── page.tsx        # Landing page
│   └── globals.css     # Global Tailwind styles
├── components/
│   ├── ui/            # Reusable UI components (Button, Input)
│   ├── layout/        # Layout components (Header, Sidebar)
│   └── forms/         # Form components (LoginForm, RegisterForm)
├── lib/
│   ├── api.ts         # Centralized API client
│   └── constants.ts   # App-wide constants and routes
└── types/
    └── index.ts       # TypeScript type definitions
```

## Getting Started

### Prerequisites
- Node.js 18+
- npm/yarn/pnpm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## Architecture Decisions

### 1. Server Components by Default
- All pages and layout components are Server Components
- Reduces JavaScript sent to the browser
- Improves performance and SEO

### 2. Client Components Only When Needed
- Form components use `'use client'` directive
- Only components with interactivity are marked as client components
- Maintains separation of concerns

### 3. Centralized API Client
- All backend requests go through `lib/api.ts`
- Ensures consistent error handling and logging
- Ready for auth token injection and refresh logic

### 4. Type Safety
- Strict TypeScript configuration
- All types defined in `types/index.ts`
- No `any` types allowed

### 5. Constants Over Hardcoding
- Routes, API endpoints, validation rules in `lib/constants.ts`
- Easy to maintain and update across the app
- Single source of truth for configuration

### 6. Modular Components
- Small, focused, reusable components
- Clear props contracts
- Barrel exports for organized imports

## Authentication Integration

The app is structured and ready for authentication:

1. Update `LoginForm` and `RegisterForm` to call backend API
2. Create `lib/auth.ts` for auth utilities (token storage, refresh)
3. Create middleware for protected routes
4. Add Supabase client configuration when needed

## API Integration

To integrate with the Node.js backend:

1. Update `NEXT_PUBLIC_API_URL` in `.env.local`
2. Use `apiClient` from `lib/api.ts` in pages/components
3. Extend types in `types/index.ts` with backend schemas

Example:
```typescript
import { apiClient } from '@/lib/api';

const data = await apiClient.get<Product[]>('/api/products');
```

## Component Usage

### Button Component
```tsx
import { Button } from '@/components/ui';

<Button variant="primary" size="lg" onClick={() => {}}>
  Click me
</Button>
```

### Input Component
```tsx
import { Input } from '@/components/ui';

<Input
  label="Email"
  type="email"
  placeholder="user@example.com"
  required
/>
```

## Future Enhancements

- [ ] Authentication with Supabase
- [ ] Protected routes middleware
- [ ] State management (Context API or Zustand)
- [ ] Form validation library (Zod)
- [ ] Error boundary components
- [ ] Loading skeletons
- [ ] Toast notifications
- [ ] Dark mode support
- [ ] SEO optimization
- [ ] Analytics integration

## Code Quality

- **Linting**: ESLint configured
- **Types**: Strict TypeScript enabled
- **Formatting**: Follow Tailwind's utility-first approach
- **Comments**: Add architectural comments to complex sections

## License

ISC
