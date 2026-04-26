"use client";

import { useEffect, useState } from "react";

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const [year, setYear] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
    setYear(new Date().getFullYear());
  }, []);
  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center relative overflow-hidden transition-opacity duration-700 ${mounted ? "opacity-100" : "opacity-0"}`}
      style={{
        background:
          "linear-gradient(145deg, #fcf9f4 0%, #ebe8e3 40%, #e2e7b2 100%)",
      }}
    >
      {/* Decorative blobs */}
      <div
        className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, #c6ca98, transparent)" }}
      />
      <div
        className="absolute -bottom-40 -right-40 w-[30rem] h-[30rem] rounded-full opacity-15 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, #ff996d, transparent)" }}
      />
      <div
        className="absolute top-1/3 right-10 w-64 h-64 rounded-full opacity-10 blur-2xl pointer-events-none"
        style={{ background: "radial-gradient(circle, #5a5f36, transparent)" }}
      />

      {/* Main content card */}
      <div
        className={`relative z-10 flex flex-col items-center w-full max-w-md mx-4 px-8 py-12 rounded-[2rem] transition-all duration-700 delay-200 ${mounted ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
        style={{
          background: "rgba(255,255,255,0.65)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          boxShadow:
            "0 8px 32px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.6)",
          border: "1px solid rgba(255,255,255,0.5)",
        }}
      >
        {/* Logo */}
        <div className="mb-6">
          <span
            className="text-3xl font-extrabold tracking-tight"
            style={{ fontFamily: "var(--font-headline)", color: "#1c1c19" }}
          >
            POSLENDA
          </span>
        </div>

        {/* QR Icon */}
        <div
          className={`relative mb-8 transition-all duration-700 delay-500 ${mounted ? "scale-100 opacity-100" : "scale-75 opacity-0"}`}
        >
          <div
            className="w-28 h-28 rounded-3xl flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #5a5f36 0%, #73784c 100%)",
              boxShadow:
                "0 12px 40px rgba(90,95,54,0.3), 0 4px 12px rgba(90,95,54,0.2)",
            }}
          >
            {/* QR code icon SVG */}
            <svg
              width="56"
              height="56"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="2" width="8" height="8" rx="1" />
              <rect x="14" y="2" width="8" height="8" rx="1" />
              <rect x="2" y="14" width="8" height="8" rx="1" />
              <rect x="5" y="5" width="2" height="2" rx="0.5" fill="white" />
              <rect x="17" y="5" width="2" height="2" rx="0.5" fill="white" />
              <rect x="5" y="17" width="2" height="2" rx="0.5" fill="white" />
              <path d="M14 14h2v2h-2z" fill="white" />
              <path d="M20 14h2v2h-2z" fill="white" />
              <path d="M14 20h2v2h-2z" fill="white" />
              <path d="M20 20h2v2h-2z" fill="white" />
              <path d="M17 17h2v2h-2z" fill="white" />
            </svg>
          </div>
          {/* Pulse ring */}
          <div
            className="absolute inset-0 rounded-3xl animate-ping"
            style={{
              background: "transparent",
              border: "2px solid rgba(90,95,54,0.15)",
              animationDuration: "2.5s",
            }}
          />
        </div>

        {/* Main text */}
        <h1
          className="text-xl font-bold text-center mb-3 leading-snug"
          style={{
            fontFamily: "var(--font-headline)",
            color: "#1c1c19",
          }}
        >
          Scan QR Code di Meja Anda
        </h1>
        <p
          className="text-center text-sm leading-relaxed mb-8 max-w-xs"
          style={{ color: "#47473d" }}
        >
          Untuk mulai memesan, silakan scan{" "}
          <strong className="font-semibold" style={{ color: "#5a5f36" }}>
            QR Code
          </strong>{" "}
          yang tersedia di meja Anda. Setiap meja memiliki kode unik untuk
          memastikan pesanan Anda sampai dengan tepat.
        </p>

        {/* Steps */}
        <div className="w-full space-y-3 mb-8">
          <StepItem
            number="1"
            title="Temukan QR Code"
            description="Cari stiker atau tent card QR di meja Anda"
            mounted={mounted}
            delay={600}
          />
          <StepItem
            number="2"
            title="Scan dengan Kamera"
            description="Buka kamera HP lalu arahkan ke QR Code"
            mounted={mounted}
            delay={750}
          />
          <StepItem
            number="3"
            title="Mulai Pesan!"
            description="Pilih menu favorit dan checkout langsung"
            mounted={mounted}
            delay={900}
          />
        </div>

        {/* Divider */}
        <div className="w-full flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-stone-200" />
          <span
            className="text-[10px] font-semibold uppercase tracking-widest"
            style={{ color: "#78786c" }}
          >
            Info
          </span>
          <div className="flex-1 h-px bg-stone-200" />
        </div>

        {/* Info callout */}
        <div
          className="w-full rounded-2xl px-5 py-4 flex items-start gap-3"
          style={{
            background: "rgba(226,231,178,0.35)",
            border: "1px solid rgba(90,95,54,0.12)",
          }}
        >
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
            style={{ background: "rgba(90,95,54,0.12)" }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#5a5f36"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4" />
              <path d="M12 8h.01" />
            </svg>
          </div>
          <div>
            <p
              className="text-xs font-semibold mb-0.5"
              style={{ color: "#1c1c19" }}
            >
              Tidak menemukan QR Code?
            </p>
            <p
              className="text-[11px] leading-relaxed"
              style={{ color: "#47473d" }}
            >
              Hubungi staff kami untuk bantuan. Pastikan Anda sudah duduk di
              meja yang tersedia.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <p
        className={`relative z-10 mt-8 text-[11px] transition-all duration-700 delay-1000 ${mounted ? "opacity-60" : "opacity-0"}`}
        style={{ color: "#47473d" }}
      >
        &copy; {year ?? ""} POSLENDA — Sistem Pemesanan Digital
      </p>
    </div>
  );
}

/* ─── Step item component ─── */
function StepItem({
  number,
  title,
  description,
  mounted,
  delay,
}: {
  number: string;
  title: string;
  description: string;
  mounted: boolean;
  delay: number;
}) {
  return (
    <div
      className={`flex items-center gap-4 rounded-2xl px-4 py-3 transition-all duration-500 ${mounted ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0"}`}
      style={{
        background: "rgba(255,255,255,0.5)",
        border: "1px solid rgba(0,0,0,0.04)",
        transitionDelay: `${delay}ms`,
      }}
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold text-white"
        style={{
          background:
            number === "3"
              ? "linear-gradient(135deg, #974822, #ff996d)"
              : "linear-gradient(135deg, #5a5f36, #73784c)",
          boxShadow:
            number === "3"
              ? "0 4px 12px rgba(151,72,34,0.25)"
              : "0 4px 12px rgba(90,95,54,0.2)",
        }}
      >
        {number}
      </div>
      <div>
        <p
          className="text-sm font-semibold leading-tight"
          style={{ fontFamily: "var(--font-headline)", color: "#1c1c19" }}
        >
          {title}
        </p>
        <p
          className="text-[11px] leading-snug mt-0.5"
          style={{ color: "#78786c" }}
        >
          {description}
        </p>
      </div>
    </div>
  );
}
