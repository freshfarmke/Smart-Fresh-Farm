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
    <div className="w-full bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 via-slate-50 to-cyan-50 py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-4">
            <span className="inline-block px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold mb-4">
              ✨ Fresh Farm Bakery Flaxs
            </span>
          </div>
          <h1 className="text-6xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Fresh Farm
            </span>
            <br />
            <span className="text-gray-900">Bakery Management</span>
            <br />
            <span className="text-2xl md:text-3xl font-semibold text-slate-600">Made Simple</span>
          </h1>
          <p className="text-xl text-gray-700 mb-12 max-w-2xl mx-auto leading-relaxed">
            Streamline your bakery operations with our comprehensive management system.
            From production to sales, handle every aspect of your business with ease.
          </p>

          <div className="flex gap-4 justify-center flex-wrap">
            <Link href={ROUTES.LOGIN}>
              <Button variant="primary" size="lg" className="px-8 py-3 text-lg">
                Sign In
              </Button>
            </Link>
            <Link href={ROUTES.REGISTER}>
              <Button variant="outline" size="lg" className="px-8 py-3 text-lg">
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Key Benefits Section */}
      <section className="py-20 px-4 max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-16 text-gray-900">
          Why Choose Fresh Farm Bakery Flaxs System?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            {
              icon: '📊',
              title: 'Production Tracking',
              description: 'Monitor all production activities, batches, and quality control in real-time',
            },
            {
              icon: '📦',
              title: 'Inventory Management',
              description: 'Keep precise track of ingredients, finished products, and stock levels',
            },
            {
              icon: '💰',
              title: 'Financial Insights',
              description: 'Comprehensive analytics on sales, expenses, and profit margins',
            },
            {
              icon: '🚚',
              title: 'Route Management',
              description: 'Optimize delivery routes and manage route riders efficiently',
            },
            {
              icon: '🏪',
              title: 'Shop Operations',
              description: 'Manage retail locations and point-of-sale operations seamlessly',
            },
            {
              icon: '📈',
              title: 'Business Growth',
              description: 'Data-driven insights to help your bakery expand and thrive',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-8 bg-white rounded-lg border border-slate-200 hover:shadow-md hover:border-cyan-300 transition-all duration-200"
            >
              <div className="text-4xl mb-4">{item.icon}</div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">{item.title}</h3>
              <p className="text-gray-600 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Showcase */}
      <section className="bg-slate-50 py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 text-gray-900">
            Comprehensive Management Tools
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Production Management',
                features: [
                  'Production scheduling',
                  'Batch tracking',
                  'Quality control logs',
                  'Equipment management',
                ],
              },
              {
                title: 'Sales & Orders',
                features: [
                  'Customer order management',
                  'Real-time order tracking',
                  'Multiple payment methods',
                  'Automated notifications',
                ],
              },
              {
                title: 'Reports & Analytics',
                features: [
                  'Sales reports',
                  'Stock loss analysis',
                  'Financial summaries',
                  'Performance metrics',
                ],
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="p-8 bg-white rounded-lg border border-slate-200 hover:shadow-md transition-all duration-200"
              >
                <h3 className="text-2xl font-bold mb-6 text-gray-900">
                  {feature.title}
                </h3>
                <ul className="space-y-3">
                  {feature.features.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-gray-700">
                      <span className="text-cyan-600 font-bold mt-0.5">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {[
            { number: '100%', label: 'Production Visibility' },
            { number: '24/7', label: 'System Availability' },
            { number: '∞', label: 'Scalability' },
          ].map((stat, idx) => (
            <div key={idx}>
              <div className="text-5xl font-bold mb-2">{stat.number}</div>
              <p className="text-lg opacity-90">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 max-w-4xl mx-auto text-center">
        <h2 className="text-4xl font-bold mb-6 text-gray-900">
          Ready to transform your bakery operations?
        </h2>
        <p className="text-xl text-gray-600 mb-12">
          Join Fresh Farm Bakery Flaxs in revolutionizing bakery management. Start optimizing your
          operations today.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link href={ROUTES.REGISTER}>
            <Button variant="primary" size="lg" className="px-8 py-3 text-lg">
              Start Your Free Trial
            </Button>
          </Link>
          <Link href={ROUTES.LOGIN}>
            <Button variant="outline" size="lg" className="px-8 py-3 text-lg">
              Already have an account?
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <section className="bg-slate-900 text-slate-300 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="text-white font-bold mb-4">Fresh Farm Bakery Flaxs</h4>
              <p className="text-sm">Professional bakery management system</p>
            </div>
            <div>
              <h5 className="text-white font-semibold mb-4">Product</h5>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href={ROUTES.HOME} className="hover:text-white transition-colors">
                    Features
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="text-white font-semibold mb-4">Company</h5>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href={ROUTES.HOME} className="hover:text-white transition-colors">
                    About
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="text-white font-semibold mb-4">Support</h5>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href={ROUTES.HOME} className="hover:text-white transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-700 pt-8 text-center text-sm">
            <p>&copy; 2026 Fresh Farm Bakery Flaxs. All rights reserved.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
