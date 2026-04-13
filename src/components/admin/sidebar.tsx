"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

interface SidebarProps {
  user: {
    name: string;
    email: string;
  };
}

interface NavItem {
  href?: string;
  icon: string;
  label: string;
  children?: { href: string; label: string }[];
}

const navItems: NavItem[] = [
  { href: "/mng/dashboard", icon: "dashboard", label: "Dashboard" },
  {
    icon: "database", // Database / Master concept
    label: "Master",
    children: [
      { href: "/mng/categories", label: "Category" },
      { href: "/mng/menu", label: "Menu" },
      { href: "/mng/areas", label: "Area" },
      { href: "/mng/tables", label: "Table" },
    ],
  },
  { href: "/mng/orders", icon: "receipt_long", label: "Orders" },
  { href: "/mng/settings", icon: "settings", label: "Settings" },
];

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  // Auto-expand if a child is active
  useEffect(() => {
    navItems.forEach((item) => {
      if (item.children) {
        const isChildActive = item.children.some((child) =>
          pathname.startsWith(child.href)
        );
        if (isChildActive && !expandedItems.includes(item.label)) {
          setExpandedItems((prev) => [...prev, item.label]);
        }
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const toggleExpand = (label: string) => {
    setExpandedItems((prev) =>
      prev.includes(label) ? prev.filter((i) => i !== label) : [...prev, label]
    );
  };

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
      <nav className="flex flex-col gap-1 overflow-y-auto pr-2 custom-scrollbar">
        {navItems.map((item) => {
          const hasChildren = !!item.children;
          const isExpanded = expandedItems.includes(item.label);
          
          let isActive = false;
          if (item.href) {
             isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          } else if (hasChildren) {
             isActive = item.children!.some(child => pathname === child.href || pathname.startsWith(child.href + "/"));
          }

          return (
            <div key={item.label} className="flex flex-col gap-1">
              {hasChildren ? (
                <button
                  onClick={() => toggleExpand(item.label)}
                  className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-200"
                  style={
                    isActive && !isExpanded
                      ? {
                          backgroundColor: "var(--a-surface-container-highest)",
                          color: "var(--a-on-surface)",
                        }
                      : {
                          color: isExpanded ? "var(--a-on-surface)" : "var(--a-on-surface-variant)",
                        }
                  }
                  onMouseEnter={(e) => {
                    if (!isActive || isExpanded) {
                      (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(0,0,0,0.04)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive || isExpanded) {
                      (e.currentTarget as HTMLElement).style.backgroundColor = "";
                    }
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[20px]">
                      {item.icon}
                    </span>
                    <span style={{ fontFamily: "Inter, sans-serif" }}>
                      {item.label}
                    </span>
                  </div>
                  <span
                    className="material-symbols-outlined text-[16px] transition-transform duration-300 opacity-50"
                    style={{
                      transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                    }}
                  >
                    expand_more
                  </span>
                </button>
              ) : (
                <Link
                  href={item.href!}
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
                    {item.icon}
                  </span>
                  <span style={{ fontFamily: "Inter, sans-serif" }}>
                    {item.label}
                  </span>
                </Link>
              )}

              {/* Children Dropdown */}
              {hasChildren && (
                <div
                  className="flex flex-col gap-1 overflow-hidden transition-all duration-300"
                  style={{
                    maxHeight: isExpanded ? "200px" : "0px",
                    opacity: isExpanded ? 1 : 0,
                    marginLeft: "20px",
                    borderLeft: "2px solid rgba(0,0,0,0.05)",
                    paddingLeft: "12px",
                  }}
                >
                  {item.children!.map((child) => {
                    const isChildActive = pathname === child.href;
                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="px-4 py-2 mt-1 rounded-lg text-sm font-semibold transition-all duration-200"
                        style={
                          isChildActive
                            ? {
                                color: "var(--a-primary)",
                                backgroundColor: "rgba(0,0,0,0.03)",
                              }
                            : {
                                color: "var(--a-on-surface-variant)",
                                opacity: 0.8,
                              }
                        }
                        onMouseEnter={(e) => {
                          if (!isChildActive) {
                            (e.currentTarget as HTMLElement).style.color = "var(--a-on-surface)";
                            (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(0,0,0,0.02)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isChildActive) {
                            (e.currentTarget as HTMLElement).style.color = "var(--a-on-surface-variant)";
                            (e.currentTarget as HTMLElement).style.backgroundColor = "";
                          }
                        }}
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
