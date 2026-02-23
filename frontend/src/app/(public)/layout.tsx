import { Header } from '@/components/layout';

/**
 * PublicLayout - Client-facing pages layout
 * Architecture:
 * - Wraps all public/marketing pages
 * - Includes Header for navigation
 * - Route group (public) doesn't affect URLs
 * - Separates public pages from auth and dashboard layouts
 * - Scaling: Easy to add protected marketing pages later
 */

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">{children}</main>
    </>
  );
}
