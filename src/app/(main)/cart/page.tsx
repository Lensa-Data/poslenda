"use client";

import Link from "next/link";
import { useCartStore } from "@/store/cart";
import { useRouter } from "next/navigation";
import {
  Bell,
  UserCircle,
  ShoppingCart,
  Minus,
  Plus,
  Utensils,
  Bike,
  QrCode,
  Compass,
  History,
  User,
} from "lucide-react";

export default function CartPage() {
  const { items, updateQuantity, removeItem, getTotals, hasHydrated } =
    useCartStore();
  const totals = hasHydrated
    ? getTotals()
    : { subtotal: 0, tax: 0, total: 0, count: 0 };

  const { subtotal, tax, total, count: cartCount } = totals;
  const router = useRouter();

  const formatIDR = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };
  if (!hasHydrated) {
    return <div className="p-10 text-center">Loading cart...</div>;
  }

  return (
    <div className="bg-surface text-on-surface min-h-screen pb-32">
      {/* TopNavBar */}
      <nav className="bg-[#fcf9f4] dark:bg-stone-950 font-headline font-bold text-lg sticky w-full top-0 z-40">
        <div className="flex justify-between items-center w-full px-6 py-4 max-w-full mx-auto">
          <div className="flex items-center gap-8">
            <span className="font-headline font-extrabold text-2xl tracking-tight text-[#1c1c19] dark:text-stone-100">
              POSLENDA
            </span>
            <div className="hidden md:flex items-center gap-6">
              <Link
                href="/"
                className="text-stone-500 dark:text-stone-400 font-medium hover:text-[#8C9163] transition-colors duration-200"
              >
                Menu
              </Link>
              <a
                className="text-stone-500 dark:text-stone-400 font-medium hover:text-[#8C9163] transition-colors duration-200"
                href="#"
              >
                Offers
              </a>
              <a
                className="text-[#8C9163] font-bold border-b-2 border-[#8C9163] pb-1"
                href="#"
              >
                Cart
              </a>
            </div>
          </div>
          <div className="flex items-center gap-4 text-[#8C9163]">
            <button className="p-2 transition-opacity active:opacity-80">
              <Bell size={24} strokeWidth={2} />
            </button>
            <button className="p-2 transition-opacity active:opacity-80">
              <UserCircle size={24} strokeWidth={2} />
            </button>
          </div>
        </div>
        <div className="bg-[#f2efe9] dark:bg-stone-900 h-px w-full"></div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-12">
        <header className="mb-10">
          <h1 className="text-3xl font-extrabold text-on-surface tracking-tight mb-2 font-headline">
            Preview Pesanan Anda
          </h1>
          <p className="text-on-surface-variant font-medium">
            Pastikan pesanan anda sudah sesuai dengan yang anda pilih.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Cart Items Section */}
          <section className="lg:col-span-7 space-y-8">
            {!hasHydrated || items.length === 0 ? (
              <div className="p-8 text-center bg-surface-container-low rounded-xl flex flex-col items-center">
                <ShoppingCart
                  className="text-on-surface-variant mb-4"
                  size={48}
                  strokeWidth={1.5}
                />
                <p className="text-on-surface-variant mb-4">
                  Keranjang Anda kosong.
                </p>
                <Link href="/" className="text-primary font-bold">
                  Return to Menu
                </Link>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="group relative bg-surface-container-low rounded-xl p-6 transition-all hover:bg-surface-container-high"
                >
                  <div className="flex gap-6 items-start">
                    <div className="w-24 h-24 rounded-lg overflow-hidden shrink-0">
                      <img
                        className="w-full h-full object-cover"
                        src={item.image}
                        alt={item.name}
                      />
                    </div>
                    <div className="grow">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="text-lg md:text-xl font-bold font-headline">
                          {item.name}
                        </h3>
                        <span className="font-bold text-lg text-primary">
                          {formatIDR(item.price * item.quantity)}
                        </span>
                      </div>
                      <p className="text-on-surface-variant text-sm mb-4">
                        {item.options || "Standard"}
                      </p>

                      <div className="flex justify-between items-center">
                        <div className="flex items-center bg-surface-container-highest rounded-full p-1 gap-4">
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-container-low hover:bg-white text-primary transition-colors"
                          >
                            <Minus size={16} strokeWidth={3} />
                          </button>
                          <span className="font-bold text-sm w-4 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-container-low hover:bg-white text-primary transition-colors"
                          >
                            <Plus size={16} strokeWidth={3} />
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-secondary font-semibold text-sm hover:underline decoration-2 underline-offset-4"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </section>

          {/* Checkout Controls */}
          {items.length > 0 && (
            <aside className="lg:col-span-5 space-y-8 sticky top-24">
              <div className="bg-surface-container-high rounded-2xl p-8">
                <h2 className="text-xl font-bold font-headline mb-6">
                  Pesanan Anda
                </h2>
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-center text-on-surface-variant">
                    <span className="font-medium">Subtotal</span>
                    <span className="font-bold text-on-surface">
                      {formatIDR(subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-on-surface-variant">
                    <span className="font-medium">Tax (11%)</span>
                    <span className="font-bold text-on-surface">
                      {formatIDR(tax)}
                    </span>
                  </div>
                  <div className="pt-4 mt-4 border-t border-outline-variant/20 flex justify-between items-center">
                    <span className="text-xl font-extrabold font-headline">
                      Total
                    </span>
                    <span className="text-2xl font-extrabold font-headline text-primary">
                      {formatIDR(total)}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <button
                    onClick={() => router.push("/checkout" as any)}
                    className="w-full bg-linear-to-br from-primary to-primary-container text-on-primary font-bold py-4 rounded-xl shadow-lg hover:opacity-90 transition-all transform active:scale-95 flex items-center justify-center gap-2"
                  >
                    <span>Lanjut ke QRIS Checkout</span>
                    <QrCode size={20} />
                  </button>
                </div>
              </div>
            </aside>
          )}
        </div>
      </main>

      {/* Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pt-2 pb-safe bg-[#fcf9f4]/85 dark:bg-stone-950/85 backdrop-blur-xl shadow-[0_-12px_32px_rgba(93,98,56,0.08)] rounded-t-[2rem]">
        <Link
          href="/"
          className="flex flex-col items-center justify-center text-stone-500 dark:text-stone-400 px-4 py-2 hover:bg-stone-100 dark:hover:bg-stone-800 transition-all active:scale-90 duration-200 ease-out"
        >
          <Compass size={20} className="mb-1" />
          <span className="font-['Inter'] font-semibold text-[10px] uppercase tracking-wider">
            Eksplor
          </span>
        </Link>
        <Link
          href={"/cart" as any}
          className="flex flex-col items-center justify-center bg-primary-fixed dark:bg-primary text-primary dark:text-white rounded-2xl px-6 py-2 active:scale-90 duration-200 ease-out"
        >
          <div className="relative mb-1">
            {cartCount > 0 && (
              <div className="absolute -top-1.5 -right-2 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-primary-fixed dark:border-primary z-10 transition-transform scale-100">
                {cartCount}
              </div>
            )}
            <ShoppingCart size={20} />
          </div>
          <span className="font-['Inter'] font-semibold text-[10px] uppercase tracking-wider">
            Keranjang
          </span>
        </Link>
        <button className="flex flex-col items-center justify-center text-stone-500 dark:text-stone-400 px-4 py-2 transition-all">
          <History size={20} className="mb-1" />
          <span className="font-['Inter'] font-semibold text-[10px] uppercase tracking-wider">
            Riwayat
          </span>
        </button>
        <button className="flex flex-col items-center justify-center text-stone-500 dark:text-stone-400 px-4 py-2 transition-all">
          <User size={20} className="mb-1" />
          <span className="font-['Inter'] font-semibold text-[10px] uppercase tracking-wider">
            Profil
          </span>
        </button>
      </nav>
    </div>
  );
}
