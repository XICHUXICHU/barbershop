"use client";

import { useRef, useState, useCallback } from "react";
import QRCode from "react-qr-code";
import { useBarbershop } from "../barbershop-context";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://barbershop-web-sigma.vercel.app";

const POSTER_STYLES = [
  { id: "classic", label: "Clásico", bg: "#ffffff", text: "#111111", accent: "#2563eb" },
  { id: "dark", label: "Oscuro", bg: "#111111", text: "#ffffff", accent: "#e9c349" },
  { id: "gold", label: "Dorado", bg: "#1a1a1a", text: "#e9c349", accent: "#e9c349" },
  { id: "barber", label: "Barbería", bg: "#1e293b", text: "#f8fafc", accent: "#ef4444" },
] as const;

type PosterStyle = (typeof POSTER_STYLES)[number];

export default function QRPage() {
  const { barbershopName, barbershopSlug } = useBarbershop();
  const posterRef = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<PosterStyle>(POSTER_STYLES[1]);
  const [qrSize, setQrSize] = useState(220);
  const [showSubtext, setShowSubtext] = useState(true);
  const [customSubtext, setCustomSubtext] = useState("Escanea para reservar tu cita");
  const [exporting, setExporting] = useState(false);

  const publicUrl = `${SITE_URL}/${barbershopSlug}`;

  const downloadPNG = useCallback(async () => {
    if (!posterRef.current) return;
    setExporting(true);
    try {
      // Dynamic import to avoid SSR issues
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(posterRef.current, {
        pixelRatio: 4, // 4x for high-quality print
        backgroundColor: style.bg,
      });
      const link = document.createElement("a");
      link.download = `qr-${barbershopSlug}-poster.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Error exporting PNG:", err);
    } finally {
      setExporting(false);
    }
  }, [style.bg, barbershopSlug]);

  const downloadSVG = useCallback(() => {
    if (!posterRef.current) return;
    const svgEl = posterRef.current.querySelector("svg");
    if (!svgEl) return;
    const svgData = new XMLSerializer().serializeToString(svgEl);
    const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = `qr-${barbershopSlug}.svg`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  }, [barbershopSlug]);

  const printPoster = useCallback(() => {
    window.print();
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-1">Código QR</h1>
      <p className="text-gray-500 mb-8">{barbershopName}</p>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
        {/* Controls */}
        <div className="space-y-6 print:hidden">
          <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-semibold">Personalizar Cartel</h2>

            {/* Style picker */}
            <div>
              <p className="text-sm text-gray-500 mb-2">Estilo del cartel</p>
              <div className="flex gap-3 flex-wrap">
                {POSTER_STYLES.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setStyle(s)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium border-2 transition-colors ${
                      style.id === s.id
                        ? "border-blue-600 ring-2 ring-blue-200"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    style={{ backgroundColor: s.bg, color: s.text }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* QR Size */}
            <div>
              <p className="text-sm text-gray-500 mb-2">Tamaño del QR: {qrSize}px</p>
              <input
                type="range"
                min={140}
                max={320}
                step={10}
                value={qrSize}
                onChange={(e) => setQrSize(Number(e.target.value))}
                className="w-full accent-blue-600"
              />
            </div>

            {/* Subtitle toggle */}
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showSubtext}
                onChange={(e) => setShowSubtext(e.target.checked)}
                className="accent-blue-600"
              />
              <span className="text-sm">Mostrar subtexto</span>
            </label>

            {showSubtext && (
              <label className="block">
                <span className="text-sm text-gray-500">Texto del cartel</span>
                <input
                  type="text"
                  value={customSubtext}
                  onChange={(e) => setCustomSubtext(e.target.value)}
                  maxLength={80}
                  className="w-full mt-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900"
                />
              </label>
            )}
          </section>

          {/* URL info */}
          <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-2">Enlace de tu página</h2>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-sm bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 truncate text-blue-700">
                {publicUrl}
              </code>
              <button
                onClick={() => navigator.clipboard.writeText(publicUrl)}
                className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Copiar
              </button>
            </div>
          </section>

          {/* Download buttons */}
          <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-3">
            <h2 className="text-lg font-semibold mb-1">Descargar</h2>
            <p className="text-sm text-gray-500 mb-3">
              El PNG se exporta a <strong>4x resolución</strong> para impresión de alta calidad en carteles y volantes.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={downloadPNG}
                disabled={exporting}
                className="px-5 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {exporting ? "Exportando..." : "📥 Descargar PNG (Alta Calidad)"}
              </button>
              <button
                onClick={downloadSVG}
                className="px-5 py-2.5 rounded-lg bg-gray-800 text-white font-medium hover:bg-gray-900 transition-colors"
              >
                📐 Descargar QR (SVG vectorial)
              </button>
              <button
                onClick={printPoster}
                className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                🖨️ Imprimir Cartel
              </button>
            </div>
          </section>
        </div>

        {/* Poster preview */}
        <div className="flex flex-col items-center">
          <p className="text-sm text-gray-500 mb-3 print:hidden">Vista previa del cartel</p>
          <div
            ref={posterRef}
            className="rounded-2xl shadow-xl print:shadow-none print:rounded-none"
            style={{
              backgroundColor: style.bg,
              padding: "48px 36px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "24px",
              width: "340px",
              minHeight: "480px",
            }}
          >
            {/* Barbershop name */}
            <div style={{ textAlign: "center" }}>
              <h2
                style={{
                  fontSize: "28px",
                  fontWeight: 800,
                  color: style.accent,
                  letterSpacing: "-0.02em",
                  margin: 0,
                  lineHeight: 1.2,
                  fontFamily: "'Noto Serif', serif",
                }}
              >
                {barbershopName || "Mi Barbería"}
              </h2>
            </div>

            {/* QR Code */}
            <div
              style={{
                backgroundColor: "#ffffff",
                padding: "16px",
                borderRadius: "16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <QRCode
                value={publicUrl}
                size={qrSize}
                level="H"
                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
              />
            </div>

            {/* Subtext */}
            {showSubtext && (
              <p
                style={{
                  color: style.text,
                  fontSize: "16px",
                  textAlign: "center",
                  margin: 0,
                  opacity: 0.85,
                  fontFamily: "'Manrope', sans-serif",
                  lineHeight: 1.4,
                  maxWidth: "260px",
                }}
              >
                {customSubtext}
              </p>
            )}

            {/* URL slug */}
            <p
              style={{
                color: style.accent,
                fontSize: "13px",
                textAlign: "center",
                margin: 0,
                fontFamily: "monospace",
                opacity: 0.7,
              }}
            >
              {publicUrl.replace("https://", "")}
            </p>

            {/* Branding */}
            <p
              style={{
                color: style.text,
                fontSize: "11px",
                textAlign: "center",
                margin: 0,
                opacity: 0.35,
                fontFamily: "'Manrope', sans-serif",
              }}
            >
              BarberBook
            </p>
          </div>
        </div>
      </div>

      {/* Print stylesheet */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #__next {
            visibility: hidden;
          }
          [data-poster-print],
          [data-poster-print] * {
            visibility: visible !important;
          }
        }
      `}</style>
    </div>
  );
}
