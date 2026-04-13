"use client";

import Link from "next/link";
import { useCartStore } from "@/store/cart";
import {
  Bell,
  UserCircle,
  Compass,
  ShoppingCart,
  History,
  User,
  Plus,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

const menuItems = [
  {
    id: "rosemary-latte",
    name: "Rosemary Oak Milk",
    price: 65000,
    description: "Infused with fresh garden rosemary.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBDXDSNDN9AAz5glDY4dG2AU_iR6hDzxg-bFCkROf62bmnHjHpNqTum4--uWd3bbnm7rr444h0J5VTWSq3POrWZTmUbnpmfOkm8wFJG-7PxNDgh980p21fQcRqfEF6nAb0wb3M25j-FQKrrH8xWx0yarLEhIGA-h7aVUF2THTtS_6lX07qBVjZbDI9w2EPLvKR6zWNFAqpND_Ia5S8o7o_SCcKEGfVrxdZEyN7_YePikX6YYN8gRqmOkq3J6cxVYd3xLFcvUE4OwB_O",
    popular: true,
  },
  {
    id: "ethiopian-yirgacheffe",
    name: "Ethiopian Yirgacheffe",
    price: 57500,
    description: "Bright floral notes with bergamot.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCkcXDGgqtnY6r4ZLD75B616u1x1D0vVjfAdtT-kx3WipryanF-RIx4k5wLZKW3fPxH1HWWinJvkQWpTheMjI-4AQJJKwtWJ6xl2Nrig80W0fmuq8vFrscQU27lAJN2n-OB7dC9AcyW__hZCBnWP9XPQUPHMgSq4zqKD-9zoVlOWz0-U_2254G8ISzslivGoXg1wcVMZaL8_dyg-ybp40CdrpqJgrG1CJtemZgH2ijeuZEofLL2JALmwOWU--SDLyze41ceA2Zv-9gt",
  },
  {
    id: "ceremonial-iced-matcha",
    name: "Ceremonial Matcha",
    price: 70000,
    description: "Stone-ground Kyoto matcha.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDjSCl7SlempeIQYBW3PQ3VX164OxZM7KRJZ6C_VAk_30zuw-WIHgqcCAyTbqz3juWhI1ngqOS_ANLaMLsuOT4wY5RRvkyKzwJ7KYfSkJKO7Rd2U6wK4QdRAcKWdrrWsNzKKaz_YcGE_ZsXBMuMEV-BU_ClDVqVvwG9bviOAcrXR88eSp_MJAQQ284zSVYs3ZGbTdz1ysenqgRfaEI2ndVB0iHk8pcRbHM4TkUS4zswVY9yho9mVYi0sS0MVPoBtQiYGL0GoJmcb-XY",
  },
  {
    id: "double-almond-croissant",
    name: "Almond Croissant",
    price: 55000,
    description: "Three-day fermented dough.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBu-bmP2sRXt188kHrNz8RiDxLzEoapQ9iPt6a7b3Kr_bi4LB9tO_6y96yhCMHfGNQ37b3huBQ7lYCuwCvWd2972sN-xOGkKWfDAj-36g61NLeUUjez6M5zSrCGm5qi3XFUdLS4o-2FQ9iCrd_6_QEeXrt-41G1jFx1vee5enwSq659SDU8IYjzAwPms4Fh4M0GUaMWR8mQ_d3E2GkV2yuJFIgOSAAF3SEDlT-oPDFGqO3ckpsBXHtEVWACA3yvWFvUc_jEwxtXs2oH",
  },
  {
    id: "avocado-toast",
    name: "Avocado Sourdough",
    price: 45000,
    description: "Smashed avocado with cherry tomatoes.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBDXDSNDN9AAz5glDY4dG2AU_iR6hDzxg-bFCkROf62bmnHjHpNqTum4--uWd3bbnm7rr444h0J5VTWSq3POrWZTmUbnpmfOkm8wFJG-7PxNDgh980p21fQcRqfEF6nAb0wb3M25j-FQKrrH8xWx0yarLEhIGA-h7aVUF2THTtS_6lX07qBVjZbDI9w2EPLvKR6zWNFAqpND_Ia5S8o7o_SCcKEGfVrxdZEyN7_YePikX6YYN8gRqmOkq3J6cxVYd3xLFcvUE4OwB_O",
  },
  {
    id: "signature-cappuccino",
    name: "Signature Capp",
    price: 40000,
    description: "Classic Italian style cappuccino.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCkcXDGgqtnY6r4ZLD75B616u1x1D0vVjfAdtT-kx3WipryanF-RIx4k5wLZKW3fPxH1HWWinJvkQWpTheMjI-4AQJJKwtWJ6xl2Nrig80W0fmuq8vFrscQU27lAJN2n-OB7dC9AcyW__hZCBnWP9XPQUPHMgSq4zqKD-9zoVlOWz0-U_2254G8ISzslivGoXg1wcVMZaL8_dyg-ybp40CdrpqJgrG1CJtemZgH2ijeuZEofLL2JALmwOWU--SDLyze41ceA2Zv-9gt",
  },
];

interface FlyingItem {
  id: number;
  startX: number;
  startY: number;
  image: string;
}

export default function MenuPage() {
  const { addItem, getTotals, hasHydrated } = useCartStore();

  const cartCount = hasHydrated ? getTotals().count : 0;
  const cartIconRef = useRef<HTMLAnchorElement>(null);

  const [flyingItems, setFlyingItems] = useState<FlyingItem[]>([]);
  const [cartBump, setCartBump] = useState(false);
  const [showCartPopup, setShowCartPopup] = useState(false);
  const [delayedCartCount, setDelayedCartCount] = useState(cartCount);

  // Sync initial delayed count if needed, but we'll update it explicitly on fly
  useEffect(() => {
    if (flyingItems.length === 0 && !showCartPopup) {
      setDelayedCartCount(cartCount);
    }
  }, [cartCount]);

  const formatIDR = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleAddToCart = (
    e: React.MouseEvent<HTMLButtonElement>,
    item: any,
  ) => {
    // Determine start coordinates
    const rect = e.currentTarget.getBoundingClientRect();
    const startX = rect.left + rect.width / 2;
    const startY = rect.top + rect.height / 2;

    const id = Date.now();
    setFlyingItems((prev) => [
      ...prev,
      { id, startX, startY, image: item.image },
    ]);

    addItem({ ...item, quantity: 1, options: "" });
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
      setFlyingItems((prev) => prev.filter((item) => item.id !== id));
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
                {item.popular && (
                  <div className="absolute top-2 left-2 bg-white/90 backdrop-blur text-primary font-extrabold px-2 py-0.5 rounded-md text-[9px] shadow-sm uppercase tracking-wider">
                    Hot
                  </div>
                )}
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
          href="/"
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
          href={{ pathname: "/cart" }}
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

// Separate component for the flying animation to isolate effect
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
        transition: "all 0.6s cubic-bezier(0.25, 1, 0.5, 1)", // Smooth ease out curve
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
