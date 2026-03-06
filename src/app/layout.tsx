import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import { PreferencesProvider } from '@/lib/preferences';
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
      <body suppressHydrationWarning className="bg-white text-gray-900">
        <PreferencesProvider>
          <Toaster
            position="top-right"
            reverseOrder={false}
            gutter={8}
            toastOptions={{
              duration: 4000,
              style: {
                background: '#fff',
                color: '#333',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                borderRadius: '8px',
                padding: '16px',
              },
              success: {
                style: {
                  background: '#DCFCE7',
                  color: '#166534',
                },
              },
              error: {
                style: {
                  background: '#FEE2E2',
                  color: '#991B1B',
                },
              },
            }}
          />
          {children}
        </PreferencesProvider>
      </body>
    </html>
  );
}
