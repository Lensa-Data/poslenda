"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarProps {
  user: {
    name: string;
    email: string;
  };
}

const navItems = [
  { href: "/admin/dashboard", icon: "dashboard", label: "Dashboard" },
  { href: "/admin/menu", icon: "restaurant_menu", label: "Menu" },
  { href: "/admin/tables", icon: "grid_view", label: "Tables" },
  { href: "/admin/orders", icon: "receipt_long", label: "Orders" },
  { href: "/admin/settings", icon: "settings", label: "Settings" },
] as const;

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className="hidden md:flex flex-col h-screen w-64 fixed left-0 top-0 p-4 gap-2 z-40"
      style={{ backgroundColor: "var(--a-sidebar-bg)" }}
    >
      {/* Brand */}
      <div className="mb-8 px-4">
        <h1
          className="font-bold text-xl"
          style={{
            fontFamily: "Manrope, sans-serif",
            color: "var(--a-on-surface)",
          }}
        >
          Artisan Portal
        </h1>
        <p
          className="text-xs font-medium opacity-60"
          style={{ color: "var(--a-on-surface-variant)" }}
        >
          Admin Access
        </p>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1">
        {navItems.map(({ href, icon, label }) => {
          const isActive =
            pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-200"
              style={
                isActive
                  ? {
                      backgroundColor: "var(--a-primary-fixed)",
                      color: "var(--a-primary)",
                    }
                  : {
                      color: "var(--a-on-surface-variant)",
                    }
              }
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.backgroundColor =
                    "rgba(0,0,0,0.04)";
                  (e.currentTarget as HTMLElement).style.transform =
                    "translateX(4px)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.backgroundColor = "";
                  (e.currentTarget as HTMLElement).style.transform = "";
                }
              }}
            >
              <span className="material-symbols-outlined text-[20px]">
                {icon}
              </span>
              <span style={{ fontFamily: "Inter, sans-serif" }}>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div
        className="mt-auto p-3 flex items-center gap-3 rounded-xl"
        style={{ backgroundColor: "var(--a-surface-container)" }}
      >
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
          style={{
            backgroundColor: "var(--a-primary-fixed)",
            color: "var(--a-primary)",
          }}
        >
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div className="overflow-hidden">
          <p
            className="text-sm font-bold truncate"
            style={{ color: "var(--a-on-surface)" }}
          >
            {user.name}
          </p>
          <p
            className="text-[10px] uppercase tracking-widest truncate opacity-60"
            style={{ color: "var(--a-on-surface-variant)" }}
          >
            Admin
          </p>
        </div>
      </div>
    </aside>
  );
}
