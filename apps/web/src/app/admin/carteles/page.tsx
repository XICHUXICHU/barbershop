"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import { useAuthFetch } from "../../../lib/use-auth-fetch";
import { apiFetch } from "../../../lib/api";

const QRCode = dynamic(() => import("react-qr-code"), { ssr: false });

/* ── Types ── */
interface ShopRow {
  id: string;
  name: string;
  slug: string;
  phone: string;
  address: string;
}

interface ServiceRow {
  id: string;
  name: string;
  description: string | null;
  durationMinutes: number;
  priceAmount: number;
  priceCurrency: string;
  isActive: boolean;
}

interface PosterService {
  name: string;
  description: string;
  price: string;
  duration: string;
  featured: boolean;
}

interface PosterData {
  layout: "classic" | "elegant" | "vintage";
  shopName: string;
  tagline: string;
  subtitle: string;
  servicesTitle: string;
  services: PosterService[];
  phone: string;
  address: string;
  bookingLabel: string;
  bookingUrl: string;
  qrUrl: string;
  badgeText: string;
  sinceYear: string;
  accentColor: string;
  secondaryColor: string;
}

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  "https://barbershop-web-sigma.vercel.app";

const DEFAULT_POSTER: PosterData = {
  layout: "classic",
  shopName: "Barbería La Imperial",
  tagline: "Tradición en cada corte, excelencia en cada detalle.",
  subtitle: "Desde 1924",
  servicesTitle: "Servicios de Autor",
  services: [
    {
      name: "Corte Clásico",
      description: "Corte a tijera o máquina con acabado tradicional y lavado.",
      price: "$250",
      duration: "45 min",
      featured: false,
    },
    {
      name: "Afeitado Tradicional",
      description:
        "Ritual de toalla caliente, navaja clásica y bálsamo artesanal.",
      price: "$200",
      duration: "30 min",
      featured: false,
    },
    {
      name: "Pack Imperial",
      description:
        "Corte completo + Afeitado ritual + Tratamiento facial express.",
      price: "$400",
      duration: "75 min",
      featured: true,
    },
    {
      name: "Arreglo de Barba",
      description: "Perfilado y nutrición con aceites esenciales.",
      price: "$150",
      duration: "20 min",
      featured: false,
    },
  ],
  phone: "+52 55 1234 5678",
  address: "Calle de la Tradición 12, Ciudad de México.",
  bookingLabel: "¡Reserva tu cita!",
  bookingUrl: "BARBERIAIMPERIAL.COM",
  qrUrl: `${SITE_URL}/barberia-la-imperial`,
  badgeText: "PREMIUM",
  sinceYear: "Desde 1924",
  accentColor: "#af101a",
  secondaryColor: "#705312",
};

const COLOR_PRESETS = [
  { label: "Rojo Imperial", accent: "#af101a", secondary: "#705312" },
  { label: "Azul Elegante", accent: "#1e3a5f", secondary: "#8b6914" },
  { label: "Negro Clásico", accent: "#1a1a1a", secondary: "#c9a84c" },
  { label: "Verde Vintage", accent: "#2d5016", secondary: "#8b6914" },
  { label: "Borgona", accent: "#6b1d3a", secondary: "#b8860b" },
];

function formatCurrency(amount: number, currency: string): string {
  const sym = currency === "MXN" ? "$" : currency === "USD" ? "US$" : currency;
  return `${sym}${amount}`;
}

