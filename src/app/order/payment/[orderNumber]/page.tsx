"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  XCircle,
  Package,
  Receipt,
  MapPin,
  Coffee,
  Loader2,
  Home,
  ArrowRight,
  RefreshCw,
  Copy,
  Check,
} from "lucide-react";

type OrderStatus = "PENDING" | "PAID" | "CANCELLED";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  options: string | null;
}

interface OrderDetail {
  id: string;
  orderNumber: string;
  totalAmount: number;
  status: OrderStatus;
  paymentUrl: string | null;
  paymentId: string | null;
  createdAt: string;
  updatedAt: string;
  table: {
    name: string;
    area: {
      name: string;
    };
  };
  items: OrderItem[];
}

const statusConfig: Record<
  OrderStatus,
  {
    label: string;
    icon: typeof Clock;
    bgColor: string;
    textColor: string;
    dotColor: string;
    ringColor: string;
    description: string;
  }
> = {
  PENDING: {
    label: "Menunggu Konfirmasi",
    icon: Clock,
    bgColor: "bg-amber-50",
    textColor: "text-amber-700",
    dotColor: "bg-amber-500",
    ringColor: "ring-amber-200",
    description: "Pembayaran Anda sedang diverifikasi oleh admin.",
  },
  PAID: {
    label: "Terkonfirmasi",
    icon: CheckCircle2,
    bgColor: "bg-emerald-50",
    textColor: "text-emerald-700",
    dotColor: "bg-emerald-500",
    ringColor: "ring-emerald-200",
    description: "Pembayaran telah dikonfirmasi. Pesanan sedang diproses.",
  },
  CANCELLED: {
    label: "Dibatalkan",
    icon: XCircle,
    bgColor: "bg-red-50",
    textColor: "text-red-700",
    dotColor: "bg-red-500",
    ringColor: "ring-red-200",
    description: "Pesanan ini telah dibatalkan.",
  },
};

