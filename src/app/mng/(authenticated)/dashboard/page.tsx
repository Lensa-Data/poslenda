import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// ─── Types ────────────────────────────────────────────────────────────────────

type ActivityItem = {
  id: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  title: string;
  description: string;
  rightContent:
    | { type: "amount"; value: string; time: string }
    | {
        type: "badge";
        text: string;
        badgeStyle: React.CSSProperties;
        time: string;
      }
    | {
        type: "action";
        buttonText: string;
        buttonStyle: React.CSSProperties;
        time: string;
      };
};

type TableItem = {
  id: string;
  label: string;
  occupied: number;
  capacity: number;
  status: "occupied" | "open" | "closing";
};

// ─── Mock Data ─────────────────────────────────────────────────────────────────

const recentActivity: ActivityItem[] = [
  {
    id: "1",
    icon: "receipt",
    iconBg: "var(--a-secondary-container)",
    iconColor: "var(--a-on-secondary-container)",
    title: "Order #8842",
    description: "2x Ethiopian Single Origin, 1x Almond Croissant",
    rightContent: { type: "amount", value: "$24.50", time: "2 mins ago" },
  },
  {
    id: "2",
    icon: "table_restaurant",
    iconBg: "var(--a-primary-fixed-dim)",
    iconColor: "var(--a-on-primary-fixed-variant)",
    title: "Table 4 Cleared",
    description: "Server: Marcus J.",
    rightContent: {
      type: "badge",
      text: "Available",
      badgeStyle: {
        backgroundColor: "var(--a-surface-container-highest)",
        color: "var(--a-on-surface-variant)",
        borderRadius: "9999px",
        padding: "2px 12px",
        fontSize: "10px",
        fontWeight: "700",
        textTransform: "uppercase",
      },
      time: "12 mins ago",
    },
  },
  {
    id: "3",
    icon: "inventory_2",
    iconBg: "var(--a-tertiary-fixed-dim)",
    iconColor: "var(--a-on-tertiary-fixed-variant)",
    title: "Low Stock Alert",
    description: "Oat Milk (Barista Edition) is below 15%",
    rightContent: {
      type: "action",
      buttonText: "Reorder",
      buttonStyle: {
        backgroundColor: "var(--a-secondary)",
        color: "var(--a-on-secondary)",
        borderRadius: "8px",
        padding: "4px 12px",
        fontSize: "12px",
        fontWeight: "700",
        border: "none",
        cursor: "pointer",
      },
      time: "24 mins ago",
    },
  },
  {
    id: "4",
    icon: "receipt",
    iconBg: "var(--a-secondary-container)",
    iconColor: "var(--a-on-secondary-container)",
    title: "Order #8841",
    description: "1x Matcha Latte, 1x Avocado Sourdough Toast",
    rightContent: { type: "amount", value: "$18.20", time: "45 mins ago" },
  },
];

const floorTables: TableItem[] = [
  { id: "t01", label: "T-01", occupied: 2, capacity: 2, status: "occupied" },
  { id: "t02", label: "T-02", occupied: 0, capacity: 4, status: "open" },
  { id: "t03", label: "T-03", occupied: 1, capacity: 2, status: "occupied" },
  { id: "t04", label: "T-04", occupied: 3, capacity: 4, status: "closing" },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function ActivityItemCard({ item }: { item: ActivityItem }) {
  return (
    <div className="activity-card flex items-center justify-between p-5 rounded-2xl cursor-default">
      <div className="flex items-center gap-4">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: item.iconBg, color: item.iconColor }}
        >
          <span className="material-symbols-outlined">{item.icon}</span>
        </div>
        <div>
          <h5
            className="font-bold text-sm"
            style={{ color: "var(--a-on-surface)" }}
          >
            {item.title}
          </h5>
          <p
            className="text-sm"
            style={{ color: "var(--a-on-surface-variant)" }}
          >
            {item.description}
          </p>
        </div>
      </div>

      <div className="text-right flex-shrink-0 ml-4">
        {item.rightContent.type === "amount" && (
          <>
            <p
              className="font-bold text-sm"
              style={{ color: "var(--a-on-surface)" }}
            >
              {item.rightContent.value}
            </p>
            <p
              className="text-xs mt-0.5"
              style={{ color: "var(--a-on-surface-variant)" }}
            >
              {item.rightContent.time}
            </p>
          </>
        )}
        {item.rightContent.type === "badge" && (
          <>
            <span style={item.rightContent.badgeStyle}>
              {item.rightContent.text}
            </span>
            <p
              className="text-xs mt-1"
              style={{ color: "var(--a-on-surface-variant)" }}
            >
              {item.rightContent.time}
            </p>
          </>
        )}
        {item.rightContent.type === "action" && (
          <>
            <button style={item.rightContent.buttonStyle}>
              {item.rightContent.buttonText}
            </button>
            <p
              className="text-xs mt-1"
              style={{ color: "var(--a-on-surface-variant)" }}
            >
              {item.rightContent.time}
            </p>
          </>
        )}
      </div>
    </div>
  );
}

