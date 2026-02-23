import Link from 'next/link';
import { ROUTES, APP_CONFIG } from '@/lib/constants';

/**
 * Header Component
 * Server component by default - no interactivity needed
 * Architecture: Appears on all pages, uses route constants for consistency
 */
export function Header() {
  return (
    <header className="bg-white border-b border-gray-200">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo/Brand */}
        <Link href={ROUTES.HOME} className="font-bold text-xl text-primary">
          {APP_CONFIG.name}
        </Link>

        {/* Navigation Links */}
        <div className="flex gap-6">
          <Link
            href={ROUTES.HOME}
            className="text-gray-600 hover:text-primary transition-colors"
          >
            Home
          </Link>
          <Link
            href={ROUTES.LOGIN}
            className="text-gray-600 hover:text-primary transition-colors"
          >
            Login
          </Link>
          <Link
            href={ROUTES.REGISTER}
            className="text-gray-600 hover:text-primary transition-colors"
          >
            Register
          </Link>
        </div>
      </nav>
    </header>
  );
}