function formatDuration(minutes: number): string {
  if (minutes >= 60) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h ${m}min` : `${h}h`;
  }
  return `${minutes} min`;
}

/* ═══════════════════════════════════════════
   POSTER PREVIEW COMPONENT (Office / Legal)
   ═══════════════════════════════════════════ */
function PosterPreview({
  data,
  posterRef,
}: {
  data: PosterData;
  posterRef: React.RefObject<HTMLDivElement | null>;
}) {
  const n = data.services.length;

  if (data.layout === "elegant") {
    const compact = n >= 5;
    const padding = compact ? "24px" : "32px";
    
    // Background: dark leather/grain texture simulation using radial-gradient
    const goldColor = data.secondaryColor || "#c9a84c"; 
    // Adapt dark bg to accent
    const bgColor = data.accentColor === "#af101a" ? "#1a0b0f" : data.accentColor === "#1e3a5f" ? "#0b1522" : "#111111"; 

    return (
      <div
        ref={posterRef}
        className="poster-canvas"
        style={{
          aspectRatio: "8.5 / 14",
          width: "100%",
          maxWidth: "510px",
          margin: "0 auto",
          position: "relative",
          backgroundColor: bgColor,
          backgroundImage: `radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), radial-gradient(rgba(255,255,255,0.02) 1px, transparent 1px)`,
          backgroundPosition: `0 0, 2px 2px`,
          backgroundSize: `4px 4px`,
          fontFamily: "'Inter', sans-serif",
          color: "#fff",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          padding,
          border: `6px solid ${goldColor}`,
        }}
      >
        <div
          style={{
            flex: 1,
            border: `2px solid ${goldColor}`,
            outline: `1px solid ${goldColor}`,
            outlineOffset: "-6px",
            padding: compact ? "24px" : "32px",
            display: "flex",
            flexDirection: "column",
            position: "relative",
          }}
        >
          {/* Top Vintage Ornament */}
          <div style={{ textAlign: "center", marginBottom: compact ? "24px" : "36px", color: goldColor }}>
            <div style={{ fontSize: "28px", lineHeight: 1 }}>⚜</div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "8px", justifyContent: "center" }}>
              <div style={{ height: "1px", width: "40px", backgroundColor: goldColor }} />
              <span style={{ fontFamily: "'Noto Serif', serif", textTransform: "uppercase", fontSize: "14px", letterSpacing: "2px", fontWeight: "bold" }}>
                {data.subtitle}
              </span>
              <div style={{ height: "1px", width: "40px", backgroundColor: goldColor }} />
            </div>
            
            {/* Title */}
            <h1
              style={{
                fontFamily: "'Noto Serif', serif",
                fontSize: compact ? "32px" : "38px",
                fontWeight: 700,
                color: "#fff",
                marginTop: "20px",
                marginBottom: "8px",
                lineHeight: 1.1,
                textTransform: "uppercase",
              }}
            >
              {data.servicesTitle.toUpperCase()}
            </h1>
            <h2
              style={{ fontFamily: "'Noto Serif', serif", fontSize: "16px", color: goldColor, fontStyle: "italic", fontWeight: 400 }}
            >
              {data.shopName}
            </h2>
          </div>

          {/* List of services */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: compact ? "16px" : "24px", marginBottom: "32px" }}>
            {data.services.map((svc, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", borderBottom: `1px dashed rgba(255, 255, 255, 0.15)`, paddingBottom: "8px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px", paddingRight: "16px" }}>
                  <span style={{ fontSize: compact ? "18px" : "22px", fontFamily: "'Noto Serif', serif", color: "#fff", letterSpacing: "0.5px", lineHeight: 1.2 }}>
                    {svc.name}
                  </span>
                  {!compact && svc.description && (
                    <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)", fontStyle: "italic", lineHeight: 1.3 }}>{svc.description}</span>
                  )}
                </div>
                <span style={{ fontSize: compact ? "22px" : "26px", fontWeight: 700, color: goldColor, flexShrink: 0 }}>
                  {svc.price}
                </span>
              </div>
            ))}
          </div>

          {/* Bottom section (QR & Brand) */}
          <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: "16px" }}>
            <div style={{ flex: 1, marginBottom: "8px" }}>
              <div style={{ color: goldColor, fontSize: "20px", fontFamily: "'Noto Serif', serif", fontWeight: "bold", marginBottom: "8px" }}>
                {data.bookingLabel}
              </div>
              <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "12px", lineHeight: 1.4 }}>{data.address}</div>
              <div style={{ color: "#fff", fontSize: "14px", marginTop: "8px", fontWeight: "600", display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{color: goldColor}}>📞</span> {data.phone}
              </div>
            </div>
            
            {/* QR box matching the gold styling */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", background: goldColor, padding: "8px", borderRadius: "12px", flexShrink: 0 }}>
              <div style={{ backgroundColor: "#fff", padding: "6px", borderRadius: "8px", display: "flex" }}>
                 <QRCode value={data.qrUrl || "https://example.com"} size={compact ? 56 : 72} level="M" style={{ height: "auto", maxWidth: "100%", width: "100%" }} />
              </div>
              <span style={{ marginTop: "6px", fontSize: "9px", color: "#111", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "-0.5px" }}>
                {data.bookingUrl}
              </span>
            </div>
          </div>
          
          <div style={{ textAlign: "center", marginTop: "24px" }}>
             <div style={{ fontSize: "24px", color: goldColor, lineHeight: 1 }}>❖</div>
          </div>
        </div>
      </div>
    );
  }

  if (data.layout === "vintage") {
    const compact = n >= 5;
    const padding = compact ? "20px" : "28px";
    const frameColor = "#1f1a14";
    const offWhite = "#f1ebe0";
    const red = data.accentColor || "#b91c1c";
    const gold = data.secondaryColor || "#b8860b";

    return (
      <div
        ref={posterRef}
        className="poster-canvas"
        style={{
          aspectRatio: "8.5 / 14",
          width: "100%",
          maxWidth: "510px",
          margin: "0 auto",
          position: "relative",
          backgroundColor: offWhite,
          backgroundImage:
            "radial-gradient(rgba(0,0,0,0.04) 1px, transparent 1px), radial-gradient(rgba(0,0,0,0.03) 1px, transparent 1px)",
          backgroundPosition: "0 0, 2px 2px",
          backgroundSize: "4px 4px",
          fontFamily: "'Inter', sans-serif",
          color: frameColor,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          padding,
          border: `4px solid ${frameColor}`,
        }}
      >
        <div
          style={{
            flex: 1,
            border: `2px solid ${frameColor}`,
            borderRadius: "10px",
            padding: compact ? "18px" : "26px",
            display: "flex",
            flexDirection: "column",
            gap: compact ? "12px" : "18px",
            position: "relative",
          }}
        >
          {/* Top heading */}
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: "10px",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                marginBottom: "6px",
              }}
            >
              {data.subtitle}
            </div>
            <div
              style={{
                fontFamily: "'Noto Serif', serif",
                fontWeight: 800,
                fontSize: compact ? "34px" : "44px",
                letterSpacing: "0.05em",
                marginBottom: "6px",
              }}
            >
              {data.shopName.toUpperCase()}
            </div>
            <div
              style={{
                fontFamily: "'Noto Serif', serif",
                fontSize: compact ? "16px" : "20px",
                fontStyle: "italic",
                color: red,
                fontWeight: 700,
              }}
            >
              {data.servicesTitle}
            </div>
          </div>

          {/* Divider */}
          <div
            style={{
              height: "2px",
              backgroundColor: frameColor,
              opacity: 0.6,
            }}
          />

          {/* Services list */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: compact ? "10px" : "14px",
              flex: 1,
            }}
          >
            {data.services.map((svc, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  borderBottom: "1px dashed rgba(0,0,0,0.3)",
                  paddingBottom: "6px",
                }}
              >
                <div style={{ paddingRight: "12px" }}>
                  <div
                    style={{
                      fontFamily: "'Noto Serif', serif",
                      fontWeight: 700,
                      fontSize: compact ? "16px" : "18px",
                    }}
                  >
                    {svc.name}
                  </div>
                  {!compact && svc.description && (
                    <div
                      style={{
                        fontSize: "11px",
                        color: "rgba(0,0,0,0.6)",
                        fontStyle: "italic",
                        marginTop: "2px",
                      }}
                    >
                      {svc.description}
                    </div>
                  )}
                </div>
                <div
                  style={{
                    fontWeight: 800,
                    fontSize: compact ? "16px" : "20px",
                    color: frameColor,
                  }}
                >
                  {svc.price}
                </div>
              </div>
            ))}
          </div>

          {/* Ribbon / Offer */}
          <div
            style={{
              backgroundColor: red,
              color: "#ffffff",
              textAlign: "center",
              padding: compact ? "8px" : "10px",
              fontFamily: "'Noto Serif', serif",
              fontWeight: 700,
              letterSpacing: "0.05em",
            }}
          >
            {data.badgeText || "OFERTA ESPECIAL"}
          </div>

          {/* Footer / Contact + QR */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              gap: "12px",
            }}
          >
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontFamily: "'Noto Serif', serif",
                  fontWeight: 700,
                  fontSize: compact ? "14px" : "16px",
                  marginBottom: "6px",
                  color: frameColor,
                }}
              >
                {data.bookingLabel}
              </div>
              <div style={{ fontSize: "11px", color: "rgba(0,0,0,0.7)" }}>
                {data.address}
              </div>
              <div
                style={{
                  fontSize: "12px",
                  marginTop: "6px",
                  fontWeight: 700,
                }}
              >
                {data.phone}
              </div>
            </div>
            <div style={{ flexShrink: 0, textAlign: "center" }}>
              <div
                style={{
                  backgroundColor: gold,
                  padding: "8px",
                  borderRadius: "10px",
                }}
              >
                <div
                  style={{
                    backgroundColor: "#ffffff",
                    padding: "6px",
                    borderRadius: "8px",
                    display: "flex",
                  }}
                >
                  <QRCode
                    value={data.qrUrl || "https://example.com"}
                    size={compact ? 54 : 66}
                    level="M"
                    style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                  />
                </div>
                <div
                  style={{
                    fontSize: "8px",
                    fontWeight: 700,
                    color: "#111",
                    marginTop: "6px",
                    textTransform: "uppercase",
                  }}
                >
                  {data.bookingUrl}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Scale layout based on service count
  const compact = n >= 5;
  const tight = n >= 4;
  const padding = compact ? "28px 32px" : tight ? "36px 36px" : "48px 40px";
  const headerMb = compact ? "16px" : tight ? "22px" : "32px";
  const titleSize = compact ? "28px" : tight ? "32px" : "36px";
  const svcTitleSize = compact ? "16px" : tight ? "18px" : "20px";
  const svcTitleMb = compact ? "12px" : tight ? "16px" : "24px";
  const svcGap = compact ? "8px" : tight ? "12px" : "20px";
  const svcNameSize = compact ? "13px" : tight ? "14px" : "16px";
  const svcPriceSize = compact ? "12px" : tight ? "13px" : "14px";
  const svcDescSize = compact ? "8px" : "10px";
  const svcDurSize = compact ? "7px" : "8px";
  const featuredPad = compact ? "8px" : tight ? "12px" : "16px";
  const showPole = n <= 3;
  const poleHeight = tight ? "60px" : "100px";
  const polePad = tight ? "10px 0" : "20px 0";
  const footerPt = compact ? "12px" : tight ? "16px" : "24px";
  const footerTitleSize = compact ? "16px" : tight ? "20px" : "24px";
  const qrSize = compact ? "52px" : tight ? "60px" : "72px";
  const qrPad = compact ? "8px" : "12px";

  return (
    <div
      ref={posterRef}
      className="poster-canvas"
      style={{
        aspectRatio: "8.5 / 14",
        width: "100%",
        maxWidth: "510px",
        margin: "0 auto",
        position: "relative",
        backgroundColor: "#fcf9f8",
        fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        padding,
        border: "12px solid #f0edec",
      }}
    >
      {/* Background decorative element */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "50%",
          height: "50%",
          backgroundColor: "#f6f3f2",
          transform: "skewX(-12deg) translateX(33%) translateY(-25%)",
          pointerEvents: "none",
          opacity: 0.5,
        }}
      />

      {/* Header */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          marginBottom: headerMb,
        }}
      >
        {/* Since year line */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: compact ? "8px" : "16px",
          }}
        >
          <div
            style={{
              height: "1px",
              width: "40px",
              backgroundColor: data.secondaryColor,
            }}
          />
          <span
            style={{
              fontFamily: "'Inter', sans-serif",
              color: data.secondaryColor,
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              fontSize: "9px",
              fontWeight: 700,
            }}
          >
            {data.subtitle}
          </span>
          <div
            style={{
              height: "1px",
              width: "40px",
              backgroundColor: data.secondaryColor,
            }}
          />
        </div>

        {/* Business Name */}
        <h1
          style={{
            fontFamily: "'Noto Serif', 'Georgia', serif",
            fontSize: titleSize,
            fontWeight: 700,
            color: data.accentColor,
            fontStyle: "italic",
            letterSpacing: "-0.02em",
            margin: "0 0 6px 0",
            lineHeight: 1.1,
          }}
        >
          {data.shopName}
        </h1>
        <p
          style={{
            fontFamily: "'Noto Serif', 'Georgia', serif",
            fontSize: compact ? "11px" : "13px",
            color: "#5b403d",
            fontStyle: "italic",
            margin: 0,
          }}
        >
          {data.tagline}
        </p>
      </div>

      {/* Services Section */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
        }}
      >
        <h2
          style={{
            fontFamily: "'Noto Serif', 'Georgia', serif",
            fontSize: svcTitleSize,
            fontWeight: 700,
            color: "#1c1b1b",
            marginBottom: svcTitleMb,
            borderLeft: `4px solid ${data.secondaryColor}`,
            paddingLeft: "12px",
          }}
        >
          {data.servicesTitle}
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: svcGap }}>
          {data.services.map((svc, i) => (
            <div
              key={i}
              style={{
                position: "relative",
                ...(svc.featured
                  ? {
                      backgroundColor: "#f6f3f2",
                      padding: featuredPad,
                      borderRadius: "8px",
                      borderLeft: `4px solid ${data.accentColor}`,
                    }
                  : {}),
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  marginBottom: "2px",
                }}
              >
                <h3
                  style={{
                    fontFamily: "'Noto Serif', 'Georgia', serif",
                    fontSize: svcNameSize,
                    fontWeight: 700,
                    color: svc.featured ? data.accentColor : "#1c1b1b",
                    margin: 0,
                  }}
                >
                  {svc.name}
                </h3>
                <span
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: svcPriceSize,
                    fontWeight: 600,
                    color: svc.featured
                      ? data.accentColor
                      : data.secondaryColor,
                  }}
                >
                  {svc.price}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  color: "#5b403d",
                }}
              >
                <p
                  style={{
                    fontSize: svcDescSize,
                    fontStyle: "italic",
                    margin: 0,
                    maxWidth: "70%",
                  }}
                >
                  {svc.description}
                </p>
                <span
                  style={{
                    fontSize: svcDurSize,
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                  }}
                >
                  {svc.duration}
                </span>
              </div>
              {!svc.featured && (
                <div
                  style={{
                    marginTop: compact ? "4px" : "8px",
                    height: "1px",
                    width: "100%",
                    backgroundColor: "#e4beba",
                    opacity: 0.2,
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Barber Pole + PREMIUM badge area — hidden when many services */}
      {showPole && (
        <div
          style={{
            position: "relative",
            zIndex: 10,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: polePad,
          }}
        >
          <div
            style={{
              width: "40px",
              height: poleHeight,
              backgroundColor: "#fff",
              borderRadius: "9999px",
              overflow: "hidden",
              border: "3px solid #1c1b1b",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: `repeating-linear-gradient(-45deg, ${data.accentColor}, ${data.accentColor} 10px, #ffffff 10px, #ffffff 20px, #2b5bb5 20px, #2b5bb5 30px, #ffffff 30px, #ffffff 40px)`,
                height: "200%",
                animation: "stripe-scroll 2s linear infinite",
              }}
            />
          </div>
          {data.badgeText && (
            <div
              style={{
                position: "absolute",
                right: "30px",
                bottom: "10px",
                transform: "rotate(-12deg)",
                backgroundColor: data.secondaryColor,
                color: "#ffffff",
                padding: "6px 14px",
                fontFamily: "'Noto Serif', 'Georgia', serif",
                fontWeight: 700,
                fontSize: "12px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              }}
            >
              {data.badgeText}
            </div>
          )}
        </div>
      )}

      {/* Badge inline when pole is hidden */}
      {!showPole && data.badgeText && (
        <div
          style={{
            position: "relative",
            zIndex: 10,
            display: "flex",
            justifyContent: "center",
            padding: "8px 0",
          }}
        >
          <div
            style={{
              transform: "rotate(-2deg)",
              backgroundColor: data.secondaryColor,
              color: "#ffffff",
              padding: "4px 14px",
              fontFamily: "'Noto Serif', 'Georgia', serif",
              fontWeight: 700,
              fontSize: "11px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            }}
          >
            {data.badgeText}
          </div>
        </div>
      )}

      {/* Footer / Contact */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          flexShrink: 0,
          borderTop: "1px solid rgba(143,111,108,0.3)",
          paddingTop: footerPt,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          gap: "16px",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <h4
            style={{
              fontFamily: "'Noto Serif', 'Georgia', serif",
              fontSize: footerTitleSize,
              fontWeight: 700,
              color: "#1c1b1b",
              margin: 0,
            }}
          >
            {data.bookingLabel}
          </h4>
          <p
            style={{
              color: "#5b403d",
              fontWeight: 500,
              fontSize: compact ? "9px" : "10px",
              margin: 0,
            }}
          >
            {data.address}
          </p>
          {data.phone && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                marginTop: "4px",
              }}
            >
              <span style={{ fontSize: compact ? "12px" : "14px" }}>📞</span>
              <span
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 700,
                  color: "#1c1b1b",
                  fontSize: compact ? "10px" : "12px",
                }}
              >
                {data.phone}
              </span>
            </div>
          )}
        </div>

        {/* QR / URL section */}
        <div style={{ textAlign: "center", flexShrink: 0 }}>
          <div
            style={{
              backgroundColor: data.secondaryColor,
              borderRadius: "12px",
              padding: qrPad,
              boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div
              style={{
                width: qrSize,
                height: qrSize,
                backgroundColor: "#fff",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "4px",
              }}
            >
              <QRCode
                value={data.qrUrl || "https://example.com"}
                size={parseInt(qrSize) - 12}
                level="M"
                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
              />
            </div>
            <span
              style={{
                fontSize: "7px",
                fontWeight: 700,
                color: "#fff",
                marginTop: "6px",
                letterSpacing: "-0.02em",
              }}
            >
              {data.bookingUrl}
            </span>
          </div>
        </div>
      </div>

      {/* Keyframe animation for barber pole */}
      <style>{`
        @keyframes stripe-scroll {
          from { transform: translateY(0); }
          to   { transform: translateY(40px); }
        }
      `}</style>
    </div>
  );
}

