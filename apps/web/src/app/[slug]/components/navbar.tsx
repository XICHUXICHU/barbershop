"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AppIcon } from "@/components/app-icon";
import { Menu, X } from "lucide-react";

interface NavbarProps {
  shopName: string;
  slug: string;
  phone?: string;
}

export function Navbar({ shopName, slug, phone }: NavbarProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { href: `/${slug}`, label: "Inicio" },
    { href: `/${slug}/servicios`, label: "Servicios" },
    { href: `/${slug}/barberos`, label: "Barberos" },
  ];

  const isActive = (href: string) => {
    if (href === `/${slug}`) return pathname === `/${slug}`;
    return pathname.startsWith(href);
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-neutral-950/90 backdrop-blur-md shadow-2xl shadow-black/50">
      <div className="flex justify-between items-center px-6 md:px-8 py-4 max-w-screen-2xl mx-auto">
        {/* Logo + phone */}
        <div className="flex items-center gap-4">
          <Link
            href={`/${slug}`}
            className="text-xl md:text-2xl font-bold text-hc-primary uppercase tracking-widest font-headline"
          >
            {shopName}
          </Link>
          {phone && (
            <a href={`tel:${phone}`} className="hidden lg:flex items-center gap-1 text-neutral-400 hover:text-hc-primary transition-colors text-sm">
              <AppIcon name="call" className="text-base" />
              {phone}
            </a>
          )}
        </div>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8 font-headline text-base">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={
                isActive(link.href)
                  ? "text-hc-primary font-bold border-b-2 border-hc-primary pb-1"
                  : "text-neutral-400 hover:text-hc-primary transition-colors"
              }
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right side: CTA + hamburger */}
        <div className="flex items-center gap-3">
          <Link
            href={`/${slug}/reservar`}
            className="bg-hc-primary text-hc-on-primary px-4 md:px-6 py-2 rounded-lg font-bold hover:bg-hc-primary-container hover:scale-95 transition-all duration-200 text-xs md:text-sm uppercase tracking-widest"
          >
            Reservar
          </Link>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 text-neutral-300 hover:text-hc-primary transition-colors"
            aria-label="Menú"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile slide-down menu */}
      {menuOpen && (
        <div className="md:hidden bg-neutral-950/95 backdrop-blur-md border-t border-white/5 px-6 pb-6 pt-4 space-y-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={`block py-3 px-4 rounded-lg text-lg font-headline transition-colors ${
                isActive(link.href)
                  ? "text-hc-primary bg-white/5 font-bold"
                  : "text-neutral-300 hover:text-hc-primary hover:bg-white/5"
              }`}
            >
              {link.label}
            </Link>
          ))}
          {phone && (
            <a
              href={`tel:${phone}`}
              className="flex items-center gap-2 py-3 px-4 rounded-lg text-lg text-neutral-400 hover:text-hc-primary transition-colors"
            >
              <AppIcon name="call" className="text-lg" />
              {phone}
            </a>
          )}
        </div>
      )}
    </nav>
  );
}
