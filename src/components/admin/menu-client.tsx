"use client";

import { useState, useMemo } from "react";
import { createMenu, updateMenu, deleteMenu } from "@/app/actions/menu";

// ─── Types ────────────────────────────────────────────────────────────────────

export type StockStatus = "in-stock" | "low-stock" | "out-of-stock";
export type SortOption = "Newest first" | "Price: Low to High" | "Alphabetical";

export type CategoryDTO = {
  id: string;
  name: string;
};

export type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  categoryName: string;
  stock: number | null;
  isAvailable: boolean;
  stockStatus: StockStatus;
  imageUrl: string;
  imageAlt: string;
};

const SORT_OPTIONS: SortOption[] = [
  "Newest first",
  "Price: Low to High",
  "Alphabetical",
];

const ITEMS_PER_PAGE = 6;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function stockBadge(status: StockStatus) {
  switch (status) {
    case "in-stock":
      return {
        dot: "var(--a-primary)",
        label: "IN STOCK",
        color: "var(--a-on-surface-variant)",
      };
    case "low-stock":
      return {
        dot: "var(--a-secondary)",
        label: "LOW STOCK",
        color: "var(--a-secondary)",
      };
    case "out-of-stock":
      return {
        dot: "var(--a-error)",
        label: "OUT OF STOCK",
        color: "var(--a-error)",
      };
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

interface MenuClientProps {
  initialItems: MenuItem[];
  categories: CategoryDTO[];
}

export default function MenuClient({ initialItems, categories }: MenuClientProps) {
  const [search, setSearch] = useState("");
  const [activeCategoryId, setActiveCategoryId] = useState<string>("All Items");
  const [sortBy, setSortBy] = useState<SortOption>("Newest first");
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    categoryId: "",
    stock: "",
    isAvailable: true,
    imageUrl: "",
  });

  const displayCategories = [{ id: "All Items", name: "All Items" }, ...categories];

  const filteredAndSorted = useMemo(() => {
    let items = initialItems.filter((item) => {
      const matchesCategory =
        activeCategoryId === "All Items" || item.categoryId === activeCategoryId;
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.categoryName.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });

    if (sortBy === "Price: Low to High") {
      items = [...items].sort((a, b) => a.price - b.price);
    } else if (sortBy === "Alphabetical") {
      items = [...items].sort((a, b) => a.name.localeCompare(b.name));
    }

    return items;
  }, [search, activeCategoryId, sortBy, initialItems]);

  const visibleItems = filteredAndSorted.slice(0, visibleCount);
  const hasMore = visibleCount < filteredAndSorted.length;

  function handleCategoryChange(catId: string) {
    setActiveCategoryId(catId);
    setVisibleCount(ITEMS_PER_PAGE);
  }

  function handleSearchChange(value: string) {
    setSearch(value);
    setVisibleCount(ITEMS_PER_PAGE);
  }

  // ─── Modal Actions ───────────────────────────────────────────────────────

  const openCreateModal = () => {
    setModalMode("create");
    setActiveId(null);
    setFormData({
      name: "",
      description: "",
      price: "",
      categoryId: categories.length > 0 ? categories[0].id : "",
      stock: "",
      isAvailable: true,
      imageUrl: "",
    });
    setErrorMsg("");
    setIsModalOpen(true);
  };

  const openEditModal = (item: MenuItem) => {
    setModalMode("edit");
    setActiveId(item.id);
    setFormData({
      name: item.name,
      description: item.description || "",
      price: item.price.toString(),
      categoryId: item.categoryId,
      stock: item.stock !== null ? item.stock.toString() : "",
      isAvailable: item.isAvailable,
      imageUrl: item.imageUrl || "",
    });
    setErrorMsg("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.categoryId) {
      setErrorMsg("Name and Category are required");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");

    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      price: parseFloat(formData.price) || 0,
      categoryId: formData.categoryId,
      stock: formData.stock.trim() ? parseInt(formData.stock) : null,
      isAvailable: formData.isAvailable,
      imageUrl: formData.imageUrl.trim() || undefined,
    };

    let res;
    if (modalMode === "create") {
      res = await createMenu(payload);
    } else if (modalMode === "edit" && activeId) {
      res = await updateMenu(activeId, payload);
    }

    if (res?.success) {
      closeModal();
    } else {
      setErrorMsg(res?.error || "An error occurred");
    }
    setIsLoading(false);
  };

  const handleDelete = async (id: string, name: string) => {
    const confirm = window.confirm(`Are you sure you want to delete "${name}"?`);
    if (!confirm) return;

    const res = await deleteMenu(id);
    if (!res.success) {
      alert(res.error);
    }
  };

  return (
    <div className="md:pb-24">
      {/* ── Page Header ─────────────────────────────────────────────────────── */}
      <header className="flex justify-between items-start mb-8 flex-wrap gap-4">
        <div>
          <h1
            className="font-extrabold text-3xl tracking-tight"
            style={{
              fontFamily: "Manrope, sans-serif",
              color: "var(--a-on-surface)",
            }}
          >
            Menu Management
          </h1>
          <p
            className="text-sm mt-1"
            style={{ color: "var(--a-on-surface-variant)" }}
          >
            Curate your sensory offerings for the season.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm shadow-lg transition-transform hover:opacity-90 active:scale-95"
          style={{
            backgroundColor: "var(--a-primary)",
            color: "var(--a-on-primary)",
          }}
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Add New Item
        </button>
      </header>

      {/* ── Filters & Search ─────────────────────────────────────────────────── */}
      <section className="mb-8">
        <div
          className="rounded-2xl p-5 flex flex-col md:flex-row gap-5 md:items-center"
          style={{ backgroundColor: "var(--a-surface-container-low)" }}
        >
          {/* Search input */}
          <div className="relative w-full md:w-96 shrink-0">
            <span
              className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ fontSize: "20px", color: "var(--a-on-surface-variant)" }}
            >
              search
            </span>
            <input
              className="search-input w-full pl-12 pr-4 py-3 rounded-xl text-sm"
              placeholder="Search items, ingredients…"
              type="text"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>

          {/* Category pills */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide flex-1">
            {displayCategories.map((cat) => (
              <button
                key={cat.id}
                className={`filter-btn px-4 py-2 rounded-xl text-sm whitespace-nowrap${
                  activeCategoryId === cat.id ? " active" : ""
                }`}
                onClick={() => handleCategoryChange(cat.id)}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2 shrink-0 md:ml-auto">
            <span
              className="text-[11px] font-bold uppercase tracking-widest opacity-50 whitespace-nowrap"
              style={{ color: "var(--a-on-surface-variant)" }}
            >
              Sort by:
            </span>
            <select
              className="bg-transparent border-none text-sm font-bold focus:ring-0 cursor-pointer outline-none"
              style={{ color: "var(--a-primary)" }}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* ── Menu Grid ────────────────────────────────────────────────────────── */}
      <section>
        {filteredAndSorted.length === 0 ? (
          /* Empty state */
          <div
            className="flex flex-col items-center justify-center py-20 rounded-3xl text-center"
            style={{ backgroundColor: "var(--a-surface-container-low)" }}
          >
            <span
              className="material-symbols-outlined mb-3"
              style={{ fontSize: "52px", color: "var(--a-outline)" }}
            >
              search_off
            </span>
            <p
              className="font-bold text-lg"
              style={{ color: "var(--a-on-surface)" }}
            >
              No items found
            </p>
            <p
              className="text-sm mt-1"
              style={{ color: "var(--a-on-surface-variant)" }}
            >
              Try adjusting your search or filter.
            </p>
            <button
              className="mt-4 px-5 py-2 rounded-xl text-sm font-bold transition-opacity hover:opacity-80"
              style={{
                backgroundColor: "var(--a-primary-fixed)",
                color: "var(--a-primary)",
              }}
              onClick={() => {
                setSearch("");
                setActiveCategoryId("All Items");
              }}
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
            {visibleItems.map((item) => {
              const stock = stockBadge(item.stockStatus);
              return (
                <div key={item.id} className="menu-card group rounded-[2rem] p-4 flex gap-5 items-center relative overflow-hidden">
                  {/* Thumbnail */}
                  <div className="w-32 h-32 rounded-3xl overflow-hidden shrink-0 bg-neutral-100 flex items-center justify-center">
                    {item.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.imageUrl}
                        alt={item.imageAlt}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <span className="material-symbols-outlined text-4xl text-neutral-300">
                        hide_image
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 flex flex-col justify-between h-32 min-w-0">
                    {/* Top row */}
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <span
                          className="text-[10px] uppercase font-extrabold tracking-widest px-2 py-0.5 rounded-full shrink-0"
                          style={{
                            backgroundColor: "var(--a-primary-fixed)",
                            color: "var(--a-on-primary-fixed-variant)",
                          }}
                        >
                          {item.categoryName}
                        </span>
                        <span
                          className="text-lg font-bold shrink-0"
                          style={{ color: "var(--a-primary)" }}
                        >
                          ${item.price.toFixed(2)}
                        </span>
                      </div>
                      <h3
                        className="font-bold text-xl mt-1 truncate"
                        style={{
                          fontFamily: "Manrope, sans-serif",
                          color: "var(--a-on-surface)",
                        }}
                      >
                        {item.name}
                      </h3>
                      <p
                        className="text-xs mt-0.5 line-clamp-2"
                        style={{ color: "var(--a-on-surface-variant)" }}
                      >
                        {item.description}
                      </p>
                    </div>

                    {/* Actions row */}
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEditModal(item)} className="btn-edit p-2 rounded-lg" title="Edit item">
                        <span
                          className="material-symbols-outlined"
                          style={{ fontSize: "20px" }}
                        >
                          edit
                        </span>
                      </button>
                      <button onClick={() => handleDelete(item.id, item.name)} className="btn-delete p-2 rounded-lg" title="Delete item">
                        <span
                          className="material-symbols-outlined"
                          style={{ fontSize: "20px" }}
                        >
                          delete
                        </span>
                      </button>

                      {/* Stock status */}
                      <div
                        className="ml-auto flex items-center gap-1.5 shrink-0"
                        style={{ color: stock.color }}
                      >
                        <div
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: stock.dot }}
                        />
                        <span className="text-[10px] font-bold">{stock.label}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── Load More ────────────────────────────────────────────────────────── */}
      {filteredAndSorted.length > 0 && (
        <div className="mt-12 flex flex-col items-center gap-3">
          {hasMore && (
            <button
              className="px-8 py-3 rounded-xl font-bold text-sm transition-colors"
              style={{
                backgroundColor: "var(--a-surface-container-high)",
                color: "var(--a-on-surface)",
              }}
              onClick={() => setVisibleCount((c) => c + ITEMS_PER_PAGE)}
            >
              Load More Items
            </button>
          )}
          <p
            className="text-xs"
            style={{ color: "var(--a-on-surface-variant)" }}
          >
            Showing {visibleItems.length} of {filteredAndSorted.length} menu offerings
          </p>
        </div>
      )}

      {/* ── Modal Popup ──────────────────────────────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
          <div 
            className="w-full max-w-2xl rounded-[2rem] p-6 shadow-2xl animate-in zoom-in-95 duration-200 mt-20 mb-20 sm:my-auto"
            style={{ backgroundColor: "var(--a-surface-container-low)" }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-extrabold" style={{ fontFamily: "Manrope, sans-serif", color: "var(--a-on-surface)" }}>
                {modalMode === "create" ? "Add New Menu Item" : "Edit Menu Item"}
              </h2>
              <button onClick={closeModal} className="p-1 rounded-full hover:bg-black/5 transition-colors">
                 <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {errorMsg && (
                <div className="p-3 bg-red-100 text-red-700 rounded-xl text-xs font-bold flex gap-2 items-center">
                   <span className="material-symbols-outlined text-[16px]">error</span>
                   {errorMsg}
                </div>
              )}
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Name */}
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-extrabold uppercase tracking-widest mb-1.5 ml-1" style={{ color: "var(--a-on-surface-variant)" }}>
                    Item Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-3.5 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[var(--a-primary)] focus:outline-none transition-all border-none"
                    style={{ backgroundColor: "var(--a-surface-container-highest)", color: "var(--a-on-surface)" }}
                    placeholder="e.g. Lavender Honey Latte"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-widest mb-1.5 ml-1" style={{ color: "var(--a-on-surface-variant)" }}>
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.categoryId}
                    onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                    className="w-full px-4 py-3.5 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[var(--a-primary)] focus:outline-none transition-all border-none appearance-none"
                    style={{ backgroundColor: "var(--a-surface-container-highest)", color: "var(--a-on-surface)" }}
                  >
                    <option value="" disabled>Select category...</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Price */}
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-widest mb-1.5 ml-1" style={{ color: "var(--a-on-surface-variant)" }}>
                    Price ($) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    className="w-full px-4 py-3.5 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[var(--a-primary)] focus:outline-none transition-all border-none"
                    style={{ backgroundColor: "var(--a-surface-container-highest)", color: "var(--a-on-surface)" }}
                    placeholder="0.00"
                  />
                </div>

                {/* Image URL */}
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-extrabold uppercase tracking-widest mb-1.5 ml-1" style={{ color: "var(--a-on-surface-variant)" }}>
                    Image URL
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="url"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                      className="flex-1 px-4 py-3.5 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[var(--a-primary)] focus:outline-none transition-all border-none"
                      style={{ backgroundColor: "var(--a-surface-container-highest)", color: "var(--a-on-surface)" }}
                      placeholder="https://example.com/image.jpg"
                    />
                    {formData.imageUrl && (
                      <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-neutral-200">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                      </div>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-extrabold uppercase tracking-widest mb-1.5 ml-1" style={{ color: "var(--a-on-surface-variant)" }}>
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-4 py-3.5 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[var(--a-primary)] focus:outline-none transition-all border-none resize-none"
                    style={{ backgroundColor: "var(--a-surface-container-highest)", color: "var(--a-on-surface)" }}
                    placeholder="Describe the sensory experience..."
                  />
                </div>

                {/* Stock */}
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-widest mb-1.5 ml-1" style={{ color: "var(--a-on-surface-variant)" }}>
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={formData.stock}
                    onChange={(e) => setFormData({...formData, stock: e.target.value})}
                    className="w-full px-4 py-3.5 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[var(--a-primary)] focus:outline-none transition-all border-none"
                    style={{ backgroundColor: "var(--a-surface-container-highest)", color: "var(--a-on-surface)" }}
                    placeholder="Leave empty for unlimited"
                  />
                </div>

                {/* Available Toggle */}
                <div className="flex items-center mt-6 gap-3">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={formData.isAvailable}
                      onChange={(e) => setFormData({...formData, isAvailable: e.target.checked})}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--a-primary)]"></div>
                  </label>
                  <span className="text-sm font-bold" style={{ color: "var(--a-on-surface)" }}>
                    Is Available
                  </span>
                </div>

              </div>

              <div className="flex gap-3 mt-4 pt-4 border-t border-neutral-100">
                 <button 
                   type="button"
                   onClick={closeModal}
                   className="flex-1 py-3.5 rounded-xl font-bold text-sm transition-colors hover:opacity-80"
                   style={{ backgroundColor: "var(--a-surface-container-highest)", color: "var(--a-on-surface)" }}
                 >
                   Cancel
                 </button>
                 <button 
                   type="submit"
                   disabled={isLoading}
                   className="flex-1 py-3.5 rounded-xl font-bold text-sm transition-transform active:scale-95 disabled:opacity-50"
                   style={{ backgroundColor: "var(--a-primary)", color: "var(--a-on-primary)" }}
                 >
                   {isLoading ? "Saving..." : "Save Product"}
                 </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Floating Status Footer (desktop only) ────────────────────────────── */}
      <footer className="hidden md:block fixed bottom-0 left-64 right-0 z-40 px-6 py-4 pointer-events-none">
        <div
          className="max-w-5xl mx-auto glass-panel rounded-3xl px-6 py-4 flex items-center justify-between pointer-events-auto"
          style={{
            border: "1px solid rgba(120, 120, 108, 0.15)",
            boxShadow: "0 -12px 32px rgba(93, 98, 56, 0.07)",
          }}
        >
          {/* Left: status info */}
          <div className="flex gap-8 items-center">
            <div>
              <p
                className="text-[10px] font-extrabold uppercase tracking-widest"
                style={{ color: "var(--a-on-surface-variant)" }}
              >
                Active Menu
              </p>
              <p
                className="text-sm font-bold mt-0.5"
                style={{ color: "var(--a-primary)" }}
              >
                Live Database
              </p>
            </div>

            <div className="hidden lg:block">
              <p
                className="text-[10px] font-extrabold uppercase tracking-widest"
                style={{ color: "var(--a-on-surface-variant)" }}
              >
                Items
              </p>
              <p
                className="text-sm font-bold mt-0.5"
                style={{ color: "var(--a-on-surface)" }}
              >
                {initialItems.length} offerings
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
