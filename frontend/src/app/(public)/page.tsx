import { Button } from '@/components/ui';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants';

/**
 * Landing Page
 * Server component - static content
 * Moved to (public) layout group to enable layout hierarchy
 * Architecture: Entry point for new visitors, wrapped by PublicLayout with Header
 */

export default function Home() {
  return (
    <div className="container-max py-20">
      {/* Hero Section */}
      <section className="text-center mb-20">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Professional Bakery Management
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Streamline your bakery operations with our intuitive management system.
          Track orders, manage inventory, and grow your business.
        </p>

        <div className="flex gap-4 justify-center">
          <Link href={ROUTES.LOGIN}>
            <Button variant="primary" size="lg">
              Sign In
            </Button>
          </Link>
          <Link href={ROUTES.REGISTER}>
            <Button variant="outline" size="lg">
              Get Started
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section - Placeholder */}
      <section className="mb-20">
        <h2 className="text-3xl font-bold text-center mb-12">Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: 'Order Management',
              description: 'Manage customer orders efficiently with real-time tracking',
            },
            {
              title: 'Inventory Tracking',
              description: 'Keep track of ingredients and finished products',
            },
            {
              title: 'Sales Analytics',
              description: 'Get insights into your business performance',
            },
          ].map((feature, idx) => (
            <div key={idx} className="p-6 bg-white rounded-lg border border-gray-200">
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-white rounded-lg p-12 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to manage your bakery?</h2>
        <p className="text-lg mb-8 opacity-90">
          Join hundreds of bakeries using our system
        </p>
        <Link href={ROUTES.REGISTER}>
          <Button variant="outline" size="lg" className="border-white text-white">
            Start Free Trial
          </Button>
        </Link>
      </section>
    </div>
  );
}
