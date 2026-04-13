"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/mng/dashboard", icon: "dashboard", label: "Explore" },
  { href: "/mng/menu", icon: "restaurant_menu", label: "Menu" },
  { href: "/mng/orders", icon: "receipt_long", label: "Orders" },
  { href: "/mng/settings", icon: "settings", label: "Profile" },
] as const;

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pt-2 pb-6"
      style={{
        backgroundColor: "rgba(252, 249, 244, 0.90)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        boxShadow: "0 -12px 32px rgba(93, 98, 56, 0.08)",
        borderRadius: "2rem 2rem 0 0",
      }}
    >
      {navItems.map(({ href, icon, label }) => {
        const isActive =
          pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center justify-center px-4 py-2 rounded-2xl transition-all duration-200"
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
          >
            <span className="material-symbols-outlined text-[22px]">
              {icon}
            </span>
            <span
              className="font-semibold text-[10px] uppercase tracking-wider mt-0.5"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
