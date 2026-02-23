import type { Metadata } from 'next';
import './globals.css';

/**
 * RootLayout - Minimal core layout
 * Architecture:
 * - Only contains essential HTML structure
 * - No components mounted here
 * - Global CSS and default metadata only
 * - Child layouts (PublicLayout, DashboardLayout) handle component rendering
 * - Enables maximum flexibility for different route groups
 */

export const metadata: Metadata = {
  title: 'Bakery Management System',
  description: 'Professional bakery management and order tracking system',
  keywords: 'bakery, management, orders, products',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-white text-gray-900">{children}</body>
    </html>
  );
}
