"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { createOrder, updateOrderStatus, deleteOrder } from "@/app/actions/order";

export type OrderItemData = {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  options?: string;
};

export type OrderData = {
  id: string;
  orderNumber: string;
  tableId: string;
  tableName: string;
  areaName: string;
  status: "PENDING" | "PAID" | "CANCELLED";
  totalAmount: number;
  createdAt: string;
  items: OrderItemData[];
};

export type TableData = {
  id: string;
  name: string;
  areaName: string;
};

export type ProductData = {
  id: string;
  name: string;
  price: number;
  categoryId: string;
  categoryName: string;
};

interface OrderClientProps {
  initialOrders: OrderData[];
  tables: TableData[];
  products: ProductData[];
}

export default function OrderClient({ initialOrders, tables, products }: OrderClientProps) {
  const [orders, setOrders] = useState<OrderData[]>(initialOrders);
  const [activeTab, setActiveTab] = useState<"ACTIVE" | "HISTORY">("ACTIVE");
  const [search, setSearch] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modals
  const [isKasirOpen, setIsKasirOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [activeOrder, setActiveOrder] = useState<OrderData | null>(null);

  // Kasir DB State
  const [selectedTable, setSelectedTable] = useState("");
  const [cart, setCart] = useState<{ product: ProductData; qty: number }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [kasirError, setKasirError] = useState("");

  // Fetch fresh orders from the server
  const fetchOrders = useCallback(async (showSpinner = true) => {
    try {
      if (showSpinner) setIsRefreshing(true);
      const res = await fetch("/api/admin/orders");
      if (res.ok) {
        const data = await res.json();
        if (data.orders) setOrders(data.orders);
      }
    } catch (err) {
      console.error("Failed to refresh orders:", err);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Auto-refresh every 30 seconds to catch new customer orders
  useEffect(() => {
    const interval = setInterval(() => fetchOrders(false), 30000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  // Derivations
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchTab = activeTab === "ACTIVE" ? o.status === "PENDING" : (o.status === "PAID" || o.status === "CANCELLED");
      const matchSearch = o.orderNumber.toLowerCase().includes(search.toLowerCase()) || o.tableName.toLowerCase().includes(search.toLowerCase());
      return matchTab && matchSearch;
    });
  }, [orders, activeTab, search]);

  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.categoryName));
    return Array.from(cats);
  }, [products]);

  // Actions
  const handleUpdateStatus = async (orderId: string, status: "PAID" | "CANCELLED") => {
    if (!window.confirm(`Mark this order as ${status}?`)) return;
    const res = await updateOrderStatus(orderId, status);
    if (res.success) {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    } else {
      alert(res.error);
    }
  };

  const handleDelete = async (orderId: string, orderNumber: string) => {
    if (!window.confirm(`Permanently delete order ${orderNumber}? This action cannot be undone.`)) return;
    const res = await deleteOrder(orderId);
    if (res.success) {
      setOrders(prev => prev.filter(o => o.id !== orderId));
    } else {
      alert(res.error);
    }
  };

  // Kasir Logic
  const addToCart = (product: ProductData) => {
    setCart((prev) => {
      const exist = prev.find(item => item.product.id === product.id);
      if (exist) {
        return prev.map(item => item.product.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { product, qty: 1 }];
    });
  };

  const updateCartQty = (productId: string, delta: number) => {
    setCart((prev) => {
      return prev.map(item => {
        if (item.product.id === productId) {
          const newQty = item.qty + delta;
          return { ...item, qty: newQty < 1 ? 1 : newQty };
        }
        return item;
      });
    });
  };

  const removeCartItem = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.product.price * item.qty), 0);

  const submitOrder = async () => {
    if (!selectedTable) return setKasirError("Please select a table to assign this order.");
    if (cart.length === 0) return setKasirError("Cart is empty.");

    setIsLoading(true);
    setKasirError("");

    const itemsPayload = cart.map(item => ({
      productId: item.product.id,
      name: item.product.name,
      price: item.product.price,
      quantity: item.qty
    }));

    const res = await createOrder({ tableId: selectedTable, items: itemsPayload });
    
    if (res.success && res.data) {
      // Add new order to local state immediately
      const table = tables.find(t => t.id === selectedTable);
      const newOrder: OrderData = {
        id: res.data.id,
        orderNumber: res.data.orderNumber,
        tableId: selectedTable,
        tableName: table?.name || "",
        areaName: table?.areaName || "",
        status: "PENDING",
        totalAmount: cartTotal,
        createdAt: new Date().toISOString(),
        items: res.data.items.map((i: any) => ({
          id: i.id,
          productId: i.productId,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
          options: i.options || undefined,
        })),
      };
      setOrders(prev => [newOrder, ...prev]);
      setIsKasirOpen(false);
      setCart([]);
      setSelectedTable("");
    } else {
      setKasirError(res.error || "Failed to submit order");
    }
    
    setIsLoading(false);
  };

  // Formatting
  const money = (val: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val);

  // Print Receipt HTML Injection
  const printReceipt = (order: OrderData) => {
    const win = window.open("", "_blank");
    if (!win) return alert("Please allow popups to print receipt.");

    const itemsHtml = order.items.map(i => `
      <div class="row">
        <span>${i.name} x${i.quantity}</span>
        <span>${money(i.price * i.quantity)}</span>
      </div>
    `).join("");

    const htmlContent = `
      <html>
        <head>
          <title>Receipt ${order.orderNumber}</title>
          <style>
            @page { margin: 0; }
            body { 
              font-family: 'Courier New', Courier, monospace; 
              font-size: 12px;
              color: #000;
              margin: 0;
              padding: 10px;
              width: 300px; /* 80mm thermal paper width approx */
            }
            .header { text-align: center; margin-bottom: 20px; }
            .header h1 { margin: 0; font-size: 18px; text-transform: uppercase; }
            .header p { margin: 2px 0; font-size: 11px; }
            .divider { border-top: 1px dashed #000; margin: 10px 0; }
            .row { display: flex; justify-content: space-between; margin: 5px 0; }
            .total-row { display: flex; justify-content: space-between; margin: 10px 0; font-weight: bold; font-size: 14px; }
            .footer { text-align: center; margin-top: 20px; font-size: 11px; }
            
            /* Hide print button in print view itself */
            @media print {
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>SENSORY ARTISAN</h1>
            <p>123 Coffee Street, Cafe City</p>
            <p>Tel: +62 812 3456 7890</p>
          </div>
          
          <div class="divider"></div>
          
          <div class="row">
            <span>Order No:</span>
            <span>${order.orderNumber}</span>
          </div>
          <div class="row">
            <span>Table:</span>
            <span>${order.tableName} (${order.areaName})</span>
          </div>
          <div class="row">
            <span>Date:</span>
            <span>${new Date(order.createdAt).toLocaleString("id-ID")}</span>
          </div>
          <div class="row">
            <span>Status:</span>
            <span>${order.status}</span>
          </div>
          
          <div class="divider"></div>
          
          ${itemsHtml}
          
          <div class="divider"></div>
          
          <div class="total-row">
            <span>GRAND TOTAL</span>
            <span>${money(order.totalAmount)}</span>
          </div>
          
          <div class="divider"></div>
          
          <div class="footer">
            <p>Thank you for your visit!</p>
            <p>Please come again.</p>
          </div>
          
          <div class="no-print" style="margin-top: 30px; text-align: center;">
             <button onclick="window.print()" style="padding: 10px 20px; background: #000; color: #fff; border: none; cursor: pointer; border-radius: 5px; font-weight: bold;">PRINT RECEIPT</button>
             <button onclick="window.close()" style="padding: 10px 20px; background: #eee; color: #333; border: 1px solid #ccc; cursor: pointer; border-radius: 5px; margin-left: 10px;">CLOSE</button>
          </div>
          <script>
            setTimeout(() => { window.print(); }, 500);
          </script>
        </body>
      </html>
    `;

    win.document.write(htmlContent);
    win.document.close();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING": return { bg: "rgba(255,165,0,0.1)", text: "#cc8400" };
      case "PAID": return { bg: "rgba(0,128,0,0.1)", text: "green" };
      case "CANCELLED": return { bg: "rgba(255,0,0,0.1)", text: "red" };
      default: return { bg: "gray", text: "white" };
    }
  };

  return (
    <>
      {/* Header */}
      <header className="mb-8 flex justify-between items-end flex-wrap gap-4">
        <div>
          <h2
            className="text-3xl font-extrabold tracking-tight mb-1"
            style={{ fontFamily: "Manrope, sans-serif", color: "var(--a-on-surface)" }}
          >
            Order Management
          </h2>
          <p
            className="text-sm font-medium"
            style={{ color: "var(--a-on-surface-variant)" }}
          >
            Monitor live table bills, process payments, and manual POS entries.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchOrders(true)}
            disabled={isRefreshing}
            className="px-4 py-3 rounded-xl flex items-center gap-2 font-bold transition-all active:scale-95 border border-neutral-200 hover:bg-neutral-50 disabled:opacity-50"
            style={{ color: "var(--a-on-surface-variant)" }}
            title="Refresh Orders"
          >
            <span className={`material-symbols-outlined text-[20px] ${isRefreshing ? 'animate-spin' : ''}`}>sync</span>
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <button
            onClick={() => { setIsKasirOpen(true); setKasirError(""); setCart([]); setSelectedTable(""); }}
            className="px-6 py-3 rounded-xl flex items-center gap-2 font-bold shadow-lg transition-all active:scale-95 text-white"
            style={{
              background: "linear-gradient(to bottom right, var(--a-primary), var(--a-primary-container))",
            }}
          >
            <span className="material-symbols-outlined">point_of_sale</span>
            New POS Order
          </button>
        </div>
      </header>

      {/* Main Board */}
      <div 
        className="rounded-[2rem] p-6 shadow-sm border border-neutral-100 flex flex-col min-h-[500px]"
        style={{ backgroundColor: "var(--a-surface-container-low)" }}
      >
        {/* Actions Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          <div className="flex bg-[rgba(0,0,0,0.05)] rounded-2xl p-1 w-full md:w-auto">
             <button 
               onClick={() => setActiveTab("ACTIVE")}
               className={`flex-1 md:w-32 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'ACTIVE' ? 'bg-white shadow-sm' : 'opacity-60 hover:opacity-100'}`}
             >
               Active (Pending)
             </button>
             <button 
               onClick={() => setActiveTab("HISTORY")}
               className={`flex-1 md:w-32 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'HISTORY' ? 'bg-white shadow-sm' : 'opacity-60 hover:opacity-100'}`}
             >
               History
             </button>
          </div>

          <div className="flex items-center gap-3 bg-white/50 p-2 rounded-2xl border border-neutral-200 focus-within:border-[var(--a-primary)] transition-colors w-full md:w-72">
            <span className="material-symbols-outlined ml-2 text-neutral-400">search</span>
            <input 
              type="text" 
              placeholder="Search by order # or table..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent border-none outline-none w-full text-sm font-medium"
            />
          </div>
        </div>

        {/* Orders Table List */}
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b" style={{ borderColor: "var(--a-outline-variant)" }}>
                <th className="py-4 px-4 text-xs font-extrabold uppercase tracking-widest text-neutral-400">Order ID & Time</th>
                <th className="py-4 px-4 text-xs font-extrabold uppercase tracking-widest text-neutral-400">Table</th>
                <th className="py-4 px-4 text-xs font-extrabold uppercase tracking-widest text-neutral-400">Amount</th>
                <th className="py-4 px-4 text-xs font-extrabold uppercase tracking-widest text-neutral-400">Status</th>
                <th className="py-4 px-4 text-xs font-extrabold uppercase tracking-widest text-neutral-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-sm font-medium text-neutral-400">
                    No orders found.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const statusSty = getStatusColor(order.status);
                  
                  return (
                    <tr key={order.id} className="border-b hover:bg-black/5 transition-colors group" style={{ borderColor: 'rgba(0,0,0,0.05)' }}>
                      <td className="py-4 px-4">
                        <p className="font-bold text-sm" style={{ color: "var(--a-on-surface)" }}>
                          {order.orderNumber}
                        </p>
                        <p className="text-[10px] uppercase tracking-widest font-bold opacity-60">
                          {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[16px] opacity-50">table_restaurant</span>
                          <span className="font-bold text-sm" style={{ color: "var(--a-on-surface)" }}>{order.tableName}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-bold" style={{ color: "var(--a-on-surface)" }}>
                        {money(order.totalAmount)}
                        <p className="text-[10px] font-bold opacity-60 tracking-widest">{order.items.length} Items</p>
                      </td>
                      <td className="py-4 px-4">
                        <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: statusSty.bg, color: statusSty.text }}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                          
                          {/* Print Invoice */}
                          <button 
                            onClick={() => printReceipt(order)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-black/10 transition-colors"
                            title="Print Invoice"
                          >
                            <span className="material-symbols-outlined text-[18px]">receipt</span>
                          </button>
                          
                          {/* Quick Pay / Cancel logic */}
                          {order.status === "PENDING" && (
                            <>
                              <button 
                                onClick={() => handleUpdateStatus(order.id, "PAID")}
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-green-600 hover:bg-green-50 transition-colors"
                                title="Mark as Paid"
                              >
                                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                              </button>
                              <button 
                                onClick={() => handleUpdateStatus(order.id, "CANCELLED")}
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-orange-600 hover:bg-orange-50 transition-colors"
                                title="Cancel Order"
                              >
                                <span className="material-symbols-outlined text-[18px]">cancel</span>
                              </button>
                            </>
                          )}

                          {activeTab === "HISTORY" && (
                             <button 
                              onClick={() => handleDelete(order.id, order.orderNumber)}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors"
                              title="Delete Record"
                            >
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* POS Modal / Kasir Mini */}
      {isKasirOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="w-full max-w-5xl rounded-[2rem] shadow-2xl relative flex overflow-hidden max-h-[90vh]"
            style={{ backgroundColor: "var(--a-surface-container-lowest)" }}
          >
            {/* Products Selection Lane (Left) */}
            <div className="flex-[2] flex flex-col bg-white overflow-hidden rounded-l-[2rem]">
               <div className="p-6 border-b border-neutral-100 flex justify-between items-center">
                 <h2 className="text-xl font-extrabold" style={{ fontFamily: "Manrope, sans-serif", color: "var(--a-on-surface)" }}>
                   Menu Catalog
                 </h2>
                 <p className="text-xs uppercase tracking-widest font-bold opacity-50">Select Items to Add</p>
               </div>
               
               <div className="flex-1 overflow-y-auto p-6 bg-neutral-50/50">
                 {categories.map(cat => {
                   const catProducts = products.filter(p => p.categoryName === cat);
                   if (catProducts.length === 0) return null;
                   return (
                     <div key={cat} className="mb-8">
                       <h3 className="text-sm font-extrabold tracking-widest uppercase mb-4 opacity-40">{cat}</h3>
                       <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                         {catProducts.map(p => (
                           <button 
                             key={p.id} 
                             onClick={() => addToCart(p)}
                             className="text-left p-4 rounded-2xl bg-white border border-neutral-100 hover:border-[var(--a-primary)] hover:shadow-md transition-all group"
                           >
                              <h4 className="font-bold text-sm mb-1 text-neutral-800 line-clamp-1">{p.name}</h4>
                              <p className="text-xs font-bold text-neutral-500 group-hover:text-[var(--a-primary)] transition-colors">{money(p.price)}</p>
                           </button>
                         ))}
                       </div>
                     </div>
                   );
                 })}
               </div>
            </div>
            
            {/* Cart & Checkout Lane (Right) */}
            <div className="flex-1 flex flex-col border-l border-neutral-100 bg-neutral-50 shadow-inner relative max-w-md">
               <div className="absolute top-4 right-4 z-10">
                  <button 
                    onClick={() => setIsKasirOpen(false)}
                    className="p-2 bg-white rounded-full hover:bg-neutral-100 shadow-sm transition-colors"
                  >
                     <span className="material-symbols-outlined text-[20px]">close</span>
                  </button>
               </div>
               
               <div className="p-6 pr-16 bg-white border-b border-neutral-100">
                  <h2 className="text-xl font-extrabold" style={{ fontFamily: "Manrope, sans-serif", color: "var(--a-on-surface)" }}>
                   Current Order
                 </h2>
               </div>
               
               {/* Cart Items */}
               <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                  {cart.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center opacity-30 text-center px-4">
                       <span className="material-symbols-outlined text-5xl mb-2">shopping_bag</span>
                       <p className="font-bold text-sm tracking-wide">Cart is empty.<br/>Select menu items from the left.</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {cart.map(item => (
                        <div key={item.product.id} className="bg-white p-3 rounded-2xl flex items-center justify-between border border-neutral-100 shadow-sm">
                           <div className="flex-1 overflow-hidden pr-2">
                             <p className="font-bold text-sm truncate">{item.product.name}</p>
                             <p className="text-[11px] font-bold text-neutral-400">{money(item.product.price)}</p>
                           </div>
                           <div className="flex items-center gap-2 bg-neutral-50 rounded-xl p-1">
                             <button onClick={() => updateCartQty(item.product.id, -1)} className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-white shadow-sm text-neutral-500 font-bold">-</button>
                             <span className="w-4 text-center text-xs font-bold">{item.qty}</span>
                             <button onClick={() => updateCartQty(item.product.id, 1)} className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-white shadow-sm text-neutral-500 font-bold">+</button>
                           </div>
                        </div>
                      ))}
                    </div>
                  )}
               </div>
               
               {/* Setup Payload */}
               <div className="p-6 bg-white border-t border-neutral-100 shadow-[0_-10px_30px_rgba(0,0,0,0.03)] flex flex-col gap-4">
                  {kasirError && (
                    <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-bold leading-tight flex items-start gap-2">
                      <span className="material-symbols-outlined text-[16px]">error</span>
                      {kasirError}
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-[11px] font-extrabold uppercase tracking-widest mb-1.5 ml-1 opacity-70">
                      Table / Destination <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={selectedTable}
                      onChange={(e) => setSelectedTable(e.target.value)}
                      className="w-full px-4 py-3 bg-[var(--a-surface-container-highest)] rounded-2xl text-sm font-bold focus:ring-2 border-none appearance-none cursor-pointer outline-none transition-all"
                    >
                      <option value="" disabled>Select a table...</option>
                      {tables.map(t => (
                        <option key={t.id} value={t.id}>{t.name} ({t.areaName})</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex justify-between items-end mt-2 mb-2">
                    <span className="text-sm font-extrabold uppercase tracking-widest opacity-50">Subtotal</span>
                    <span className="text-2xl font-extrabold text-[var(--a-on-surface)]" style={{ fontFamily: "Manrope, sans-serif" }}>
                      {money(cartTotal)}
                    </span>
                  </div>
                  
                  <button 
                    disabled={isLoading || cart.length === 0}
                    onClick={submitOrder}
                    className="w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-sm disabled:opacity-50"
                    style={{ backgroundColor: "var(--a-primary)", color: "var(--a-on-primary)" }}
                  >
                    {isLoading ? (
                      "Processing..."
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[20px]">send</span> 
                        Place Order
                      </>
                    )}
                  </button>
               </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
