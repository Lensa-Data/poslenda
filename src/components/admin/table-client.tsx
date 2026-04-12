"use client";

import React, { useState } from "react";
import { createTable, updateTable, deleteTable } from "@/app/actions/table";

export type AreaStatInfo = {
  id: string;
  name: string;
  tableCount: number;
  totalSeats: number;
};

export type TableNode = {
  id: string;
  name: string;
  seats: number;
  qrToken: string;
  areaId: string;
  areaName: string;
  status: "Occupied" | "Available";
  guests: number;
  details: string;
};

interface TableClientProps {
  initialTables: TableNode[];
  areas: AreaStatInfo[];
  totalCapacity: number;
  totalSeats: number;
  waitListGroups: number;
}

export default function TableClient({ initialTables, areas, totalCapacity, totalSeats, waitListGroups }: TableClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [activeTable, setActiveTable] = useState<{ id: string; name: string } | null>(null);
  const [formData, setFormData] = useState({ name: "", seats: "4", areaId: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [activeQrTable, setActiveQrTable] = useState<TableNode | null>(null);

  const openCreateModal = () => {
    setModalMode("create");
    setActiveTable(null);
    setFormData({ name: "", seats: "4", areaId: areas.length > 0 ? areas[0].id : "" });
    setErrorMsg("");
    setIsModalOpen(true);
  };

  const openEditModal = (table: TableNode) => {
    setModalMode("edit");
    setActiveTable({ id: table.id, name: table.name });
    setFormData({ name: table.name, seats: table.seats.toString(), areaId: table.areaId });
    setErrorMsg("");
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.areaId) {
      setErrorMsg("Name and Area are required");
      return;
    }
    const seatsNumber = parseInt(formData.seats);
    if (isNaN(seatsNumber) || seatsNumber < 1) {
      setErrorMsg("Seats must be at least 1");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");

    const payload = {
      name: formData.name.trim(),
      seats: seatsNumber,
      areaId: formData.areaId,
    };

    let res;
    if (modalMode === "create") {
      res = await createTable(payload);
    } else if (modalMode === "edit" && activeTable) {
      res = await updateTable(activeTable.id, payload);
    }

    if (res?.success) {
      closeModal();
    } else {
      setErrorMsg(res?.error || "An error occurred");
    }
    setIsLoading(false);
  };

  const handleDelete = async (id: string, name: string) => {
    const confirm = window.confirm(`Are you sure you want to delete table "${name}"?`);
    if (!confirm) return;

    const res = await deleteTable(id);
    if (!res.success) {
      alert(res.error);
    }
  };

  // UI colors list for Area pills (cycling through)
  const areaColors = [
    "var(--a-primary-fixed)",
    "var(--a-secondary-container)",
    "var(--a-surface-container-highest)",
    "var(--a-tertiary-container)"
  ];

  return (
    <>
      {/* Header Section */}
      <header className="mb-12 flex justify-between items-end flex-wrap gap-4">
        <div className="max-w-2xl">
          <h2
            className="text-4xl font-extrabold tracking-tight mb-2"
            style={{ fontFamily: "Manrope, sans-serif", color: "var(--a-on-surface)" }}
          >
            Table Arrangement
          </h2>
          <p
            className="font-medium leading-relaxed"
            style={{ color: "var(--a-on-surface-variant)" }}
          >
            Manage your floor plan and digital guest experience.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-6 py-3 rounded-xl flex items-center gap-2 font-bold shadow-lg transition-all active:scale-95 text-white"
          style={{
            background: "linear-gradient(to bottom right, var(--a-primary), var(--a-primary-container))",
          }}
        >
          <span className="material-symbols-outlined">add_circle</span>
          Add New Table
        </button>
      </header>

      {/* Floor Sections - Asymmetric Bento Pattern */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-32">
        
        {/* Floor Overview Card */}
        <div className="md:col-span-4 lg:col-span-3 flex flex-col gap-6">
          <section
            className="rounded-3xl p-6"
            style={{ backgroundColor: "var(--a-surface-container-low)" }}
          >
            <h3
              className="text-xl font-bold mb-4"
              style={{ fontFamily: "Manrope, sans-serif" }}
            >
              Floor Overview
            </h3>
            <div className="space-y-4">
              {areas.length === 0 ? (
                <p className="text-sm opacity-60">No areas created yet.</p>
              ) : (
                areas.map((area, index) => (
                  <div
                    key={area.id}
                    className="flex items-center justify-between p-3 rounded-2xl"
                    style={{ backgroundColor: "var(--a-surface-container-lowest)" }}
                  >
                    <span className="text-sm font-medium flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: areaColors[index % areaColors.length] }}
                      ></span>
                      {area.name}
                    </span>
                    <span className="text-sm font-bold">
                      {area.tableCount} tbls
                    </span>
                  </div>
                ))
              )}
            </div>
          </section>
          
          <section
            className="rounded-3xl p-6 relative overflow-hidden"
            style={{
              backgroundColor: "var(--a-secondary-container)",
            }}
          >
            <div className="relative z-10" style={{ color: "var(--a-on-secondary-container)" }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-2 opacity-70">
                Peak Notice
              </p>
              <h4
                className="text-lg font-bold mb-1"
                style={{ fontFamily: "Manrope, sans-serif" }}
              >
                Weekend Rush
              </h4>
              <p className="text-sm opacity-80 leading-snug">
                Expected occupancy increase of 40% starting tomorrow 10:00 AM.
              </p>
            </div>
            <span
              className="material-symbols-outlined absolute -bottom-4 -right-4 text-8xl opacity-10"
              style={{ color: "var(--a-on-secondary-container)" }}
            >
              trending_up
            </span>
          </section>
        </div>

        {/* Tables Grid */}
        <div className="md:col-span-8 lg:col-span-9 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          
          {initialTables.map((table) => {
            const isOccupied = table.status === "Occupied";
            
            return (
              <article
                key={table.id}
                className={`rounded-3xl p-6 flex flex-col justify-between transition-all hover:-translate-y-1 group border-2 ${
                  isOccupied ? "border-transparent" : "border-[rgba(90,95,54,0.05)]"
                }`}
                style={{
                  backgroundColor: isOccupied
                    ? "var(--a-surface-container-highest)"
                    : "var(--a-surface-container-lowest)",
                }}
              >
                <div className="flex justify-between items-start mb-6">
                  <div
                    className="h-12 px-4 rounded-2xl flex items-center justify-center shadow-sm whitespace-nowrap"
                    style={{
                      backgroundColor: isOccupied
                        ? "var(--a-surface-container-lowest)"
                        : "var(--a-primary-fixed)",
                    }}
                  >
                    <span
                      className="text-xl font-extrabold"
                      style={{
                        fontFamily: "Manrope, sans-serif",
                        color: isOccupied
                          ? "var(--a-primary)"
                          : "var(--a-on-primary-fixed-variant)",
                      }}
                    >
                      {table.name}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => openEditModal(table)}
                      className="p-2 rounded-xl transition-colors hover:bg-[var(--a-surface-container-low)]"
                      style={{ color: "var(--a-on-surface-variant)" }}
                      title="Edit Table"
                    >
                      <span className="material-symbols-outlined text-sm">edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(table.id, table.name)}
                      className="p-2 rounded-xl transition-colors hover:bg-[rgba(186,26,26,0.1)]"
                      style={{ color: "var(--a-error)" }}
                      title="Delete Table"
                    >
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4
                      className="font-bold tracking-tight text-sm truncate"
                      style={{ fontFamily: "Manrope, sans-serif" }}
                    >
                      {table.areaName}
                    </h4>
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider shrink-0"
                      style={
                        isOccupied
                          ? {
                              backgroundColor: "var(--a-secondary-container)",
                              color: "var(--a-on-secondary-container)",
                              opacity: 0.8
                            }
                          : {
                              backgroundColor: "rgba(90, 95, 54, 0.1)",
                              color: "var(--a-primary)",
                            }
                      }
                    >
                      {table.status}
                    </span>
                  </div>
                  <p
                    className="text-xs mb-6 font-medium"
                    style={{ color: "var(--a-on-surface-variant)" }}
                  >
                    Seats {table.seats} {isOccupied ? `• ${table.guests} Guests ` : ""}• {table.details}
                  </p>
                  
                  <button
                    className="w-full py-3 rounded-xl flex items-center justify-center gap-2 font-bold text-sm transition-all hover:bg-[var(--a-primary-fixed)]"
                    style={{
                      backgroundColor: isOccupied
                        ? "var(--a-surface-container-lowest)"
                        : "var(--a-surface-container-low)",
                      color: "var(--a-primary)",
                    }}
                    onClick={() => setActiveQrTable(table)}
                  >
                    <span className="material-symbols-outlined text-lg">qr_code_2</span>
                    Show QR
                  </button>
                </div>
              </article>
            );
          })}

          {/* Add Table Placeholder - Empty State Pattern */}
          <button
            onClick={openCreateModal}
            className="border-2 border-dashed rounded-3xl p-6 flex flex-col items-center justify-center gap-3 transition-all group hover:bg-[var(--a-surface-container-low)]"
            style={{ 
              borderColor: "rgba(200, 199, 185, 0.3)",
              minHeight: "220px" 
            }} 
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center transition-transform group-hover:scale-110"
              style={{ backgroundColor: "var(--a-surface-container)" }}
            >
              <span
                className="material-symbols-outlined"
                style={{ color: "var(--a-outline)" }}
              >
                add
              </span>
            </div>
            <p className="text-sm font-bold" style={{ color: "var(--a-outline)" }}>
              Add Table
            </p>
          </button>

        </div>
      </div>

      {/* QR Code Modal */}
      {activeQrTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="w-full max-w-sm rounded-[2rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200 text-center flex flex-col items-center relative"
            style={{ backgroundColor: "var(--a-surface-container-low)" }}
          >
            <div className="w-full flex justify-end mb-2 absolute top-6 right-6">
              <button 
                onClick={() => setActiveQrTable(null)}
                className="p-2 rounded-full hover:bg-black/5 transition-colors absolute"
                title="Close"
              >
                 <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="mb-6 mt-4">
              <h2 className="text-2xl font-extrabold mb-1" style={{ fontFamily: "Manrope, sans-serif", color: "var(--a-on-surface)" }}>
                Table {activeQrTable.name}
              </h2>
              <p className="text-xs uppercase tracking-widest font-bold opacity-60" style={{ color: "var(--a-on-surface-variant)" }}>
                {activeQrTable.areaName} • {activeQrTable.seats} Seats
              </p>
            </div>
            
            <div className="bg-white p-4 rounded-3xl shadow-sm border border-neutral-100 mb-8 inline-block select-none pointer-events-none">
               <img 
                 src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&format=svg&margin=0&data=${encodeURIComponent(
                    typeof window !== "undefined" ? `${window.location.origin}/order?table=${activeQrTable.qrToken}` : activeQrTable.qrToken
                 )}`} 
                 alt={`QR Code for Table ${activeQrTable.name}`}
                 className="w-48 h-48"
                 crossOrigin="anonymous"
               />
            </div>
            
            <div className="flex gap-3 w-full">
               <button 
                 onClick={() => {
                   const win = window.open("", "_blank");
                   if (win) {
                     const url = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&format=svg&margin=0&data=${encodeURIComponent(typeof window !== "undefined" ? `${window.location.origin}/order?table=${activeQrTable.qrToken}` : activeQrTable.qrToken)}`;
                     win.document.write(`<html><head><title>Print QR - Table ${activeQrTable.name}</title><style>body { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif; margin:0; } img { width: 400px; height: 400px; margin-bottom: 2rem; } h1 { font-size: 3rem; margin: 0; } p{ font-size: 1.5rem; color: #666; margin-top:0.5rem;}</style></head><body><h1>Table ${activeQrTable.name}</h1><p>${activeQrTable.areaName}</p><img src="${url}" /></body><script>setTimeout(() => { window.print(); window.close(); }, 500);</script></html>`);
                     win.document.close();
                   }
                 }}
                 className="flex-1 py-3 rounded-xl font-bold text-sm transition-transform active:scale-95 flex items-center justify-center gap-2"
                 style={{ backgroundColor: "var(--a-primary-fixed)", color: "var(--a-on-primary-fixed)" }}
               >
                 <span className="material-symbols-outlined text-[18px]">print</span>
                 Print
               </button>
               
               <a 
                 href={`https://api.qrserver.com/v1/create-qr-code/?size=1000x1000&format=png&margin=10&data=${encodeURIComponent(typeof window !== "undefined" ? `${window.location.origin}/order?table=${activeQrTable.qrToken}` : activeQrTable.qrToken)}`}
                 download={`QR_Table_${activeQrTable.name}.png`}
                 target="_blank"
                 className="flex-1 py-3 rounded-xl font-bold text-sm transition-transform active:scale-95 flex items-center justify-center gap-2"
                 style={{ backgroundColor: "var(--a-primary)", color: "var(--a-on-primary)" }}
               >
                 <span className="material-symbols-outlined text-[18px]">download</span>
                 Download PNG
               </a>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="w-full max-w-md rounded-[2rem] p-6 shadow-2xl animate-in zoom-in-95 duration-200"
            style={{ backgroundColor: "var(--a-surface-container-low)" }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-extrabold" style={{ fontFamily: "Manrope, sans-serif", color: "var(--a-on-surface)" }}>
                {modalMode === "create" ? "Add New Table" : "Edit Table"}
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
                <label className="block text-[11px] font-extrabold uppercase tracking-widest mb-1.5 ml-1 opacity-70">
                  Table Name/Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[var(--a-primary)] focus:outline-none transition-all border-none"
                  style={{ backgroundColor: "var(--a-surface-container-highest)", color: "var(--a-on-surface)" }}
                  placeholder="e.g. S-01, OUT-05"
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-widest mb-1.5 ml-1 opacity-70">
                  Assign Area <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.areaId}
                  onChange={(e) => setFormData({...formData, areaId: e.target.value})}
                  className="w-full px-4 py-3 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[var(--a-primary)] focus:outline-none transition-all border-none appearance-none"
                  style={{ backgroundColor: "var(--a-surface-container-highest)", color: "var(--a-on-surface)" }}
                >
                  <option value="" disabled>Select area...</option>
                  {areas.map(a => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-widest mb-1.5 ml-1 opacity-70">
                  Seats Capacity <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.seats}
                  onChange={(e) => setFormData({...formData, seats: e.target.value})}
                  className="w-full px-4 py-3 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[var(--a-primary)] focus:outline-none transition-all border-none"
                  style={{ backgroundColor: "var(--a-surface-container-highest)", color: "var(--a-on-surface)" }}
                  placeholder="e.g. 4"
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
                   {isLoading ? "Saving..." : "Save Table"}
                 </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Global Quick Bill/Stats Overlay */}
      <div
        className="fixed bottom-10 right-10 z-40 p-6 rounded-[2rem] shadow-2xl hidden md:flex items-center gap-8 border"
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.7)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderColor: "rgba(255, 255, 255, 0.2)",
          boxShadow: "0 25px 50px -12px rgba(90, 95, 54, 0.1)",
        }}
      >
        <div className="flex items-center gap-4">
          <div
            className="p-3 rounded-2xl"
            style={{ backgroundColor: "var(--a-primary-fixed)" }}
          >
            <span
              className="material-symbols-outlined"
              style={{ color: "var(--a-primary)", fontVariationSettings: "'FILL' 1" }}
            >
              groups
            </span>
          </div>
          <div>
            <p
              className="text-[10px] uppercase font-extrabold tracking-widest opacity-60"
              style={{ color: "var(--a-on-surface-variant)" }}
            >
              Total Capacity
            </p>
            <p
              className="text-2xl font-extrabold"
              style={{ fontFamily: "Manrope, sans-serif", color: "var(--a-on-surface)" }}
            >
              {totalCapacity} / {totalSeats || 80}
            </p>
          </div>
        </div>
        
        <div
          className="h-10 w-[1px]"
          style={{ backgroundColor: "rgba(200, 199, 185, 0.2)" }}
        ></div>
        
        <div className="flex items-center gap-4">
          <div
            className="p-3 rounded-2xl"
            style={{ backgroundColor: "var(--a-secondary-container)" }}
          >
            <span
              className="material-symbols-outlined"
              style={{ color: "var(--a-secondary)", fontVariationSettings: "'FILL' 1" }}
            >
              pending_actions
            </span>
          </div>
          <div>
            <p
              className="text-[10px] uppercase font-extrabold tracking-widest opacity-60"
              style={{ color: "var(--a-on-surface-variant)" }}
            >
              Wait List
            </p>
            <p
              className="text-2xl font-extrabold"
              style={{ fontFamily: "Manrope, sans-serif", color: "var(--a-on-surface)" }}
            >
              {waitListGroups} <span className="text-sm font-bold" style={{ color: "var(--a-on-surface-variant)" }}>Groups</span>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
