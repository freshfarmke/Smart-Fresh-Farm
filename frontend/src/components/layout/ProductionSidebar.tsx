"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import {
  Home,
  Package,
  Truck,
  Building2,
  Store,
  BarChart3,
  Settings,
  LogOut,
  CakeSlice,
} from "lucide-react";

export function ProductionSidebar({ currentPath }: { currentPath?: string }) {
  const pathname = usePathname() || currentPath || "/";

  const navItems = [
    { name: "Dashboard", href: "/production", icon: Home },
    // Removed Batches and Routes pages (not used)
    { name: "Route Dispatch", href: "/production/dispatch", icon: Truck },
    { name: "Institutions", href: "/institutions", icon: Building2 },
    { name: "Shop", href: "/production/shop", icon: Store },
  ];

  const bottomItems = [
    { name: "Reports", href: "/production/reports", icon: BarChart3 },
    { name: "Settings", href: "/production/settings", icon: Settings },
  ];

  const handleLogout = async () => {
    try {
      const { supabase } = await import("@/lib/supabase/client");
      await supabase.auth.signOut();
    } catch (e) {
      console.warn("Logout failed", e);
    }
    if (typeof window !== "undefined") window.location.href = "/login";
  };

  return (
    <aside className="w-64 sticky top-0 h-screen bg-[#7A4A2A] text-white flex flex-col justify-between shadow-xl">
      {/* Top Section */}
      <div>
        {/* Brand */}
        <div className="flex items-center gap-3 px-6 py-6 border-b border-white/10">
          <div className="bg-[#D9822B] p-2 rounded-xl shadow-md">
            <CakeSlice size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-wide">
              BakeryOS
            </h1>
            <p className="text-xs text-white/60">
              Management Suite
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active =
              pathname === item.href ||
              pathname.startsWith(item.href + "/");

            return (
              <Link
                key={item.name}
                href={item.href}
                className={clsx(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                  active
                    ? "bg-[#9B5E38] text-[#FFD8A8] shadow-inner"
                    : "text-white/80 hover:bg-[#8A5532] hover:text-white"
                )}
              >
                <Icon
                  size={18}
                  className={clsx(
                    active
                      ? "text-[#FFD8A8]"
                      : "text-white/70 group-hover:text-white"
                  )}
                />
                <span className="text-sm font-medium tracking-wide">
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="px-4 pb-6 space-y-2 border-t border-white/10 pt-4">
        {bottomItems.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href ||
            pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.name}
              href={item.href}
              className={clsx(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                active
                  ? "bg-[#9B5E38] text-[#FFD8A8]"
                  : "text-white/70 hover:bg-[#8A5532] hover:text-white"
              )}
            >
              <Icon size={18} />
              <span className="text-sm font-medium">
                {item.name}
              </span>
            </Link>
          );
        })}

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl bg-[#C1442E] hover:bg-[#a73522] transition-all duration-200 text-white font-medium mt-4"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}