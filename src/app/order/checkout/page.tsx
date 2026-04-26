"use client";

import { useEffect, useState } from "react";
import { useCartStore } from "@/store/cart";
import { useSessionStore } from "@/store/session";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  HelpCircle,
  Loader2,
  AlertTriangle,
  RefreshCw,
  Coffee,
  CheckCircle2,
  ShieldCheck,
  Scan,
} from "lucide-react";

export default function CheckoutPage() {
  const { getTotals, hasHydrated, clearCart, items, tableId } = useCartStore();
  const { setSession } = useSessionStore();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const totals = mounted
    ? getTotals()
    : { subtotal: 0, tax: 0, total: 0, count: 0 };

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [redirecting, setRedirecting] = useState(false);
  const [isAdditionalOrder, setIsAdditionalOrder] = useState(false);

  // ─── Demo Mode State ────────────────────────────────────────────────────────
  const [demoMode, setDemoMode] = useState(false);
  const [demoOrderNumber, setDemoOrderNumber] = useState<string | null>(null);
  const [demoAmount, setDemoAmount] = useState(0);
  const [demoPaying, setDemoPaying] = useState(false);
  const [demoPaid, setDemoPaid] = useState(false);

  const searchParams =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search)
      : null;
  const statusFromUrl = searchParams?.get("status");
  const orderFromUrl = searchParams?.get("order");

  useEffect(() => {
    if (!mounted) return;

    if (statusFromUrl === "failed") {
      setLoading(false);
      setError(
        `Pembayaran gagal untuk order ${orderFromUrl || ""}. Silakan coba lagi.`,
      );
      return;
    }

    if (items.length === 0) {
      router.push("/");
      return;
    }

    const currentTotal = getTotals().total;
    const currentItems = [...items];
    const currentSessionToken = useSessionStore.getState().sessionToken;

    // ─── Additional Order Flow ───────────────────────────────────────────────
    if (currentSessionToken) {
      setIsAdditionalOrder(true);
      const addToExistingOrder = async () => {
        try {
          const res = await fetch("/api/orders/additional", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sessionToken: currentSessionToken,
              tableId: tableId,
              items: currentItems,
            }),
          });

          const data = await res.json();

          if (data.invoiceUrl) {
            // Xendit tersedia → redirect ke halaman pembayaran QRIS
            clearCart();
            setRedirecting(true);
            window.location.href = data.invoiceUrl;
          } else if (data.demoMode) {
            // Xendit tidak tersedia → tampilkan QRIS demo
            clearCart();
            setDemoMode(true);
            setDemoOrderNumber(data.orderNumber);
            setDemoAmount(data.additionalAmount ?? 0);
            setLoading(false);
          } else if (data.error === "SESSION_INVALID") {
            useSessionStore.getState().clearSession();
            setIsAdditionalOrder(false);
            fetchNewInvoice(currentTotal, currentItems);
          } else {
            setError(data.message || data.error || "Gagal membuat invoice tambahan.");
            setLoading(false);
          }
        } catch (err) {
          console.error(err);
          setError("Terjadi kesalahan jaringan. Silakan coba lagi.");
          setLoading(false);
        }
      };

      addToExistingOrder();
      return;
    }

    // ─── New Order Flow (Batch 1) ────────────────────────────────────────────
    fetchNewInvoice(currentTotal, currentItems);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  const fetchNewInvoice = async (currentTotal: number, currentItems: any[]) => {
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          total: currentTotal,
          items: currentItems,
          tableId: tableId,
        }),
      });

      const data = await res.json();

      if (data.invoiceUrl) {
        if (data.sessionToken && data.orderNumber) {
          setSession({
            sessionToken: data.sessionToken,
            orderNumber: data.orderNumber,
            tableId: tableId ?? undefined,
          });
        }
        setRedirecting(true);
        clearCart();
        window.location.href = data.invoiceUrl;
      } else if (data.demoMode) {
        // Xendit tidak tersedia → demo mode untuk batch 1
        if (data.sessionToken && data.orderNumber) {
          setSession({
            sessionToken: data.sessionToken,
            orderNumber: data.orderNumber,
            tableId: tableId ?? undefined,
          });
        }
        clearCart();
        setDemoMode(true);
        setDemoOrderNumber(data.orderNumber);
        setDemoAmount(data.amount ?? currentTotal);
        setLoading(false);
      } else {
        setError(data.error || "Gagal membuat invoice pembayaran.");
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setError("Terjadi kesalahan jaringan. Silakan coba lagi.");
      setLoading(false);
    }
  };

  // ─── Demo Pay Handler ──────────────────────────────────────────────────────
  const handleDemoPay = async () => {
    if (!demoOrderNumber || demoPaying) return;
    setDemoPaying(true);
    try {
      const res = await fetch("/api/demo/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNumber: demoOrderNumber }),
      });
      const data = await res.json();
      if (data.success) {
        setDemoPaid(true);
        // Tunggu sebentar agar animasi terlihat, lalu redirect ke success
        setTimeout(() => {
          router.push(`/order/checkout/success?order=${demoOrderNumber}`);
        }, 1200);
      } else {
        setError(data.error || "Gagal mengkonfirmasi pembayaran demo.");
        setDemoPaying(false);
      }
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.");
      setDemoPaying(false);
    }
  };

  const formatIDR = (amount: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);

  if (!mounted) return null;

  // ─── Demo Mode UI ──────────────────────────────────────────────────────────
  if (demoMode && demoOrderNumber) {
    return (
      <div className="bg-surface text-on-surface min-h-screen flex flex-col items-center">
        <header className="w-full max-w-md flex items-center justify-between px-6 py-6 sticky top-0 bg-surface z-50">
          <div className="w-10 h-10" />
          <div className="text-center">
            <h1 className="font-headline font-bold text-lg tracking-tight">
              Pembayaran Demo
            </h1>
            <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-semibold">
              Simulasi QRIS
            </p>
          </div>
          <div className="w-10 h-10" />
        </header>

        <main className="w-full max-w-md px-6 pb-16 flex flex-col items-center gap-6">
          {/* Demo Badge */}
          <div className="w-full flex items-center gap-2.5 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
            <AlertTriangle size={16} className="text-amber-600 shrink-0" />
            <div>
              <p className="text-xs font-bold text-amber-800">Mode Demo Aktif</p>
              <p className="text-[11px] text-amber-700">
                Xendit tidak tersedia. Gunakan tombol di bawah untuk mensimulasikan pembayaran.
              </p>
            </div>
          </div>

          {/* QRIS Card */}
          <div className="w-full bg-white rounded-3xl shadow-lg shadow-black/5 border border-stone-100 overflow-hidden">
            {/* QRIS Header */}
            <div className="bg-gradient-to-r from-[#e63329] to-[#c41f15] px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Scan size={18} className="text-white" />
                <span className="font-bold text-white text-sm tracking-wider">QRIS</span>
              </div>
              <span className="text-[10px] text-red-100 font-semibold uppercase tracking-widest">
                Simulasi
              </span>
            </div>

            {/* QR Code Area */}
            <div className="flex flex-col items-center px-6 py-6 gap-4">
              {/* Generated QR from public API — no auth required */}
              <div className="relative">
                <div className="w-56 h-56 rounded-2xl overflow-hidden border-4 border-stone-100 shadow-inner bg-white flex items-center justify-center">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=224x224&data=POSLENDA-DEMO-${demoOrderNumber}&bgcolor=ffffff&color=000000&margin=8`}
                    alt="Demo QRIS Code"
                    className="w-full h-full object-contain"
                    width={224}
                    height={224}
                  />
                </div>
                {/* QRIS center logo overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-10 h-10 rounded-lg bg-white shadow border border-stone-100 flex items-center justify-center">
                    <span className="text-[8px] font-black text-[#e63329] leading-tight text-center">QR<br/>IS</span>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <p className="text-xs text-on-surface-variant font-medium">Scan kode di atas atau</p>
                <p className="text-xs text-on-surface-variant font-medium">klik tombol konfirmasi di bawah</p>
              </div>

              {/* Amount */}
              <div className="w-full bg-surface-container-low rounded-2xl px-5 py-4 flex flex-col items-center gap-1">
                <p className="text-[11px] text-on-surface-variant font-semibold uppercase tracking-widest">
                  Total Pembayaran
                </p>
                <p className="text-3xl font-headline font-extrabold text-primary tracking-tight">
                  {formatIDR(demoAmount)}
                </p>
                <p className="text-[10px] text-on-surface-variant font-medium">
                  Order: {demoOrderNumber}
                </p>
              </div>
            </div>
          </div>

          {/* Pay Button */}
          {!demoPaid ? (
            <button
              onClick={handleDemoPay}
              disabled={demoPaying}
              className="w-full py-5 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white font-bold text-base shadow-xl shadow-emerald-500/30 flex items-center justify-center gap-3 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {demoPaying ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  <CheckCircle2 size={20} />
                  Saya Sudah Bayar (Demo)
                </>
              )}
            </button>
          ) : (
            <div className="w-full py-5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center gap-3">
              <ShieldCheck size={22} className="text-emerald-600" />
              <span className="font-bold text-emerald-700">Pembayaran Dikonfirmasi!</span>
            </div>
          )}

          <p className="text-[10px] text-center text-on-surface-variant opacity-60 font-medium">
            Demo mode • Hanya untuk pengujian • Tidak memproses transaksi nyata
          </p>
        </main>
      </div>
    );
  }

  // ─── Normal Loading / Redirecting / Error UI ───────────────────────────────
  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col items-center">
      <header className="w-full max-w-md flex items-center justify-between px-6 py-6 sticky top-0 bg-surface z-50">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container-low text-on-surface-variant"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="text-center">
          <h1 className="font-headline font-bold text-lg tracking-tight">
            Checkout
          </h1>
          <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-semibold">
            QRIS Payment
          </p>
        </div>
        <div className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container-low text-primary">
          <HelpCircle size={20} />
        </div>
      </header>

      <main className="w-full max-w-md px-6 pb-32 flex flex-col gap-6 flex-1 justify-center">
        {/* Loading / Redirecting State */}
        {(loading || redirecting) && !error && (
          <section className="flex flex-col items-center justify-center gap-6 py-16">
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

            <div className="text-center flex flex-col gap-2">
              <h2 className="text-xl font-headline font-bold text-on-surface">
                {redirecting
                  ? "Mengarahkan ke halaman pembayaran..."
                  : isAdditionalOrder
                  ? "Menyiapkan pembayaran tambahan..."
                  : "Menyiapkan pembayaran..."}
              </h2>
              <p className="text-on-surface-variant text-sm max-w-[280px]">
                {redirecting
                  ? "Anda akan diarahkan ke halaman Xendit untuk menyelesaikan pembayaran QRIS."
                  : isAdditionalOrder
                  ? "Membuat invoice untuk pesanan tambahan Anda. Sebentar lagi..."
                  : "Mohon tunggu sebentar, kami sedang menyiapkan invoice pembayaran Anda."}
              </p>
            </div>

            {/* Amount Preview */}
            {!redirecting && items.length > 0 && (
              <div className="bg-surface-container-low rounded-2xl px-6 py-4 flex flex-col items-center gap-1">
                <p className="text-on-surface-variant text-xs font-medium">
                  Total Pembayaran
                </p>
                <h3 className="text-2xl font-headline font-extrabold text-on-surface">
                  {formatIDR(totals.total)}
                </h3>
              </div>
            )}
          </section>
        )}

        {/* Error State */}
        {error && (
          <section className="flex flex-col items-center justify-center gap-6 py-16">
            <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center">
              <AlertTriangle size={36} className="text-red-500" />
            </div>

            <div className="text-center flex flex-col gap-2">
              <h2 className="text-xl font-headline font-bold text-on-surface">
                Pembayaran Gagal
              </h2>
              <p className="text-on-surface-variant text-sm max-w-[300px]">
                {error}
              </p>
            </div>

            <div className="flex gap-3 w-full">
              <button
                onClick={() => router.push("/order")}
                className="flex-1 py-4 px-6 rounded-2xl bg-surface-container-high text-on-surface font-bold text-sm flex items-center justify-center gap-2"
              >
                <ArrowLeft size={18} />
                Kembali
              </button>
              <button
                onClick={() => window.location.reload()}
                className="flex-1 py-4 px-6 rounded-2xl bg-linear-to-br from-primary to-primary-container text-white font-bold text-sm shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
              >
                <RefreshCw size={18} />
                Coba Lagi
              </button>
            </div>
          </section>
        )}
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
