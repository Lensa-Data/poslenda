"use client";

import { useEffect, useState } from "react";
import { useCartStore } from "@/store/cart";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import {
  ArrowLeft,
  HelpCircle,
  Clock,
  RefreshCw,
  Download,
  CheckCircle,
  Coffee,
} from "lucide-react";

export default function CheckoutPage() {
  const { getTotals, hasHydrated, clearCart, items } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);
  const totals = mounted
    ? getTotals()
    : { subtotal: 0, tax: 0, total: 0, count: 0 };

  const [qrString, setQrString] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [timeLeft, setTimeLeft] = useState(15 * 60);

  useEffect(() => {
    if (!mounted) return;
    if (items.length === 0) {
      router.push("/");
      return;
    }

    const fetchQr = async () => {
      try {
        const res = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            total: totals.total,
            items,
          }),
        });

        const data = await res.json();
        if (data.qrString) setQrString(data.qrString);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchQr();
  }, [mounted, items, totals.total]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeString = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

  const formatIDR = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleFinish = () => {
    clearCart();
    router.push("/");
  };

  if (!mounted) return null;

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
            Order QRIS
          </p>
        </div>
        <div className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container-low text-primary">
          <HelpCircle size={20} />
        </div>
      </header>

      <main className="w-full max-w-md px-6 pb-32 flex flex-col gap-6">
        <section className="flex flex-col items-center justify-center gap-2 py-4">
          <div className="px-4 py-2 bg-secondary-container/20 rounded-full flex items-center gap-2">
            <Clock size={16} className="text-secondary" />
            <span className="text-secondary font-bold font-body text-sm tracking-tighter">
              BATAS WAKTU {timeString}
            </span>
          </div>
          <p className="text-on-surface-variant text-xs text-center">
            QR code akan kedaluwarsa segera.
          </p>
        </section>

        {/* QR Code */}
        <section className="bg-surface-container-lowest rounded-[2.5rem] p-8 flex flex-col items-center gap-6 shadow-[0_12px_32px_rgba(93,98,56,0.06)] relative overflow-hidden">
          <div className="flex items-center gap-3 mb-2">
            <span className="font-headline font-extrabold text-on-surface tracking-tight text-xl">
              QRIS
            </span>
            <div className="h-4 w-px bg-outline-variant/30"></div>
            <span className="font-headline font-extrabold text-on-surface tracking-tight text-xl">
              POSLENDA
            </span>
          </div>

          <div className="relative p-4 bg-white rounded-3xl border-4 border-surface-container-high min-w-[256px] min-h-64 flex items-center justify-center">
            {loading ? (
              <RefreshCw className="animate-spin text-primary" size={36} />
            ) : qrString ? (
              <QRCodeSVG value={qrString} size={224} />
            ) : (
              <p>Gagal membuat QR.</p>
            )}

            {/* Center Logo Overlay */}
            {qrString && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-1 rounded-lg">
                <div className="w-10 h-10 bg-linear-to-br from-primary to-primary-container rounded-md flex items-center justify-center text-white">
                  <Coffee size={24} />
                </div>
              </div>
            )}
          </div>

          <div className="text-center flex flex-col gap-1">
            <p className="text-on-surface-variant text-xs font-medium">
              Total Pembayaran
            </p>
            <h2 className="text-3xl font-headline font-extrabold text-on-surface">
              {formatIDR(totals.total)}
            </h2>
          </div>
        </section>

        {/* Instructions */}
        <section className="flex flex-col gap-6">
          <div className="bg-surface-container-low rounded-3xl p-6 flex flex-col gap-4">
            <h3 className="font-headline font-bold text-sm text-on-surface">
              Metode yang diterima
            </h3>
            <div className="flex gap-4">
              <span className="text-xs font-bold text-on-surface-variant">
                GoPay, OVO, Dana, LinkAja, ShopeePay, Mobile Banking, dll.
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-4 px-2">
            <h3 className="font-headline font-bold text-sm text-on-surface">
              Cara Bayar:
            </h3>
            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-primary-fixed text-primary flex items-center justify-center shrink-0 font-bold text-xs">
                1
              </div>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Simpan QR atau scan langsung dari e-wallet Anda.
              </p>
            </div>
            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center shrink-0 font-bold text-xs">
                2
              </div>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Periksa tagihan dan selesaikan pembayaran.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Fixed Action Bar */}
      <footer className="fixed bottom-0 left-0 w-full bg-white/85 backdrop-blur-xl p-6 pb-10 flex flex-col gap-4 max-w-md mx-auto right-0 rounded-t-[2.5rem] shadow-[0_-12px_32px_rgba(93,98,56,0.1)] z-50">
        <div className="flex gap-3">
          <button className="flex-1 py-4 px-6 rounded-2xl bg-surface-container-high text-on-surface font-bold text-sm flex items-center justify-center gap-2">
            <Download size={18} />
            Simpan QR
          </button>
          <button
            onClick={handleFinish}
            className="flex-[1.5] py-4 px-6 rounded-2xl bg-linear-to-br from-primary to-primary-container text-white font-bold text-sm shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
          >
            <CheckCircle size={18} />
            Selesai
          </button>
        </div>
        <p className="text-[10px] text-center text-on-surface-variant font-medium uppercase tracking-widest opacity-60">
          Pembayaran aman by POSLENDA Gateway
        </p>
      </footer>
    </div>
  );
}
