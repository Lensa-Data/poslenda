"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, Coffee, ArrowRight, Loader2 } from "lucide-react";

export default function CheckoutSuccessContent() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const searchParams = useSearchParams();
  const [countdown, setCountdown] = useState(3);
  const orderNumber = searchParams.get("order");
  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-redirect to active order dashboard after 3 seconds
  useEffect(() => {
    if (!mounted || !orderNumber) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [mounted, orderNumber]);

  useEffect(() => {
    if (countdown === 0 && orderNumber) {
      router.push("/order/active" as any);
    }
  }, [countdown, orderNumber, router]);

  if (!mounted) return null;
  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col items-center justify-center px-6">
      <main className="w-full max-w-md flex flex-col items-center gap-8 py-16">
        {/* Success Animation */}
        <div className="relative">
          <div className="w-28 h-28 rounded-full bg-green-50 flex items-center justify-center animate-[pulse_2s_ease-in-out_1]">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle
                size={48}
                className="text-green-500"
                strokeWidth={2.5}
              />
            </div>
          </div>
          <div className="absolute -bottom-1 -right-1 w-10 h-10 rounded-full bg-surface-container-lowest flex items-center justify-center shadow-lg border-2 border-green-100">
            <Coffee size={20} className="text-primary" />
          </div>
        </div>

        {/* Message */}
        <div className="text-center flex flex-col gap-3">
          <h1 className="text-2xl font-headline font-extrabold text-on-surface tracking-tight">
            Pembayaran Berhasil! 🎉
          </h1>
          <p className="text-on-surface-variant text-sm leading-relaxed max-w-[300px] mx-auto">
            Terima kasih! Pesanan Anda sedang diproses. Anda akan diarahkan ke
            halaman detail pesanan.
          </p>
        </div>

        {/* Order Info Card */}
        {orderNumber && (
          <div className="w-full bg-surface-container-low rounded-2xl p-6 flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <span className="text-on-surface-variant text-sm font-medium">
                Nomor Order
              </span>
              <span className="font-headline font-bold text-on-surface text-sm tracking-tight">
                {orderNumber}
              </span>
            </div>
            <div className="h-px bg-outline-variant/20"></div>
            <div className="flex justify-between items-center">
              <span className="text-on-surface-variant text-sm font-medium">
                Status
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-bold">
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span>
                Menunggu Konfirmasi
              </span>
            </div>
          </div>
        )}

        {/* Redirect notice */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-2 text-on-surface-variant text-sm">
            <Loader2 size={16} className="animate-spin text-primary" />
            <span>
              Mengarahkan ke detail pesanan dalam{" "}
              <span className="font-bold text-primary">{countdown}</span>{" "}
              detik...
            </span>
          </div>
          <button
            onClick={() => router.push(`/order/active` as any)}
            className="w-full py-4 px-6 rounded-2xl bg-linear-to-br from-primary to-primary-container text-white font-bold text-sm shadow-lg shadow-primary/20 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
          >
            <ArrowRight size={18} />
            Lihat Detail Pesanan
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