export default function PaymentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderNumber = params.orderNumber as string;

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrder = async (showRefresh = false) => {
    try {
      if (showRefresh) setRefreshing(true);
      const res = await fetch(`/api/orders/${orderNumber}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Gagal memuat detail pesanan.");
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
  };

  useEffect(() => {
    if (orderNumber) fetchOrder();
  }, [orderNumber]);

  // Auto-refresh every 15 seconds when status is PENDING
  useEffect(() => {
    if (!order || order.status !== "PENDING") return;
    const interval = setInterval(() => fetchOrder(), 15000);
    return () => clearInterval(interval);
  }, [order?.status]);

  const formatIDR = (amount: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
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
          Memuat detail pesanan...
        </p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="bg-surface text-on-surface min-h-screen flex flex-col items-center justify-center px-6">
        <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mb-6">
          <XCircle size={36} className="text-red-500" />
        </div>
        <h2 className="text-xl font-headline font-bold mb-2">
          Pesanan Tidak Ditemukan
        </h2>
        <p className="text-on-surface-variant text-sm text-center max-w-[280px] mb-8">
          {error || "Tidak dapat menemukan detail pesanan."}
        </p>
        <button
          onClick={() => router.push("/order" as any)}
          className="py-4 px-8 rounded-2xl bg-linear-to-br from-primary to-primary-container text-white font-bold text-sm shadow-lg shadow-primary/20 flex items-center gap-2"
        >
          <Home size={18} />
          Kembali ke Menu
        </button>
      </div>
    );
  }

  const status = statusConfig[order.status];
  const StatusIcon = status.icon;

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col items-center">
      {/* Header */}
      <header className="w-full max-w-md flex items-center justify-between px-6 py-6 sticky top-0 bg-surface/90 backdrop-blur-xl z-50">
        <button
          onClick={() => router.push("/order" as any)}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container-low text-on-surface-variant active:scale-95 transition-transform"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="text-center">
          <h1 className="font-headline font-bold text-lg tracking-tight">
            Detail Pesanan
          </h1>
          <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-semibold">
            Order Details
          </p>
        </div>
        <button
          onClick={() => fetchOrder(true)}
          disabled={refreshing}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container-low text-primary active:scale-95 transition-transform disabled:opacity-50"
        >
          <RefreshCw size={18} className={refreshing ? "animate-spin" : ""} />
        </button>
      </header>

      <main className="w-full max-w-md px-6 pb-32 flex flex-col gap-5">
        {/* Status Card */}
        <section
          className={`relative overflow-hidden rounded-3xl p-6 ${status.bgColor} ring-1 ${status.ringColor}`}
        >
          <div className="flex items-start gap-4">
            <div
              className={`w-14 h-14 rounded-2xl ${status.bgColor} flex items-center justify-center ring-2 ${status.ringColor} shrink-0`}
            >
              <StatusIcon size={28} className={status.textColor} />
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${status.dotColor} ${order.status === "PENDING" ? "animate-pulse" : ""}`}
                />
                <span
                  className={`font-headline font-bold text-base ${status.textColor}`}
                >
                  {status.label}
                </span>
              </div>
              <p className={`text-sm ${status.textColor} opacity-80`}>
                {status.description}
              </p>
            </div>
          </div>

          {/* Decorative circle */}
          <div
            className={`absolute -top-6 -right-6 w-24 h-24 rounded-full ${status.dotColor} opacity-5`}
          />
        </section>

        {/* Order Number Card */}
        <section className="bg-surface-container-low rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-fixed/30 flex items-center justify-center">
                <Receipt size={20} className="text-primary" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-semibold">
                  Nomor Order
                </p>
                <p className="font-headline font-bold text-on-surface text-sm tracking-tight mt-0.5">
                  {order.orderNumber}
                </p>
              </div>
            </div>
            <button
              onClick={handleCopy}
              className="w-9 h-9 rounded-xl bg-surface-container flex items-center justify-center text-on-surface-variant active:scale-90 transition-all"
            >
              {copied ? (
                <Check size={16} className="text-emerald-500" />
              ) : (
                <Copy size={16} />
              )}
            </button>
          </div>
        </section>

        {/* Location & Date */}
        <section className="grid grid-cols-2 gap-3">
          <div className="bg-surface-container-low rounded-2xl p-4 flex flex-col gap-2">
            <div className="w-8 h-8 rounded-lg bg-tertiary-fixed/30 flex items-center justify-center">
              <MapPin size={16} className="text-tertiary" />
            </div>
            <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-semibold">
              Lokasi
            </p>
            <p className="font-headline font-bold text-on-surface text-sm">
              {order.table.name}
            </p>
            <p className="text-xs text-on-surface-variant -mt-1">
              {order.table.area.name}
            </p>
          </div>
          <div className="bg-surface-container-low rounded-2xl p-4 flex flex-col gap-2">
            <div className="w-8 h-8 rounded-lg bg-secondary-fixed/30 flex items-center justify-center">
              <Clock size={16} className="text-secondary" />
            </div>
            <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-semibold">
              Waktu
            </p>
            <p className="font-headline font-bold text-on-surface text-sm">
              {formatDate(order.createdAt)}
            </p>
          </div>
        </section>

        {/* Items List */}
        <section className="bg-surface-container-low rounded-2xl overflow-hidden">
          <div className="px-5 pt-5 pb-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary-fixed/30 flex items-center justify-center">
              <Package size={16} className="text-primary" />
            </div>
            <h3 className="font-headline font-bold text-sm text-on-surface">
              Pesanan ({order.items.length} item)
            </h3>
          </div>

          <div className="px-5 pb-4 flex flex-col gap-3">
            {order.items.map((item, i) => (
              <div key={item.id}>
                <div className="flex justify-between items-start">
                  <div className="flex gap-3 flex-1">
                    <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-on-surface-variant">
                        {item.quantity}x
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="font-body font-semibold text-sm text-on-surface leading-tight">
                        {item.name}
                      </p>
                      {item.options && (
                        <p className="text-xs text-on-surface-variant mt-0.5">
                          {item.options}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="font-body font-bold text-sm text-on-surface shrink-0 ml-2">
                    {formatIDR(item.price * item.quantity)}
                  </span>
                </div>
                {i < order.items.length - 1 && (
                  <div className="h-px bg-outline-variant/15 mt-3" />
                )}
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="border-t border-outline-variant/20 px-5 py-4 bg-surface-container/50">
            <div className="flex justify-between items-center">
              <span className="font-headline font-bold text-sm text-on-surface">
                Total Pembayaran
              </span>
              <span className="font-headline font-extrabold text-lg text-primary">
                {formatIDR(order.totalAmount)}
              </span>
            </div>
          </div>
        </section>

        {/* Timeline / Status tracker */}
        <section className="bg-surface-container-low rounded-2xl p-5">
          <h3 className="font-headline font-bold text-sm text-on-surface mb-4">
            Status Pesanan
          </h3>
          <div className="flex flex-col gap-0">
            {/* Step 1: Order Created */}
            <div className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                </div>
                <div className="w-0.5 h-6 bg-emerald-200" />
              </div>
              <div className="pb-4">
                <p className="font-body font-semibold text-sm text-on-surface">
                  Pesanan Dibuat
                </p>
                <p className="text-xs text-on-surface-variant">
                  {formatDate(order.createdAt)}
                </p>
              </div>
            </div>

            {/* Step 2: Payment */}
            <div className="flex gap-3">
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    order.status === "CANCELLED"
                      ? "bg-red-100"
                      : "bg-emerald-100"
                  }`}
                >
                  {order.status === "CANCELLED" ? (
                    <XCircle size={16} className="text-red-600" />
                  ) : (
                    <CheckCircle2 size={16} className="text-emerald-600" />
                  )}
                </div>
                <div
                  className={`w-0.5 h-6 ${
                    order.status === "PAID"
                      ? "bg-emerald-200"
                      : order.status === "CANCELLED"
                        ? "bg-red-200"
                        : "bg-stone-200"
                  }`}
                />
              </div>
              <div className="pb-4">
                <p className="font-body font-semibold text-sm text-on-surface">
                  Pembayaran Dikirim
                </p>
                <p className="text-xs text-on-surface-variant">
                  Melalui QRIS Xendit
                </p>
              </div>
            </div>

            {/* Step 3: Admin Confirmation */}
            <div className="flex gap-3">
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    order.status === "PAID"
                      ? "bg-emerald-100"
                      : order.status === "CANCELLED"
                        ? "bg-red-100"
                        : "bg-stone-100"
                  }`}
                >
                  {order.status === "PAID" ? (
                    <CheckCircle2 size={16} className="text-emerald-600" />
                  ) : order.status === "CANCELLED" ? (
                    <XCircle size={16} className="text-red-600" />
                  ) : (
                    <Clock size={16} className="text-stone-400" />
                  )}
                </div>
              </div>
              <div>
                <p
                  className={`font-body font-semibold text-sm ${
                    order.status === "PENDING"
                      ? "text-on-surface-variant"
                      : "text-on-surface"
                  }`}
                >
                  {order.status === "PAID"
                    ? "Dikonfirmasi Admin"
                    : order.status === "CANCELLED"
                      ? "Dibatalkan"
                      : "Menunggu Konfirmasi Admin"}
                </p>
                <p className="text-xs text-on-surface-variant">
                  {order.status === "PAID"
                    ? formatDate(order.updatedAt)
                    : order.status === "CANCELLED"
                      ? "Pesanan tidak diproses"
                      : "Estimasi 1–5 menit"}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Actions */}
        <div className="flex flex-col gap-3 mt-2">
          <button
            onClick={() => router.push("/order")}
            className="w-full py-4 px-6 rounded-2xl bg-linear-to-br from-primary to-primary-container text-white font-bold text-sm shadow-lg shadow-primary/20 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
          >
            <ArrowRight size={18} />
            Pesan Lagi
          </button>
          <button
            onClick={() => router.push("/")}
            className="w-full py-4 px-6 rounded-2xl bg-surface-container-high text-on-surface font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
          >
            <Home size={18} />
            Kembali ke Beranda
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-md px-6 pb-10">
        <p className="text-[10px] text-center text-on-surface-variant font-medium uppercase tracking-widest opacity-60">
          Pembayaran aman via Xendit Payment Gateway
        </p>
      </footer>
    </div>
  );
}
