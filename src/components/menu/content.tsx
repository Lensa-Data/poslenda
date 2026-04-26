"use client";

import Link from "next/link";
import { useCartStore } from "@/store/cart";
import { useSessionStore } from "@/store/session";
import {
  Bell,
  UserCircle,
  Compass,
  ShoppingCart,
  History,
  User,
  Plus,
  ArrowLeft,
  UtensilsCrossed,
  Loader2,
} from "lucide-react";
import { useState, useRef, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

interface FlyingItem {
  id: number;
  startX: number;
  startY: number;
  image: string;
}

type MenuItem = {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
};

function MenuContent() {
  const { setTableId, addItem, getTotals, hasHydrated } = useCartStore();
  const { sessionToken, activeOrderNumber } = useSessionStore();

  const cartCount = hasHydrated ? getTotals().count : 0;
  const cartIconRef = useRef<HTMLAnchorElement>(null);
  const searchParams = useSearchParams();
  const isAdditionalMode = searchParams.get("mode") === "additional";

  const [flyingItems, setFlyingItems] = useState<FlyingItem[]>([]);
  const [cartBump, setCartBump] = useState(false);
  const [showCartPopup, setShowCartPopup] = useState(false);
  const [delayedCartCount, setDelayedCartCount] = useState(0);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => setMenuItems(data));
  }, []);

  useEffect(() => {
    const kode = searchParams.get("table");
    if (!kode) return;
    fetch(`/api/table/${kode}`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.id) setTableId(data.id);
      });
  }, []);

  useEffect(() => {
    if (flyingItems.length === 0 && !showCartPopup) {
      setDelayedCartCount(cartCount);
    }
  }, [cartCount]);

  const formatIDR = (amount: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);

  const handleAddToCart = (
    e: React.MouseEvent<HTMLButtonElement>,
    item: MenuItem,
  ) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const startX = rect.left + rect.width / 2;
    const startY = rect.top + rect.height / 2;
    const id = Date.now();
    setFlyingItems((prev) => [
      ...prev,
      { id, startX, startY, image: item.image },
    ]);
    addItem({
      id: item.id,
      name: item.name,
      price: Number(item.price),
      image: item.image ?? "",
      quantity: 1,
      options: "",
    });
    setTimeout(() => {
      setDelayedCartCount((prev) => prev + 1);
      setCartBump(true);
      setShowCartPopup(true);
      setTimeout(() => {
        setCartBump(false);
        setShowCartPopup(false);
      }, 1500);
    }, 600);
    setTimeout(() => {
      setFlyingItems((prev) => prev.filter((i) => i.id !== id));
    }, 800);
  };

  return (
    <div className="bg-surface text-on-surface selection:bg-primary-fixed min-h-screen">
      <header className="sticky top-0 z-40 bg-[#fcf9f4]/80 backdrop-blur-xl">
        <div className="flex flex-col w-full px-4 pt-4 pb-2 max-w-full mx-auto">
          <div className="flex justify-between items-center mb-4">
            <span className="font-headline font-extrabold text-xl tracking-tight text-[#1c1c19] dark:text-stone-100">
              POSLENDA
            </span>
            <div className="flex gap-3">
              <button className="w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-stone-800 text-[#8C9163] shadow-sm active:scale-95 transition-all">
                <Bell strokeWidth={2} size={20} />
              </button>
              <button className="w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-stone-800 text-[#8C9163] shadow-sm active:scale-95 transition-all">
                <UserCircle strokeWidth={2} size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Additional Order Banner */}
      {isAdditionalMode && sessionToken && activeOrderNumber && (
        <div className="sticky top-[72px] z-30 bg-secondary/10 border-b border-secondary/20 px-4 py-3">
          <div className="flex items-center gap-3 max-w-6xl mx-auto">
            <Link
              href="/order/active"
              className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center shrink-0"
            >
              <ArrowLeft size={16} className="text-secondary" />
            </Link>
            <div className="flex-1 min-w-0">
              <p className="font-headline font-bold text-sm text-on-surface flex items-center gap-1.5">
                <UtensilsCrossed size={14} className="text-secondary" />
                Tambah Pesanan
              </p>
              <p className="text-[11px] text-on-surface-variant truncate">
                Order {activeOrderNumber} &bull; Pilih menu lalu checkout
              </p>
            </div>
          </div>
        </div>
      )}

      <main className="pb-32 pt-2">
        <section className="px-4 grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 max-w-6xl mx-auto">
          {menuItems.map((item) => (
            <div
              key={item.id}
              className="group relative bg-white dark:bg-stone-900 rounded-4xl p-3 shadow-sm border border-stone-100 dark:border-stone-800 flex flex-col"
            >
              <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-3 bg-stone-100">
                <img
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  src={item.image}
                />
                <button
                  onClick={(e) => handleAddToCart(e, item)}
                  className="absolute bottom-2 right-2 w-8 h-8 md:w-10 md:h-10 bg-primary text-white rounded-full flex items-center justify-center shadow-lg active:scale-75 transition-all z-10"
                >
                  <Plus size={18} strokeWidth={3} />
                </button>
              </div>
              <div className="flex flex-col grow">
                <h3 className="font-headline font-bold text-xs md:text-sm text-stone-800 dark:text-stone-200 leading-tight mb-1">
                  {item.name}
                </h3>
                <p className="text-stone-500 dark:text-stone-400 text-[10px] md:text-xs line-clamp-2 leading-relaxed mb-2 grow">
                  {item.description}
                </p>
                <div className="mt-auto">
                  <span className="font-body font-bold text-primary dark:text-[#c6ca98] text-xs md:text-sm">
                    {formatIDR(item.price)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </section>
      </main>
      {flyingItems.map((item) => (
        <FlyingDot key={item.id} item={item} cartIconRef={cartIconRef} />
      ))}

      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-2 md:px-4 pt-3 pb-safe-offset-4 pb-6 bg-white/90 dark:bg-stone-950/90 backdrop-blur-xl shadow-[0_-12px_32px_rgba(0,0,0,0.05)] border-t border-stone-100 dark:border-stone-800">
        <Link
          href={{ pathname: "/order" }}
          className="flex flex-col items-center justify-center text-primary px-4 py-2 transition-all active:scale-90"
        >
          <div className="bg-primary-fixed dark:bg-primary p-1.5 rounded-xl mb-1">
            <Compass size={22} className="text-primary dark:text-white" />
          </div>
          <span className="font-body font-bold text-[9px] uppercase tracking-wider dark:text-white">
            Eksplor
          </span>
        </Link>
        <Link
          ref={cartIconRef}
          href={{ pathname: "order/cart" }}
          className={`flex flex-col items-center justify-center text-stone-400 dark:text-stone-500 px-4 py-2 hover:text-primary transition-all relative ${cartBump ? "scale-125 text-primary" : "active:scale-90"}`}
        >
          <div
            className={`absolute -top-8 left-1/2 -translate-x-1/2 bg-primary text-white px-3 py-1 rounded-full text-[10px] font-bold shadow-xl shadow-primary/20 whitespace-nowrap transition-all duration-300 pointer-events-none z-20 ${showCartPopup ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-2 scale-50"}`}
          >
            {delayedCartCount} Pesanan
          </div>

          <div className="relative mb-1">
            {delayedCartCount > 0 && (
              <div className="absolute -top-1.5 -right-2 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-stone-900 z-10 transition-transform scale-100">
                {delayedCartCount}
              </div>
            )}
            <ShoppingCart size={22} />
          </div>
          <span className="font-body font-semibold text-[9px] uppercase tracking-wider">
            Keranjang
          </span>
        </Link>
        <button className="flex flex-col items-center justify-center text-stone-400 dark:text-stone-500 px-4 py-2 transition-all active:scale-90">
          <History size={22} className="mb-1" />
          <span className="font-body font-semibold text-[9px] uppercase tracking-wider">
            Riwayat
          </span>
        </button>
        <button className="flex flex-col items-center justify-center text-stone-400 dark:text-stone-500 px-4 py-2 transition-all active:scale-90">
          <User size={22} className="mb-1" />
          <span className="font-body font-semibold text-[9px] uppercase tracking-wider">
            Profil
          </span>
        </button>
      </nav>
    </div>
  );
}
function FlyingDot({
  item,
  cartIconRef,
}: {
  item: FlyingItem;
  cartIconRef: React.RefObject<HTMLAnchorElement | null>;
}) {
  const [style, setStyle] = useState({
    top: item.startY,
    left: item.startX,
    opacity: 1,
    transform: "scale(1) translate(-50%, -50%)",
  });

  useEffect(() => {
    // Ensure the cart icon exists
    if (!cartIconRef.current) return;
    const cartRect = cartIconRef.current.getBoundingClientRect();
    const endX = cartRect.left + cartRect.width / 2;
    const endY = cartRect.top + cartRect.height / 2;

    // Trigger animation slightly after mount
    requestAnimationFrame(() => {
      setStyle({
        top: endY,
        left: endX,
        opacity: 0.2,
        transform: "scale(0.2) translate(-50%, -50%)",
      });
    });
  }, [cartIconRef, item]);

  return (
    <div
      className="fixed z-100 w-12 h-12 rounded-full overflow-hidden shadow-2xl pointer-events-none"
      style={{
        ...style,
        transition: "all 0.6s cubic-bezier(0.25, 1, 0.5, 1)",
      }}
    >
      <img
        src={item.image}
        className="w-full h-full object-cover"
        alt="Flying piece"
      />
    </div>
  );
}

export default MenuContent;
