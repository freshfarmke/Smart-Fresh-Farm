/**
 * DEPRECATED: Landing page has been moved to src/app/(public)/page.tsx
 * 
 * Architecture refactor:
 * - Moved to (public) layout group to separate public/marketing pages from auth and dashboard
 * - PublicLayout wraps this page with Header component
 * - Route still resolves to / due to Next.js route group behavior
 * 
 * For the actual page, see: src/app/(public)/page.tsx
 */

export { default } from './(public)/page';

