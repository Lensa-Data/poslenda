"use client";

import React, { useState } from "react";
import "@/app/mng/admin.css"; // Ensure design tokens/variables are loaded
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function MngLoginPage() {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState("");

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorText("");

    try {
      if (activeTab === "register") {
        const { error } = await authClient.signUp.email({
          email,
          password,
          name,
        });
        if (error) throw error;
        // Proceed on success, redirect
        router.push("/mng/dashboard");
      } else {
        const { error } = await authClient.signIn.email({
          email,
          password,
        });
        if (error) throw error;
        router.push("/mng/dashboard");
      }
    } catch (err: any) {
      setErrorText(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;700;800&family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,1&display=swap"
      />

      <div
        className="min-h-screen flex"
        style={{ backgroundColor: "var(--a-surface-container-low)" }}
      >
        {/* Left Panel - Premium Imagery (hidden on mobile) */}
        <div className="hidden lg:flex lg:w-1/2 relative bg-black items-center justify-center overflow-hidden flex-col">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=2671&auto=format&fit=crop"
            alt="Artisan Coffee Extraction"
            className="absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-overlay hover:scale-105 transition-transform duration-[10s]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
          
          <div className="relative z-10 p-16 w-full flex flex-col justify-between h-full">
            <div>
              <div
                className="inline-flex w-16 h-16 rounded-2xl items-center justify-center mb-8"
                style={{ backgroundColor: "var(--a-primary)", color: "var(--a-on-primary)" }}
              >
                <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  local_cafe
                </span>
              </div>
              <h1
                className="text-6xl font-extrabold tracking-tight mb-6 text-white"
                style={{ fontFamily: "Manrope, sans-serif", textShadow: "0 4px 20px rgba(0,0,0,0.5)" }}
              >
                Sensory <br/> Artisan
              </h1>
              <p className="text-xl font-medium text-white/80 leading-relaxed max-w-md">
                Elevating the coffee experience through meticulous craft, fine-tuned sourcing, and seamless management.
              </p>
            </div>
            
            <div className="flex gap-4">
               <div className="w-12 h-1 rounded-full bg-white/20 overflow-hidden">
                  <div className="w-1/2 h-full bg-white"></div>
               </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Form Canvas */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
          
          {/* Mobile decorative top bar */}
          <div className="lg:hidden absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-black/50 to-transparent z-0">
             {/* eslint-disable-next-line @next/next/no-img-element */}
             <img
                src="https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=800&auto=format&fit=crop"
                className="w-full h-full object-cover mix-blend-overlay"
                alt=""
             />
          </div>

          <div className="w-full max-w-[420px] relative z-10">
            {/* Form Header */}
            <div className="text-center mb-10 mt-10 lg:mt-0">
              <div
                className="inline-flex w-16 h-16 rounded-[1.2rem] items-center justify-center mb-6 shadow-sm ring-4 ring-white"
                style={{ backgroundColor: "var(--a-primary-fixed)" }}
              >
                <span
                  className="material-symbols-outlined text-3xl"
                  style={{ color: "var(--a-primary)", fontVariationSettings: "'FILL' 1" }}
                >
                  coffee_maker
                </span>
              </div>
              <h2
                className="text-3xl font-extrabold tracking-tight mb-2"
                style={{ fontFamily: "Manrope, sans-serif", color: "var(--a-on-surface)" }}
              >
                {activeTab === "login" ? "Welcome Back" : "Create Account"}
              </h2>
              <p
                className="text-sm font-medium px-4"
                style={{ color: "var(--a-on-surface-variant)" }}
              >
                {activeTab === "login"
                  ? "Enter your credentials to access the management portal."
                  : "Join us and configure your artisan workspace today."}
              </p>
            </div>

            {/* Premium Tab Switcher */}
            <div
              className="flex p-1.5 rounded-2xl mb-8 relative z-0"
              style={{ backgroundColor: "var(--a-surface-container)" }}
            >
              {/* Highlight Slider */}
              <div
                className="absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] rounded-xl transition-all duration-300 ease-out shadow-sm -z-10"
                style={{
                  backgroundColor: "var(--a-surface-container-lowest)",
                  left: activeTab === "login" ? "6px" : "calc(50%)",
                }}
              />

              <button
                type="button"
                onClick={() => {
                  setActiveTab("login");
                  setErrorText("");
                }}
                className="flex-1 py-3 text-sm font-bold rounded-xl transition-colors duration-200"
                style={{
                  color:
                    activeTab === "login"
                      ? "var(--a-on-surface)"
                      : "var(--a-on-surface-variant)",
                }}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("register");
                  setErrorText("");
                }}
                className="flex-1 py-3 text-sm font-bold rounded-xl transition-colors duration-200"
                style={{
                  color:
                    activeTab === "register"
                      ? "var(--a-on-surface)"
                      : "var(--a-on-surface-variant)",
                }}
              >
                Register
              </button>
            </div>

            {/* Auth Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {errorText && (
                <div
                  className="p-4 rounded-xl text-sm font-bold flex gap-3 items-center animate-in fade-in slide-in-from-top-2"
                  style={{
                    backgroundColor: "rgba(186,26,26,0.1)",
                    color: "var(--a-error)",
                  }}
                >
                  <span className="material-symbols-outlined text-lg">error</span>
                  {errorText}
                </div>
              )}

              <div className="flex flex-col gap-4">
                {activeTab === "register" && (
                  <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <label
                      className="block text-[11px] font-extrabold uppercase tracking-widest mb-1.5 ml-1"
                      style={{ color: "var(--a-on-surface-variant)" }}
                    >
                      Full Name
                    </label>
                    <div className="relative group">
                      <span
                        className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 opacity-40 transition-opacity group-focus-within:opacity-100"
                        style={{ fontSize: "20px", color: "var(--a-primary)" }}
                      >
                        person
                      </span>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-12 pr-5 py-4 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[var(--a-primary)] focus:outline-none transition-all border-none"
                        style={{
                          backgroundColor: "var(--a-surface-container-lowest)",
                          color: "var(--a-on-surface)",
                          boxShadow: "0 2px 10px rgba(0,0,0,0.02)"
                        }}
                        placeholder="e.g. Marcus Jenkins"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label
                    className="block text-[11px] font-extrabold uppercase tracking-widest mb-1.5 ml-1"
                    style={{ color: "var(--a-on-surface-variant)" }}
                  >
                    Email Address
                  </label>
                  <div className="relative group">
                    <span
                      className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 opacity-40 transition-opacity group-focus-within:opacity-100"
                      style={{ fontSize: "20px", color: "var(--a-primary)" }}
                    >
                      mail
                    </span>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-5 py-4 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[var(--a-primary)] focus:outline-none transition-all border-none"
                      style={{
                        backgroundColor: "var(--a-surface-container-lowest)",
                        color: "var(--a-on-surface)",
                        boxShadow: "0 2px 10px rgba(0,0,0,0.02)"
                      }}
                      placeholder="hello@artisan.com"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-end mb-1.5 ml-1">
                     <label
                        className="block text-[11px] font-extrabold uppercase tracking-widest"
                        style={{ color: "var(--a-on-surface-variant)" }}
                     >
                        Password
                     </label>
                     {activeTab === "login" && (
                         <a
                         href="#"
                         className="text-xs font-bold hover:underline transition-all"
                         tabIndex={-1}
                         style={{ color: "var(--a-primary)" }}
                         >
                         Forgot?
                         </a>
                     )}
                  </div>
                  <div className="relative group">
                    <span
                      className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 opacity-40 transition-opacity group-focus-within:opacity-100"
                      style={{ fontSize: "20px", color: "var(--a-primary)" }}
                    >
                      lock
                    </span>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-12 pr-5 py-4 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[var(--a-primary)] focus:outline-none transition-all border-none"
                      style={{
                        backgroundColor: "var(--a-surface-container-lowest)",
                        color: "var(--a-on-surface)",
                        boxShadow: "0 2px 10px rgba(0,0,0,0.02)"
                      }}
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 mt-6 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-70 disabled:active:scale-100 shadow-[0_8px_16px_rgba(90,95,54,0.2)] hover:shadow-[0_12px_24px_rgba(90,95,54,0.25)] text-white"
                style={{
                  background:
                    "linear-gradient(135deg, var(--a-primary), var(--a-primary-container))",
                }}
              >
                {loading ? (
                  <span className="material-symbols-outlined animate-spin text-xl">
                    progress_activity
                  </span>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-xl">
                      {activeTab === "login" ? "login" : "person_add"}
                    </span>
                    {activeTab === "login" ? "Sign In to Portal" : "Create Workspace"}
                  </>
                )}
              </button>
            </form>

            <p
              className="text-center text-xs mt-10 opacity-60 font-medium"
              style={{ color: "var(--a-on-surface-variant)" }}
            >
              By proceeding, you agree to our <a href="#" className="underline font-bold hover:text-[var(--a-primary)]">Terms of Service</a> & <a href="#" className="underline font-bold hover:text-[var(--a-primary)]">Privacy Policy</a>.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