/* ═══════════════════════════════
   MAIN PAGE
   ═══════════════════════════════ */
export default function CartelesPage() {
  const authFetch = useAuthFetch();
  const posterRef = useRef<HTMLDivElement>(null);

  const [shops, setShops] = useState<ShopRow[]>([]);
  const [selectedShopId, setSelectedShopId] = useState("");
  const [services, setServices] = useState<ServiceRow[]>([]);
  const [poster, setPoster] = useState<PosterData>({ ...DEFAULT_POSTER });
  const [exporting, setExporting] = useState(false);

  // Load barbershops
  useEffect(() => {
    authFetch("/admin/barbershops")
      .then((r) => r.json())
      .then((d: ShopRow[]) => setShops(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, [authFetch]);

  // When a shop is selected, load its services and populate poster
  useEffect(() => {
    if (!selectedShopId) return;
    const shop = shops.find((s) => s.id === selectedShopId);
    if (!shop) return;

    apiFetch<ServiceRow[]>(`/services/barbershop/${selectedShopId}`)
      .then((svcs) => {
        setServices(svcs.filter((s) => s.isActive));
        const activeSvcs = svcs.filter((s) => s.isActive).slice(0, 6);
        setPoster((prev) => ({
          ...prev,
          shopName: shop.name,
          phone: shop.phone || prev.phone,
          address: shop.address || prev.address,
          bookingUrl: `${shop.slug.toUpperCase()}.COM`,
          qrUrl: `${SITE_URL}/${shop.slug}`,
          services: activeSvcs.length
            ? activeSvcs.map((s, i) => ({
                name: s.name,
                description: s.description || "",
                price: formatCurrency(s.priceAmount, s.priceCurrency),
                duration: formatDuration(s.durationMinutes),
                featured: i === 0 && activeSvcs.length > 2,
              }))
            : prev.services,
        }));
      })
      .catch(() => {});
  }, [selectedShopId, shops]);

  // Field updater
  const updateField = <K extends keyof PosterData>(
    key: K,
    value: PosterData[K]
  ) => {
    setPoster((prev) => ({ ...prev, [key]: value }));
  };

  // Service field updater
  const updateService = (
    idx: number,
    field: keyof PosterService,
    value: string | boolean
  ) => {
    setPoster((prev) => {
      const copy = [...prev.services];
      copy[idx] = { ...copy[idx], [field]: value };
      return { ...prev, services: copy };
    });
  };

  const addService = () => {
    if (poster.services.length >= 6) return;
    setPoster((prev) => ({
      ...prev,
      services: [
        ...prev.services,
        {
          name: "Nuevo Servicio",
          description: "Descripción del servicio.",
          price: "$0",
          duration: "30 min",
          featured: false,
        },
      ],
    }));
  };

  const removeService = (idx: number) => {
    setPoster((prev) => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== idx),
    }));
  };

  /* ── Export helpers ── */
  const downloadPNG = useCallback(async () => {
    if (!posterRef.current) return;
    setExporting(true);
    try {
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(posterRef.current, {
        pixelRatio: 4,
        backgroundColor: "#fcf9f8",
      });
      const link = document.createElement("a");
      link.download = `cartel-${poster.shopName.replace(/\s+/g, "-").toLowerCase()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Error exporting PNG:", err);
    } finally {
      setExporting(false);
    }
  }, [poster.shopName]);

  const printPoster = useCallback(async () => {
    if (!posterRef.current) return;
    try {
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(posterRef.current, {
        pixelRatio: 4,
        backgroundColor: "#fcf9f8",
      });
      const win = window.open("", "_blank");
      if (!win) return;
      win.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Cartel — ${poster.shopName}</title>
            <style>
              * { margin: 0; padding: 0; }
              @page { size: 8.5in 14in; margin: 0; }
              body { display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #fff; }
              img { max-width: 100%; max-height: 100vh; object-fit: contain; }
              @media print { body { background: none; } img { max-height: none; width: 100%; } }
            </style>
          </head>
          <body>
            <img src="${dataUrl}" alt="Cartel" onload="setTimeout(()=>{window.print();},300)" />
          </body>
        </html>
      `);
      win.document.close();
    } catch (err) {
      console.error("Error printing:", err);
    }
  }, [poster.shopName]);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-1">Generador de Carteles</h1>
      <p className="text-gray-500 mb-8">
        Crea carteles tamaño oficio personalizados para cada barbería.
      </p>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_540px] gap-8">
        {/* ── LEFT: Editor controls ── */}
        <div className="space-y-6">
          {/* Barbershop Selector */}
          <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-3">
              Seleccionar Barbería
            </h2>
            <select
              value={selectedShopId}
              onChange={(e) => setSelectedShopId(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900"
            >
              <option value="">— Elegir barbería o usar datos de ejemplo —</option>
              {shops.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} (/{s.slug})
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-400 mt-2">
              Al seleccionar una barbería se cargarán sus servicios
              automáticamente. Puedes editar todo después.
            </p>
          </section>

          <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-3">Diseño del Cartel</h2>
            <div className="flex gap-4">
              <label
                className={`flex-1 cursor-pointer border rounded-xl p-4 flex items-center justify-center text-sm font-medium transition-colors ${
                  poster.layout === "classic"
                    ? "border-blue-600 bg-blue-50 ring-1 ring-blue-600 text-blue-700"
                    : "border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700"
                }`}
              >
                <input
                  type="radio"
                  className="sr-only"
                  checked={poster.layout === "classic"}
                  onChange={() => updateField("layout", "classic")}
                />
                Clásico Luminoso
              </label>
              <label
                className={`flex-1 cursor-pointer border rounded-xl p-4 flex items-center justify-center text-sm font-medium transition-colors ${
                  poster.layout === "elegant"
                    ? "border-amber-600 bg-amber-50 ring-1 ring-amber-600 text-amber-700"
                    : "border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700"
                }`}
              >
                <input
                  type="radio"
                  className="sr-only"
                  checked={poster.layout === "elegant"}
                  onChange={() => updateField("layout", "elegant")}
                />
                Elegante Oscuro
              </label>
              <label
                className={`flex-1 cursor-pointer border rounded-xl p-4 flex items-center justify-center text-sm font-medium transition-colors ${
                  poster.layout === "vintage"
                    ? "border-rose-600 bg-rose-50 ring-1 ring-rose-600 text-rose-700"
                    : "border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700"
                }`}
              >
                <input
                  type="radio"
                  className="sr-only"
                  checked={poster.layout === "vintage"}
                  onChange={() => updateField("layout", "vintage")}
                />
                Vintage Retro
              </label>
            </div>
          </section>

          {/* General Info */}
          <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-semibold">Información General</h2>

            <label className="block">
              <span className="text-sm text-gray-500">
                Nombre de la barbería
              </span>
              <input
                type="text"
                value={poster.shopName}
                onChange={(e) => updateField("shopName", e.target.value)}
                className="w-full mt-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900"
              />
            </label>

            <label className="block">
              <span className="text-sm text-gray-500">Eslogan / Tagline</span>
              <input
                type="text"
                value={poster.tagline}
                onChange={(e) => updateField("tagline", e.target.value)}
                maxLength={100}
                className="w-full mt-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900"
              />
            </label>

            <div className="grid grid-cols-2 gap-4">
              <label className="block">
                <span className="text-sm text-gray-500">
                  Subtítulo (e.g. &quot;Desde 1924&quot;)
                </span>
                <input
                  type="text"
                  value={poster.subtitle}
                  onChange={(e) => updateField("subtitle", e.target.value)}
                  className="w-full mt-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900"
                />
              </label>
              <label className="block">
                <span className="text-sm text-gray-500">Texto badge</span>
                <input
                  type="text"
                  value={poster.badgeText}
                  onChange={(e) => updateField("badgeText", e.target.value)}
                  maxLength={20}
                  className="w-full mt-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900"
                />
              </label>
            </div>
          </section>

          {/* Color Theme */}
          <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-semibold">Colores</h2>
            <div className="flex gap-3 flex-wrap">
              {COLOR_PRESETS.map((p) => (
                <button
                  key={p.label}
                  onClick={() => {
                    updateField("accentColor", p.accent);
                    updateField("secondaryColor", p.secondary);
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border-2 transition-colors ${
                    poster.accentColor === p.accent
                      ? "border-blue-600 ring-2 ring-blue-200"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  style={{ backgroundColor: p.accent, color: "#ffffff" }}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <label className="block">
                <span className="text-sm text-gray-500">Color principal</span>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="color"
                    value={poster.accentColor}
                    onChange={(e) =>
                      updateField("accentColor", e.target.value)
                    }
                    className="w-10 h-10 rounded cursor-pointer border border-gray-200"
                  />
                  <input
                    type="text"
                    value={poster.accentColor}
                    onChange={(e) =>
                      updateField("accentColor", e.target.value)
                    }
                    className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900 font-mono text-sm"
                  />
                </div>
              </label>
              <label className="block">
                <span className="text-sm text-gray-500">
                  Color secundario
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="color"
                    value={poster.secondaryColor}
                    onChange={(e) =>
                      updateField("secondaryColor", e.target.value)
                    }
                    className="w-10 h-10 rounded cursor-pointer border border-gray-200"
                  />
                  <input
                    type="text"
                    value={poster.secondaryColor}
                    onChange={(e) =>
                      updateField("secondaryColor", e.target.value)
                    }
                    className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900 font-mono text-sm"
                  />
                </div>
              </label>
            </div>
          </section>

          {/* Services Editor */}
          <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Servicios</h2>
              <button
                onClick={addService}
                disabled={poster.services.length >= 6}
                className="text-sm px-3 py-1.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                + Agregar
              </button>
            </div>

            <label className="block">
              <span className="text-sm text-gray-500">
                Título de la sección
              </span>
              <input
                type="text"
                value={poster.servicesTitle}
                onChange={(e) =>
                  updateField("servicesTitle", e.target.value)
                }
                className="w-full mt-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900"
              />
            </label>

            <div className="space-y-4">
              {poster.services.map((svc, idx) => (
                <div
                  key={idx}
                  className={`border rounded-lg p-4 space-y-3 ${
                    svc.featured
                      ? "border-blue-300 bg-blue-50/50"
                      : "border-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      Servicio {idx + 1}
                    </span>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-1 text-xs text-gray-500">
                        <input
                          type="checkbox"
                          checked={svc.featured}
                          onChange={(e) =>
                            updateService(idx, "featured", e.target.checked)
                          }
                          className="accent-blue-600"
                        />
                        Destacado
                      </label>
                      <button
                        onClick={() => removeService(idx)}
                        className="text-xs text-red-500 hover:text-red-700"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={svc.name}
                      onChange={(e) =>
                        updateService(idx, "name", e.target.value)
                      }
                      placeholder="Nombre"
                      className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900 text-sm"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={svc.price}
                        onChange={(e) =>
                          updateService(idx, "price", e.target.value)
                        }
                        placeholder="Precio"
                        className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900 text-sm"
                      />
                      <input
                        type="text"
                        value={svc.duration}
                        onChange={(e) =>
                          updateService(idx, "duration", e.target.value)
                        }
                        placeholder="Duración"
                        className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900 text-sm"
                      />
                    </div>
                  </div>
                  <input
                    type="text"
                    value={svc.description}
                    onChange={(e) =>
                      updateService(idx, "description", e.target.value)
                    }
                    placeholder="Descripción breve"
                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900 text-sm"
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Contact */}
          <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-semibold">Contacto & Pie</h2>
            <div className="grid grid-cols-2 gap-4">
              <label className="block">
                <span className="text-sm text-gray-500">Teléfono</span>
                <input
                  type="text"
                  value={poster.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  className="w-full mt-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900"
                />
              </label>
              <label className="block">
                <span className="text-sm text-gray-500">
                  Texto de reserva
                </span>
                <input
                  type="text"
                  value={poster.bookingLabel}
                  onChange={(e) =>
                    updateField("bookingLabel", e.target.value)
                  }
                  className="w-full mt-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900"
                />
              </label>
            </div>
            <label className="block">
              <span className="text-sm text-gray-500">Dirección</span>
              <input
                type="text"
                value={poster.address}
                onChange={(e) => updateField("address", e.target.value)}
                className="w-full mt-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900"
              />
            </label>
            <label className="block">
              <span className="text-sm text-gray-500">
                Texto bajo el QR
              </span>
              <input
                type="text"
                value={poster.bookingUrl}
                onChange={(e) => updateField("bookingUrl", e.target.value)}
                className="w-full mt-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900"
              />
            </label>
            <label className="block">
              <span className="text-sm text-gray-500">
                URL destino del QR (lo que escanea el cliente)
              </span>
              <input
                type="text"
                value={poster.qrUrl}
                onChange={(e) => updateField("qrUrl", e.target.value)}
                className="w-full mt-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900 font-mono text-sm"
              />
            </label>
          </section>

          {/* Export */}
          <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-3">
            <h2 className="text-lg font-semibold mb-1">Exportar</h2>
            <p className="text-sm text-gray-500 mb-3">
              Se exporta a <strong>4x resolución</strong> para impresión de
              alta calidad en tamaño oficio (8.5&quot; × 14&quot;).
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={downloadPNG}
                disabled={exporting}
                className="px-5 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {exporting ? "Exportando..." : "📥 Descargar PNG"}
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

        {/* ── RIGHT: Live poster preview ── */}
        <div className="flex flex-col items-center">
          <p className="text-sm text-gray-500 mb-3 font-medium">
            Vista previa — Tamaño Oficio (8.5&quot; × 14&quot;)
          </p>
          <div className="sticky top-24">
            <PosterPreview data={poster} posterRef={posterRef} />
          </div>
        </div>
      </div>
    </div>
  );
}
