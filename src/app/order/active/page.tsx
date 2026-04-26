"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSessionStore } from "@/store/session";
import { useCartStore } from "@/store/cart";
import {
  Plus,
  Clock,
  CheckCircle2,
  ChefHat,
  UtensilsCrossed,
  Package,
  Receipt,
  MapPin,
  RefreshCw,
  ArrowRight,
  Loader2,
  Coffee,
  XCircle,
  Home,
} from "lucide-react";

/* ─── Types ─── */
interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  options: string | null;
  batchNumber: number;
  itemStatus: "PENDING_KITCHEN" | "PREPARING" | "SERVED";
  createdAt: string;
}

interface OrderDetail {
  id: string;
  orderNumber: string;
  totalAmount: number;
  status: "PENDING" | "PAID" | "CANCELLED";
  createdAt: string;
  updatedAt: string;
  table: { name: string; area: { name: string } };
  items: OrderItem[];
}

const itemStatusConfig = {
  PENDING_KITCHEN: {
    label: "Menunggu Dapur",
    icon: Clock,
    color: "text-amber-600",
    bg: "bg-amber-50",
    dot: "bg-amber-500",
  },
  PREPARING: {
    label: "Sedang Dimasak",
    icon: ChefHat,
    color: "text-blue-600",
    bg: "bg-blue-50",
    dot: "bg-blue-500",
  },
  SERVED: {
    label: "Disajikan",
    icon: CheckCircle2,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    dot: "bg-emerald-500",
  },
};

