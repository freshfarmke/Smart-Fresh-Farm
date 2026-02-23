/**
 * Route Management Dashboard
 * 
 * Sub-pages:
 * - /routes/riders - Manage route riders
 * - /routes/dispatch - Create and track dispatches
 * - /routes/returns - Record product returns
 * - /routes/collections - Process collections from routes
 * 
 * This is the main route management index page
 */

export default function RoutesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Route Management</h1>

      {/* TODO: Create card grid with links to:
         - Manage Route Riders
         - Create Dispatch
         - Record Returns
         - Record Collections
      */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { title: 'Route Riders', href: '/routes/riders' },
          { title: 'Dispatch', href: '/routes/dispatch' },
          { title: 'Returns', href: '/routes/returns' },
          { title: 'Collections', href: '/routes/collections' },
        ].map((item) => (
          <div key={item.href} className="p-6 bg-white rounded-lg border border-gray-200">
            {/* TODO: Make this a clickable card */}
            <h2 className="text-xl font-semibold">{item.title}</h2>
          </div>
        ))}
      </div>
    </div>
  );
}