function TableCard({ table }: { table: TableItem }) {
  const isOccupied = table.status === "occupied";
  const isClosing = table.status === "closing";
  const isOpen = table.status === "open";

  const badgeStyle: React.CSSProperties = isOccupied
    ? { backgroundColor: "var(--a-primary-fixed)", color: "var(--a-primary)" }
    : isClosing
      ? {
          backgroundColor: "var(--a-secondary-container)",
          color: "var(--a-on-secondary-container)",
        }
      : {
          backgroundColor: "var(--a-surface-container)",
          color: "var(--a-on-surface-variant)",
        };

  return (
    <div
      className="aspect-square rounded-2xl p-4 flex flex-col justify-between shadow-sm"
      style={{
        backgroundColor: "var(--a-surface-container-lowest)",
        opacity: isOpen ? 0.6 : 1,
      }}
    >
      <span
        className="text-xs font-bold"
        style={{ color: "var(--a-on-surface-variant)" }}
      >
        {table.label}
      </span>
      <div className="flex flex-col items-center">
        <span
          className="material-symbols-outlined"
          style={{
            color: isOccupied
              ? "var(--a-primary)"
              : isClosing
                ? "var(--a-secondary)"
                : "var(--a-outline-variant)",
            fontVariationSettings: isOpen
              ? undefined
              : "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24",
          }}
        >
          {isClosing ? "timer" : "person"}
        </span>
        <span
          className="text-lg font-bold"
          style={{
            color: isOpen ? "var(--a-outline-variant)" : "var(--a-on-surface)",
          }}
        >
          {table.occupied}/{table.capacity}
        </span>
      </div>
      <span
        className="text-[10px] text-center rounded-full px-2 py-0.5 font-bold"
        style={badgeStyle}
      >
        {isOccupied ? "Occupied" : isClosing ? "Closing" : "Open"}
      </span>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function AdminDashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const firstName = session?.user?.name?.split(" ")[0] ?? "Admin";

  return (
    <div>
      {/* ── Top App Bar ── */}
      <header className="flex justify-between items-center mb-10 flex-wrap gap-4">
        <div>
          <h2
            className="font-extrabold text-3xl tracking-tight"
            style={{
              fontFamily: "Manrope, sans-serif",
              color: "var(--a-on-surface)",
            }}
          >
            Good morning, {firstName}
          </h2>
          <p className="mt-1" style={{ color: "var(--a-on-surface-variant)" }}>
            Here&apos;s what&apos;s brewing today.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            className="w-11 h-11 flex items-center justify-center rounded-full transition-colors"
            style={{
              backgroundColor: "var(--a-surface-container-high)",
              color: "var(--a-on-surface-variant)",
            }}
          >
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg transition-opacity hover:opacity-90"
            style={{
              background:
                "linear-gradient(135deg, var(--a-primary), var(--a-primary-container))",
              color: "var(--a-on-primary)",
              fontFamily: "Inter, sans-serif",
            }}
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            New Order
          </button>
        </div>
      </header>

      {/* ── Bento Stats Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        {/* Total Revenue — spans 2 cols */}
        <div
          className="md:col-span-2 relative overflow-hidden group p-8 rounded-[2rem]"
          style={{
            backgroundColor: "var(--a-surface-container-lowest)",
            boxShadow: "0 12px 32px rgba(93,98,56,0.08)",
          }}
        >
          <div className="relative z-10">
            <p
              className="text-xs font-bold uppercase tracking-[0.2em] mb-4"
              style={{ color: "var(--a-primary)" }}
            >
              Total Revenue
            </p>
            <h3
              className="text-5xl font-extrabold mb-2"
              style={{
                fontFamily: "Manrope, sans-serif",
                color: "var(--a-on-surface)",
              }}
            >
              $4,280.50
            </h3>
            <div
              className="flex items-center gap-2 font-bold"
              style={{ color: "var(--a-primary)" }}
            >
              <span className="material-symbols-outlined text-sm">
                trending_up
              </span>
              <span className="text-sm">+12.4% from yesterday</span>
            </div>
          </div>
          <div
            className="absolute -right-10 -bottom-10 opacity-10 scale-150 transition-transform duration-500 group-hover:rotate-12"
            style={{ color: "var(--a-primary)" }}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "160px" }}
            >
              payments
            </span>
          </div>
        </div>

        {/* Daily Orders */}
        <div
          className="p-8 rounded-[2rem] flex flex-col justify-between"
          style={{ backgroundColor: "var(--a-surface-container)" }}
        >
          <div>
            <span
              className="material-symbols-outlined mb-4 block"
              style={{ color: "var(--a-primary)" }}
            >
              coffee
            </span>
            <p
              className="text-sm font-bold"
              style={{ color: "var(--a-on-surface-variant)" }}
            >
              Daily Orders
            </p>
          </div>
          <div>
            <h4
              className="text-4xl font-bold"
              style={{
                fontFamily: "Manrope, sans-serif",
                color: "var(--a-on-surface)",
              }}
            >
              142
            </h4>
            <p
              className="text-xs mt-1"
              style={{ color: "var(--a-on-surface-variant)" }}
            >
              86 Pour-overs • 56 Espresso
            </p>
          </div>
        </div>

        {/* Occupancy */}
        <div
          className="p-8 rounded-[2rem] flex flex-col justify-between"
          style={{ backgroundColor: "var(--a-primary-fixed)" }}
        >
          <div>
            <span
              className="material-symbols-outlined mb-4 block"
              style={{ color: "var(--a-on-primary-fixed)" }}
            >
              chair
            </span>
            <p
              className="text-sm font-bold"
              style={{ color: "var(--a-on-primary-fixed)" }}
            >
              Occupancy
            </p>
          </div>
          <div>
            <div className="flex items-end gap-2">
              <h4
                className="text-4xl font-bold"
                style={{
                  fontFamily: "Manrope, sans-serif",
                  color: "var(--a-on-primary-fixed)",
                }}
              >
                85%
              </h4>
              <p
                className="text-xs pb-1"
                style={{ color: "var(--a-on-primary-fixed-variant)" }}
              >
                Busy hours
              </p>
            </div>
            <div
              className="w-full h-2 rounded-full mt-3 overflow-hidden"
              style={{ backgroundColor: "rgba(26,30,0,0.1)" }}
            >
              <div
                className="h-full rounded-full"
                style={{ width: "85%", backgroundColor: "var(--a-primary)" }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <section className="lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h3
              className="font-bold text-xl"
              style={{
                fontFamily: "Manrope, sans-serif",
                color: "var(--a-on-surface)",
              }}
            >
              Recent Activity
            </h3>
            <button
              className="text-sm font-bold"
              style={{ color: "var(--a-primary)" }}
            >
              View Archive
            </button>
          </div>
          <div className="flex flex-col gap-4">
            {recentActivity.map((item) => (
              <ActivityItemCard key={item.id} item={item} />
            ))}
          </div>
        </section>

        {/* Floor Map */}
        <section className="lg:col-span-1">
          <div
            className="p-8 rounded-[2rem]"
            style={{ backgroundColor: "var(--a-surface-container-highest)" }}
          >
            <h3
              className="font-bold text-xl mb-6"
              style={{
                fontFamily: "Manrope, sans-serif",
                color: "var(--a-on-surface)",
              }}
            >
              Floor Map
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {floorTables.map((table) => (
                <TableCard key={table.id} table={table} />
              ))}
            </div>
            <button
              className="w-full mt-6 py-4 rounded-xl flex items-center justify-center gap-2 font-bold text-sm transition-colors"
              style={{
                backgroundColor: "var(--a-surface-container-lowest)",
                color: "var(--a-on-surface)",
                border: "1px solid var(--a-outline-variant)",
              }}
            >
              <span className="material-symbols-outlined text-[18px]">map</span>
              Full Floor Plan
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