export default function ActiveOrderPage() {
  const router = useRouter();
  const { sessionToken, activeOrderNumber, hasHydrated, clearSession } =
    useSessionStore();
  const { setTableId } = useCartStore();

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = useCallback(
    async (showRefresh = false) => {
      if (!activeOrderNumber) return;
      try {
        if (showRefresh) setRefreshing(true);
        const res = await fetch(`/api/orders/${activeOrderNumber}`);
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Gagal memuat pesanan.");
          return;
        }
        setOrder(data);
        setError(null);
      } catch {
        setError("Terjadi kesalahan jaringan.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [activeOrderNumber],
  );

  // Initial fetch
  useEffect(() => {
    if (!hasHydrated) return;
    if (!sessionToken || !activeOrderNumber) {
      setLoading(false);
      return;
    }
    fetchOrder();
  }, [hasHydrated, sessionToken, activeOrderNumber, fetchOrder]);

  // Auto-refresh every 10s for live status updates
  useEffect(() => {
    if (!order || order.status === "CANCELLED") return;
    const interval = setInterval(() => fetchOrder(), 10000);
    return () => clearInterval(interval);
  }, [order?.status, fetchOrder]);

  const formatIDR = (amount: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleAddOrder = () => {
    // Set tableId in cart store so the menu page knows which table
    if (order?.table) {
      const sessionState = useSessionStore.getState();
      if (sessionState.activeTableId) {
        setTableId(sessionState.activeTableId);
      }
    }
    router.push("/order?mode=additional");
  };

  const handleEndSession = () => {
    clearSession();
    router.push("/");
  };

  /* ─── No Session State ─── */
  if (hasHydrated && (!sessionToken || !activeOrderNumber)) {
    return (
      <div className="bg-surface text-on-surface min-h-screen flex flex-col items-center justify-center px-6">
        <div className="w-20 h-20 rounded-full bg-stone-100 flex items-center justify-center mb-6">
          <Receipt size={36} className="text-stone-400" />
        </div>
        <h2 className="text-xl font-headline font-bold mb-2 text-center">
          Tidak Ada Pesanan Aktif
        </h2>
        <p className="text-on-surface-variant text-sm text-center max-w-[280px] mb-8">
          Scan QR Code di meja Anda untuk mulai memesan.
        </p>
        <button
          onClick={() => router.push("/")}
          className="py-4 px-8 rounded-2xl bg-linear-to-br from-primary to-primary-container text-white font-bold text-sm shadow-lg shadow-primary/20 flex items-center gap-2"
        >
          <Home size={18} />
          Kembali ke Beranda
        </button>
      </div>
    );
  }

  /* ─── Loading State ─── */
  if (loading || !hasHydrated) {
    return (
      <div className="bg-surface text-on-surface min-h-screen flex flex-col items-center justify-center">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-primary-fixed/30 flex items-center justify-center animate-pulse">
            <div className="w-16 h-16 rounded-full bg-primary-fixed/50 flex items-center justify-center">
              <Coffee size={32} className="text-primary" />
            </div>
          </div>
          <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-surface-container-lowest flex items-center justify-center shadow-lg">
            <Loader2 size={18} className="text-primary animate-spin" />
          </div>
        </div>
        <p className="mt-6 text-on-surface-variant text-sm font-medium">
          Memuat pesanan aktif...
        </p>
      </div>
    );
  }

  /* ─── Error State ─── */
  if (error || !order) {
    return (
      <div className="bg-surface text-on-surface min-h-screen flex flex-col items-center justify-center px-6">
        <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mb-6">
          <XCircle size={36} className="text-red-500" />
        </div>
        <h2 className="text-xl font-headline font-bold mb-2">
          Gagal Memuat Pesanan
        </h2>
        <p className="text-on-surface-variant text-sm text-center max-w-[280px] mb-8">
          {error || "Tidak dapat menemukan pesanan."}
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => fetchOrder()}
            className="py-4 px-6 rounded-2xl bg-linear-to-br from-primary to-primary-container text-white font-bold text-sm shadow-lg flex items-center gap-2"
          >
            <RefreshCw size={18} />
            Coba Lagi
          </button>
          <button
            onClick={handleEndSession}
            className="py-4 px-6 rounded-2xl bg-surface-container-high text-on-surface font-bold text-sm flex items-center gap-2"
          >
            <Home size={18} />
            Beranda
          </button>
        </div>
      </div>
    );
  }

  /* ─── Group items by batch ─── */
  const batchMap = new Map<number, OrderItem[]>();
  for (const item of order.items) {
    if (!batchMap.has(item.batchNumber)) {
      batchMap.set(item.batchNumber, []);
    }
    batchMap.get(item.batchNumber)!.push(item);
  }
  const batches = Array.from(batchMap.entries()).sort(([a], [b]) => a - b);
  const canAddMore = order.status === "PENDING";

  /* ─── Main Render ─── */
  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col items-center">
      {/* Header */}
      <header className="w-full max-w-md flex items-center justify-between px-6 py-5 sticky top-0 bg-surface/90 backdrop-blur-xl z-50">
        <div>
          <h1 className="font-headline font-bold text-lg tracking-tight">
            Pesanan Aktif
          </h1>
          <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-semibold">
            {order.table.name} &bull; {order.table.area.name}
          </p>
        </div>
        <button
          onClick={() => fetchOrder(true)}
          disabled={refreshing}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container-low text-primary active:scale-95 transition-transform disabled:opacity-50"
        >
          <RefreshCw
            size={18}
            className={refreshing ? "animate-spin" : ""}
          />
        </button>
      </header>

      <main className="w-full max-w-md px-6 pb-36 flex flex-col gap-4">
        {/* Order Number + Status Summary */}
        <section className="bg-surface-container-low rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-fixed/30 flex items-center justify-center">
                <Receipt size={20} className="text-primary" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-semibold">
                  Order
                </p>
                <p className="font-headline font-bold text-on-surface text-sm tracking-tight">
                  {order.orderNumber}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-full text-xs font-bold">
              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
              Aktif
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-surface-container rounded-xl p-2">
              <p className="text-[10px] text-on-surface-variant font-semibold uppercase tracking-wider">
                Batch
              </p>
              <p className="font-headline font-bold text-on-surface">
                {batches.length}
              </p>
            </div>
            <div className="bg-surface-container rounded-xl p-2">
              <p className="text-[10px] text-on-surface-variant font-semibold uppercase tracking-wider">
                Item
              </p>
              <p className="font-headline font-bold text-on-surface">
                {order.items.length}
              </p>
            </div>
            <div className="bg-surface-container rounded-xl p-2">
              <p className="text-[10px] text-on-surface-variant font-semibold uppercase tracking-wider">
                Total
              </p>
              <p className="font-headline font-bold text-primary text-sm">
                {formatIDR(order.totalAmount)}
              </p>
            </div>
          </div>
        </section>

        {/* Batch List */}
        {batches.map(([batchNumber, items]) => {
          const batchTotal = items.reduce(
            (sum, i) => sum + i.price * i.quantity,
            0,
          );

          return (
            <section key={batchNumber} className="bg-surface-container-low rounded-2xl overflow-hidden">
              {/* Batch Header */}
              <div className="px-5 pt-4 pb-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      batchNumber === 1
                        ? "bg-primary-fixed/30"
                        : "bg-secondary-fixed/30"
                    }`}
                  >
                    {batchNumber === 1 ? (
                      <Package size={16} className="text-primary" />
                    ) : (
                      <UtensilsCrossed size={16} className="text-secondary" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-headline font-bold text-sm text-on-surface">
                      {batchNumber === 1
                        ? "Pesanan Awal"
                        : `Tambahan #${batchNumber - 1}`}
                    </h3>
                    <p className="text-[10px] text-on-surface-variant">
                      {items.length} item &bull; {formatIDR(batchTotal)}
                    </p>
                  </div>
                </div>
                {batchNumber > 1 && (
                  <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-secondary/10 text-secondary">
                    Tambahan
                  </span>
                )}
              </div>

              {/* Items */}
              <div className="px-5 pb-4 flex flex-col gap-2.5">
                {items.map((item) => {
                  const cfg = itemStatusConfig[item.itemStatus];
                  const StatusIcon = cfg.icon;

                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-surface-container flex items-center justify-center shrink-0">
                          <span className="text-[11px] font-bold text-on-surface-variant">
                            {item.quantity}x
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-body font-semibold text-sm text-on-surface leading-tight truncate">
                            {item.name}
                          </p>
                          {item.options && (
                            <p className="text-[10px] text-on-surface-variant truncate">
                              {item.options}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${cfg.bg} ${cfg.color}`}
                        >
                          <StatusIcon size={10} />
                          {cfg.label}
                        </span>
                        <span className="font-body font-bold text-xs text-on-surface">
                          {formatIDR(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Batch Time */}
              <div className="border-t border-outline-variant/10 px-5 py-2.5 flex items-center gap-1.5">
                <Clock size={12} className="text-on-surface-variant" />
                <span className="text-[10px] text-on-surface-variant font-medium">
                  {formatTime(items[0]?.createdAt || order.createdAt)}
                </span>
              </div>
            </section>
          );
        })}

        {/* Total Footer */}
        <section className="bg-surface-container-high rounded-2xl p-5">
          <div className="flex justify-between items-center">
            <span className="font-headline font-bold text-base text-on-surface">
              Total Keseluruhan
            </span>
            <span className="font-headline font-extrabold text-xl text-primary">
              {formatIDR(order.totalAmount)}
            </span>
          </div>
          <p className="text-[10px] text-on-surface-variant mt-1">
            {batches.length} batch &bull; {order.items.length} item
          </p>
        </section>

        {/* End Session */}
        <button
          onClick={() => router.push(`/order/payment/${order.orderNumber}`)}
          className="w-full py-3.5 rounded-2xl bg-surface-container-high text-on-surface font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
        >
          <ArrowRight size={16} />
          Lihat Detail Pembayaran
        </button>
      </main>

      {/* Floating Add Order Button */}
      {canAddMore && (
        <div className="fixed bottom-0 left-0 w-full z-50 px-6 pb-8 pt-4 bg-gradient-to-t from-surface via-surface/95 to-transparent">
          <button
            onClick={handleAddOrder}
            className="w-full max-w-md mx-auto py-4 rounded-2xl bg-linear-to-br from-primary to-primary-container text-white font-bold text-sm shadow-xl shadow-primary/25 flex items-center justify-center gap-2.5 active:scale-[0.97] transition-transform"
          >
            <Plus size={20} strokeWidth={3} />
            Tambah Pesanan
          </button>
        </div>
      )}
    </div>
  );
}
