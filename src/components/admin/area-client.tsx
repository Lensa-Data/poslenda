"use client";

import { useState } from "react";
import { createArea, updateArea, deleteArea } from "@/app/actions/area";

interface AreaNode {
  id: string;
  name: string;
  tablesCount: number;
}

interface AreaClientProps {
  initialAreas: AreaNode[];
}

export default function AreaClient({ initialAreas }: AreaClientProps) {
  const [areas, setAreas] = useState<AreaNode[]>(initialAreas);
  const [search, setSearch] = useState("");
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [activeArea, setActiveArea] = useState<{ id: string; name: string } | null>(null);
  const [areaNameInput, setAreaNameInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const filteredAreas = initialAreas.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase())
  );

  const openCreateModal = () => {
    setModalMode("create");
    setAreaNameInput("");
    setActiveArea(null);
    setErrorMsg("");
    setIsModalOpen(true);
  };

  const openEditModal = (area: AreaNode) => {
    setModalMode("edit");
    setAreaNameInput(area.name);
    setActiveArea({ id: area.id, name: area.name });
    setErrorMsg("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!areaNameInput.trim()) {
      setErrorMsg("Area name is required");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");

    let res;
    if (modalMode === "create") {
      res = await createArea(areaNameInput.trim());
    } else if (modalMode === "edit" && activeArea) {
      if (areaNameInput.trim() === activeArea.name) {
        closeModal();
        setIsLoading(false);
        return; 
      }
      res = await updateArea(activeArea.id, areaNameInput.trim());
    }

    if (res?.success) {
      closeModal();
    } else {
      setErrorMsg(res?.error || "An error occurred");
    }
    setIsLoading(false);
  };

  const handleDelete = async (id: string, name: string) => {
    const confirm = window.confirm(`Are you sure you want to delete the area "${name}"?`);
    if (!confirm) return;

    const res = await deleteArea(id);
    if (!res.success) {
      alert(res.error);
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
            Area Management
          </h2>
          <p
            className="text-sm font-medium"
            style={{ color: "var(--a-on-surface-variant)" }}
          >
            Manage floor plans, seating zones, and service areas.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-5 py-2.5 rounded-xl flex items-center gap-2 font-bold shadow-sm transition-all active:scale-95"
          style={{
            backgroundColor: "var(--a-primary)",
            color: "var(--a-on-primary)",
          }}
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          New Area
        </button>
      </header>

      {/* Main Content */}
      <div 
        className="rounded-[2rem] p-6 shadow-sm border border-neutral-100"
        style={{ backgroundColor: "var(--a-surface-container-low)" }}
      >
        <div className="flex items-center gap-3 mb-6 bg-white/50 p-2 rounded-2xl border border-neutral-200 focus-within:border-[var(--a-primary)] transition-colors">
          <span className="material-symbols-outlined ml-2 text-neutral-400">search</span>
          <input 
            type="text" 
            placeholder="Search areas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent border-none outline-none w-full text-sm font-medium"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b" style={{ borderColor: "var(--a-outline-variant)" }}>
                <th className="py-4 px-4 text-xs font-extrabold uppercase tracking-widest text-neutral-400">Area Name</th>
                <th className="py-4 px-4 text-xs font-extrabold uppercase tracking-widest text-neutral-400">Tables Linked</th>
                <th className="py-4 px-4 text-xs font-extrabold uppercase tracking-widest text-neutral-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAreas.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-12 text-center text-sm font-medium text-neutral-400">
                    No areas found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredAreas.map((area) => (
                  <tr key={area.id} className="border-b hover:bg-black/5 transition-colors" style={{ borderColor: 'rgba(0,0,0,0.05)' }}>
                    <td className="py-4 px-4 font-bold text-sm" style={{ color: "var(--a-on-surface)" }}>
                      {area.name}
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: "var(--a-surface-container-highest)", color: "var(--a-on-surface-variant)" }}>
                        {area.tablesCount} Tables
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => openEditModal(area)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-black/10 transition-colors"
                          title="Edit"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button 
                          onClick={() => handleDelete(area.id, area.name)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors text-red-500 hover:bg-red-50"
                          title="Delete"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Popup */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="w-full max-w-md rounded-[2rem] p-6 shadow-2xl animate-in zoom-in-95 duration-200"
            style={{ backgroundColor: "var(--a-surface-container-low)" }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-extrabold" style={{ fontFamily: "Manrope, sans-serif", color: "var(--a-on-surface)" }}>
                {modalMode === "create" ? "Add New Area" : "Edit Area"}
              </h2>
              <button 
                onClick={closeModal}
                className="p-1 rounded-full hover:bg-black/5 transition-colors"
              >
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
                <label className="block text-xs font-extrabold uppercase tracking-widest mb-2 opacity-70">
                  Area Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={areaNameInput}
                  onChange={(e) => setAreaNameInput(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[var(--a-primary)] focus:outline-none transition-all border-none"
                  style={{ backgroundColor: "var(--a-surface-container-highest)", color: "var(--a-on-surface)" }}
                  placeholder="e.g. VIP Lounge"
                />
              </div>

              <div className="flex gap-3 mt-4 pt-4 border-t border-neutral-100">
                 <button 
                   type="button"
                   onClick={closeModal}
                   className="flex-1 py-3 rounded-xl font-bold text-sm transition-colors hover:bg-black/5"
                   style={{ color: "var(--a-on-surface-variant)" }}
                 >
                   Cancel
                 </button>
                 <button 
                   type="submit"
                   disabled={isLoading}
                   className="flex-1 py-3 rounded-xl font-bold text-sm transition-transform active:scale-95 disabled:opacity-50"
                   style={{ backgroundColor: "var(--a-primary)", color: "var(--a-on-primary)" }}
                 >
                   {isLoading ? "Saving..." : "Save Area"}
                 </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
