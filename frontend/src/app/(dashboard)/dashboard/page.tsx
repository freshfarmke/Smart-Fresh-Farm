/**
 * Dashboard Page
 * Server component - placeholder for authenticated user dashboard
 * Architecture: Ready for data fetching and dashboard widgets
 * 
 * TODO: Integrate with backend to fetch user data
 * TODO: Add protected route middleware
 * TODO: Add dashboard widgets and statistics
 */

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      {/* Welcome Section */}
      <div className="bg-primary text-white p-6 rounded-lg mb-8">
        <h2 className="text-2xl font-semibold">Welcome to Bakery Management</h2>
        <p className="mt-2 opacity-90">
          Your dashboard is ready for configuration. Connect with the backend to start managing orders.
        </p>
      </div>

      {/* Stats Grid - Placeholder */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Total Orders', value: '—' },
          { label: 'Today\'s Sales', value: '—' },
          { label: 'Pending Items', value: '—' },
          { label: 'Active Products', value: '—' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-lg border border-gray-200">
            <p className="text-gray-600 text-sm mb-2">{stat.label}</p>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Ready for expansion */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
        <p className="text-gray-600">Activity feed will appear here once backend integration is complete.</p>
      </div>
    </div>
  );
}
