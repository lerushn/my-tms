"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  Home,
  Search,
  Package,
  Calculator,
  BarChart3,
  Users,
  Truck,
} from "lucide-react";

const LOAD_TABS = [
  { label: "Available", tab: "available" },
  { label: "In Transit", tab: "in-transit" },
  { label: "Completed", tab: "completed" },
];

const NAV_ITEMS = [
  { label: "Home", href: "/", icon: Home },
  { label: "Search", href: "/search", icon: Search },
  { label: "Loads", href: "/loads", icon: Package, children: LOAD_TABS },
  { label: "Accounting", href: "/accounting", icon: Calculator },
  { label: "Reports", href: "/reports", icon: BarChart3 },
  { label: "Customers", href: "/customers", icon: Users },
  { label: "Carriers", href: "/carriers", icon: Truck },
];

export function Sidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") ?? "available";

  return (
    <aside className="glass sticky top-0 flex h-screen w-64 shrink-0 flex-col gap-6 px-4 py-6">
      <div className="flex items-center gap-2 px-2">
        <div className="accent-gradient h-8 w-8 rounded-lg" />
        <span className="text-lg font-semibold text-white">My TMS</span>
      </div>

      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <div key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "accent-gradient text-white shadow-lg shadow-indigo-500/20"
                    : "text-zinc-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon size={18} strokeWidth={2} />
                {item.label}
              </Link>

              {item.children && isActive && (
                <div className="mt-1 ml-6 flex flex-col gap-0.5 border-l border-white/10 pl-3">
                  {item.children.map((child) => {
                    const childActive = activeTab === child.tab;
                    return (
                      <Link
                        key={child.tab}
                        href={`/loads?tab=${child.tab}`}
                        className={`rounded-md px-2 py-1.5 text-sm transition-colors ${
                          childActive
                            ? "font-medium text-indigo-300"
                            : "text-zinc-400 hover:text-white"
                        }`}
                      >
                        {child.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
