"use client";

import React, { useState } from "react";
import { createFee, updateFee, toggleFee, deleteFee } from "@/app/actions/fee";

export type FeeData = {
  id: string;
  name: string;
  type: "PERCENTAGE" | "FIXED";
  value: number;
  isActive: boolean;
};

export default function SettingsClient({ initialFees }: { initialFees: FeeData[] }) {
  const [fees, setFees] = useState(initialFees);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [activeFee, setActiveFee] = useState<FeeData | null>(null);
  
  const [formData, setFormData] = useState({ name: "", type: "PERCENTAGE", value: "0", isActive: true });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const openCreateModal = () => {
    setModalMode("create");
    setActiveFee(null);
    setFormData({ name: "", type: "PERCENTAGE", value: "0", isActive: true });
    setErrorMsg("");
    setIsModalOpen(true);
  };

  const openEditModal = (fee: FeeData) => {
    setModalMode("edit");
    setActiveFee(fee);
    setFormData({ name: fee.name, type: fee.type, value: fee.value.toString(), isActive: fee.isActive });
    setErrorMsg("");
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return setErrorMsg("Fee name is required");
    
    const valueNum = parseFloat(formData.value);
    if (isNaN(valueNum) || valueNum < 0) return setErrorMsg("Value must be a positive number");

    setIsLoading(true);
    setErrorMsg("");

    const payload = {
      name: formData.name.trim(),
      type: formData.type as "PERCENTAGE" | "FIXED",
      value: valueNum,
      isActive: formData.isActive
    };

    let res;
    if (modalMode === "create") {
      res = await createFee(payload);
    } else if (modalMode === "edit" && activeFee) {
      res = await updateFee(activeFee.id, payload);
    }

    if (res?.success) {
      closeModal();
      // Optimistic update omitted for brevity, rely on Next.js server component re-render
    } else {
      setErrorMsg(res?.error || "Error saving fee");
    }
    setIsLoading(false);
  };

  const handleToggle = async (id: string, currentStatus: boolean) => {
    await toggleFee(id, !currentStatus);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete fee "${name}" permanently?`)) return;
    await deleteFee(id);
  };

  return (
    <>
      <header className="mb-12 flex justify-between items-end flex-wrap gap-4">
        <div>
          <h2
            className="text-3xl font-extrabold tracking-tight mb-2"
            style={{ fontFamily: "Manrope, sans-serif", color: "var(--a-on-surface)" }}
          >
            Settings
          </h2>
          <p
            className="font-medium"
            style={{ color: "var(--a-on-surface-variant)" }}
          >
            Configure dynamic taxes, surcharges, and service fees.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-6 py-3 rounded-xl flex items-center gap-2 font-bold shadow-lg transition-transform active:scale-95 text-white"
          style={{
            background: "linear-gradient(to bottom right, var(--a-primary), var(--a-primary-container))",
          }}
        >
          <span className="material-symbols-outlined">add_circle</span>
          Add New Fee
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {initialFees.map(fee => (
          <article 
            key={fee.id} 
            className="bg-white rounded-[2rem] p-6 shadow-sm border relative overflow-hidden transition-all group hover:-translate-y-1"
            style={{ borderColor: fee.isActive ? "var(--a-primary-fixed)" : "rgba(0,0,0,0.05)" }}
          >
            {/* Status indicator */}
            <div className="absolute top-6 right-6">
               <label className="relative inline-flex items-center cursor-pointer">
                 <input type="checkbox" className="sr-only peer" checked={fee.isActive} onChange={() => handleToggle(fee.id, fee.isActive)} />
                 <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--a-primary)]"></div>
               </label>
            </div>
            
            <div className="mb-6 mt-2">
               <h3 className="text-xl font-extrabold mb-1" style={{ color: "var(--a-on-surface)" }}>{fee.name}</h3>
               <span className={`text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full ${fee.type === "PERCENTAGE" ? "bg-orange-100 text-orange-600" : "bg-blue-100 text-blue-600"}`}>
                 {fee.type}
               </span>
            </div>
            
            <p className="text-3xl font-extrabold mb-6" style={{ fontFamily: "Manrope, sans-serif", color: fee.isActive ? "var(--a-primary)" : "var(--a-on-surface-variant)" }}>
               {fee.type === "PERCENTAGE" ? `${fee.value}%` : `Rp ${fee.value.toLocaleString('id-ID')}`}
            </p>
            
            <div className="flex gap-2 pt-4 border-t border-neutral-100">
               <button onClick={() => openEditModal(fee)} className="flex-1 py-2 text-sm font-bold bg-neutral-50 rounded-xl hover:bg-neutral-100 transition-colors">Edit</button>
               <button onClick={() => handleDelete(fee.id, fee.name)} className="flex-1 py-2 text-sm font-bold bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors">Delete</button>
            </div>
          </article>
        ))}

        {initialFees.length === 0 && (
          <div className="col-span-full py-12 text-center border-2 border-dashed border-neutral-200 rounded-[2rem]">
             <span className="material-symbols-outlined text-4xl text-neutral-300 mb-2">receipt_long</span>
             <p className="text-sm font-bold text-neutral-400">No dynamic fees configured yet.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="w-full max-w-sm rounded-[2rem] p-6 shadow-2xl animate-in zoom-in-95 duration-200"
            style={{ backgroundColor: "var(--a-surface-container-low)" }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-extrabold" style={{ fontFamily: "Manrope, sans-serif", color: "var(--a-on-surface)" }}>
                {modalMode === "create" ? "Add New Fee" : "Edit Fee"}
              </h2>
              <button onClick={closeModal} className="p-1 rounded-full hover:bg-black/5 transition-colors">
                 <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {errorMsg && (
                <div className="p-3 bg-red-100 text-red-700 rounded-xl text-xs font-bold flex gap-2">
                   <span className="material-symbols-outlined text-[16px]">error</span> {errorMsg}
                </div>
              )}
              
              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-widest mb-1.5 ml-1 opacity-70">Name <span className="text-red-500">*</span></label>
                <input
                  type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[var(--a-primary)] focus:outline-none transition-all"
                  style={{ backgroundColor: "var(--a-surface-container-highest)" }} placeholder="e.g. Service Charge"
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-widest mb-1.5 ml-1 opacity-70">Calculation Type <span className="text-red-500">*</span></label>
                <select
                  value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value as any})}
                  className="w-full px-4 py-3 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[var(--a-primary)] focus:outline-none transition-all appearance-none"
                  style={{ backgroundColor: "var(--a-surface-container-highest)" }}
                >
                  <option value="PERCENTAGE">Percentage (%)</option>
                  <option value="FIXED">Fixed Nominal (Rp)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-widest mb-1.5 ml-1 opacity-70">Amount/Value <span className="text-red-500">*</span></label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold opacity-50">
                     {formData.type === "PERCENTAGE" ? "%" : "Rp"}
                  </span>
                  <input
                    type="number" step="0.01" min="0" required value={formData.value} onChange={(e) => setFormData({...formData, value: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[var(--a-primary)] focus:outline-none transition-all"
                    style={{ backgroundColor: "var(--a-surface-container-highest)" }} placeholder={formData.type === "PERCENTAGE" ? "11" : "5000"}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 mt-2">
                 <input type="checkbox" id="isActive" checked={formData.isActive} onChange={(e) => setFormData({...formData, isActive: e.target.checked})} className="w-5 h-5 accent-[var(--a-primary)] rounded" />
                 <label htmlFor="isActive" className="text-sm font-bold">Set as Active immediately</label>
              </div>

              <div className="flex gap-3 mt-4 pt-4 border-t border-neutral-100">
                 <button type="button" onClick={closeModal} className="flex-1 py-3 rounded-xl font-bold text-sm bg-neutral-100 hover:bg-neutral-200 transition-colors">Cancel</button>
                 <button type="submit" disabled={isLoading} className="flex-1 py-3 rounded-xl font-bold text-sm transition-transform active:scale-95 disabled:opacity-50 text-white" style={{ background: "var(--a-primary)" }}>
                   {isLoading ? "Saving..." : "Save Fee"}
                 </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
