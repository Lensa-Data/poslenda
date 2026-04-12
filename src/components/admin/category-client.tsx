"use client";

import { useState } from "react";
import Link from "next/link";
import { createCategory, updateCategory, deleteCategory } from "@/app/actions/category";

export type CategoryDTO = {
  id: string;
  name: string;
  productsCount: number;
};

interface CategoryClientProps {
  initialCategories: CategoryDTO[];
}

export default function CategoryClient({ initialCategories }: CategoryClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [nameInput, setNameInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleOpenCreate = () => {
    setModalMode("create");
    setActiveId(null);
    setNameInput("");
    setErrorMsg("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (category: CategoryDTO) => {
    setModalMode("edit");
    setActiveId(category.id);
    setNameInput(category.name);
    setErrorMsg("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      setNameInput("");
      setErrorMsg("");
    }, 200);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;

    setIsLoading(true);
    setErrorMsg("");

    let res;
    if (modalMode === "create") {
      res = await createCategory(nameInput.trim());
    } else if (modalMode === "edit" && activeId) {
      res = await updateCategory(activeId, nameInput.trim());
    }

    if (res?.success) {
      closeModal();
    } else {
      setErrorMsg(res?.error || "An error occurred");
    }
    setIsLoading(false);
  };

  const handleDelete = async (id: string, count: number) => {
    if (count > 0) {
      alert(`Cannot delete this category. It contains ${count} items. Reassign or delete the items first.`);
      return;
    }

    const confirm = window.confirm("Are you sure you want to delete this category?");
    if (!confirm) return;

    const res = await deleteCategory(id);
    if (!res.success) {
      alert(res.error);
    }
  };

  return (
    <div className="md:pb-24">
      {/* ── Page Header ─────────────────────────────────────────────────────── */}
      <header className="flex justify-between items-start mb-8 flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm mb-2" style={{ color: "var(--a-on-surface-variant)" }}>
            <Link href="/mng/dashboard" className="hover:text-[var(--a-primary)] transition-colors">Dashboard</Link>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span>Master</span>
          </div>
          <h1
            className="font-extrabold text-3xl tracking-tight"
            style={{
              fontFamily: "Manrope, sans-serif",
              color: "var(--a-on-surface)",
            }}
          >
            Category Master
          </h1>
          <p
            className="text-sm mt-1"
            style={{ color: "var(--a-on-surface-variant)" }}
          >
            Manage the classifications of your artisan menu offerings.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm shadow-lg transition-transform hover:opacity-90 active:scale-95"
          style={{
            backgroundColor: "var(--a-primary)",
            color: "var(--a-on-primary)",
          }}
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          New Category
        </button>
      </header>

      {/* ── Category List ───────────────────────────────────────────────────── */}
      <section>
        <div className="rounded-[2rem] overflow-hidden shadow-sm" style={{ backgroundColor: "var(--a-surface-container-low)" }}>
          {initialCategories.length === 0 ? (
             <div
             className="flex flex-col items-center justify-center py-20 text-center"
           >
             <span
               className="material-symbols-outlined mb-3 opacity-50"
               style={{ fontSize: "52px", color: "var(--a-on-surface-variant)" }}
             >
               category
             </span>
             <p
               className="font-bold text-lg"
               style={{ color: "var(--a-on-surface)" }}
             >
               No categories defined
             </p>
             <p
               className="text-sm mt-1"
               style={{ color: "var(--a-on-surface-variant)" }}
             >
               Start by creating your first menu category.
             </p>
           </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
                    <th className="px-6 py-4 text-xs font-extrabold uppercase tracking-widest" style={{ color: "var(--a-on-surface-variant)" }}>Category Name</th>
                    <th className="px-6 py-4 text-xs font-extrabold uppercase tracking-widest text-center" style={{ color: "var(--a-on-surface-variant)" }}>Items Count</th>
                    <th className="px-6 py-4 text-xs font-extrabold uppercase tracking-widest text-right" style={{ color: "var(--a-on-surface-variant)" }}>Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: "rgba(0,0,0,0.05)" }}>
                  {initialCategories.map((cat) => (
                    <tr key={cat.id} className="transition-colors hover:bg-black/5">
                      <td className="px-6 py-5 font-bold text-sm" style={{ color: "var(--a-on-surface)" }}>
                        {cat.name}
                      </td>
                      <td className="px-6 py-5 text-center font-bold text-sm" style={{ color: "var(--a-primary)" }}>
                        {cat.productsCount}
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleOpenEdit(cat)} className="p-2 rounded-lg hover:bg-white/50 transition-colors shadow-sm" style={{ color: "var(--a-on-surface-variant)", backgroundColor: "var(--a-surface-container)" }} title="Edit">
                            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>edit</span>
                          </button>
                          <button onClick={() => handleDelete(cat.id, cat.productsCount)} className="p-2 rounded-lg hover:bg-white/50 transition-colors shadow-sm" style={{ color: "var(--a-error)", backgroundColor: "var(--a-surface-container)" }} title="Delete">
                            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* ── Modal Popup ──────────────────────────────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="w-full max-w-sm rounded-[2rem] p-6 shadow-2xl animate-in zoom-in-95 duration-200"
            style={{ backgroundColor: "var(--a-surface-container-low)" }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-extrabold" style={{ fontFamily: "Manrope, sans-serif", color: "var(--a-on-surface)" }}>
                {modalMode === "create" ? "New Category" : "Edit Category"}
              </h2>
              <button onClick={closeModal} className="p-1 rounded-full hover:bg-black/5 transition-colors">
                 <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {errorMsg && (
                <div className="p-3 bg-red-100 text-red-700 rounded-xl text-xs font-bold flex gap-2 items-center">
                   <span className="material-symbols-outlined text-[16px]">error</span>
                   {errorMsg}
                </div>
              )}
              
              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-widest mb-1.5 ml-1" style={{ color: "var(--a-on-surface-variant)" }}>
                  Name
                </label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 opacity-40 transition-opacity group-focus-within:opacity-100" style={{ fontSize: "20px", color: "var(--a-primary)" }}>
                    category
                  </span>
                  <input
                    type="text"
                    required
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="w-full pl-12 pr-5 py-4 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[var(--a-primary)] focus:outline-none transition-all border-none"
                    style={{
                      backgroundColor: "var(--a-surface-container-highest)",
                      color: "var(--a-on-surface)",
                      boxShadow: "inset 0 2px 4px rgba(0,0,0,0.02)"
                    }}
                    placeholder="e.g. Signature Blends"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                 <button 
                   type="button"
                   onClick={closeModal}
                   className="flex-1 py-3.5 rounded-xl font-bold text-sm transition-colors"
                   style={{ backgroundColor: "var(--a-surface-container)", color: "var(--a-on-surface)" }}
                 >
                   Cancel
                 </button>
                 <button 
                   type="submit"
                   disabled={isLoading}
                   className="flex-1 py-3.5 rounded-xl font-bold text-sm bg-black text-white transition-opacity active:scale-95 disabled:opacity-50"
                   style={{ backgroundColor: "var(--a-primary)", color: "var(--a-on-primary)" }}
                 >
                   {isLoading ? "Saving..." : "Save"}
                 </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
