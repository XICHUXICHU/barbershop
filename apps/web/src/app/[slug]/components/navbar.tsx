"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

interface NavbarProps {
  shopName: string;
  slug: string;
  phone?: string;
}

export function Navbar({ shopName, slug, phone }: NavbarProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        scrolled
          ? "bg-hc-surface/95 backdrop-blur-md border-b border-hc-outline-variant/20 py-3"
          : "bg-gradient-to-b from-black/60 to-transparent py-4"
      }`}
    >
      <div className="flex justify-between items-center px-6 md:px-12 max-w-screen-2xl mx-auto">
        {/* Logo */}
        <Link
          href={`/${slug}`}
          className="font-headline text-lg md:text-xl italic text-white hover:text-hc-primary transition-colors"
        >
          {shopName}
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-10">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`relative font-body text-xs tracking-widest uppercase pb-1 transition-colors ${
                isActive(link.href)
                  ? "text-hc-primary"
                  : "text-white/80 hover:text-white"
              }`}
            >
              {link.label}
              {isActive(link.href) && (
                <span className="absolute bottom-0 left-0 w-full h-px bg-hc-primary" />
              )}
            </Link>
          ))}
        </div>

        {/* Right: phone + CTA + hamburger */}
        <div className="flex items-center gap-5">
          {phone && (
            <a
              href={`tel:${phone}`}
              className="hidden lg:block text-xs text-white/70 hover:text-hc-primary transition-colors tracking-widest uppercase"
            >
              {phone}
            </a>
          )}
          <Link
            href={`/${slug}/reservar`}
            className="border border-hc-primary text-hc-primary px-5 py-2 text-xs font-bold uppercase tracking-widest hover:bg-hc-primary hover:text-hc-on-primary transition-all duration-300"
          >
            Reservar
          </Link>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-1 text-hc-on-surface-variant hover:text-hc-primary transition-colors"
            aria-label="Menú"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-hc-surface/98 backdrop-blur-md border-t border-hc-outline-variant/20 px-6 pt-4 pb-6">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={`block py-3 text-sm uppercase tracking-widest font-body border-b border-hc-outline-variant/10 transition-colors ${
                isActive(link.href)
                  ? "text-hc-primary"
                  : "text-hc-on-surface-variant hover:text-hc-on-surface"
              }`}
            >
              {link.label}
            </Link>
          ))}
          {phone && (
            <a
              href={`tel:${phone}`}
              className="block pt-4 text-sm text-hc-on-surface-variant hover:text-hc-primary transition-colors tracking-widest uppercase"
            >
              {phone}
            </a>
          )}
        </div>
      )}
    </nav>
  );
}
