import Link from "next/link";
import { AppIcon } from "@/components/app-icon";

interface FooterProps {
  shopName: string;
  slug: string;
  address: string;
  phone?: string;
}

export function Footer({ shopName, slug, address, phone }: FooterProps) {
  return (
    <footer className="bg-hc-surface-container-lowest border-t border-hc-outline-variant/10">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-10 grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Brand + contact */}
        <div>
          <p className="font-headline text-xl italic text-hc-on-surface mb-6">
            {shopName}
          </p>
          <div className="space-y-3">
            {address && (
              <div className="flex items-start gap-3">
                <AppIcon name="location_on" className="text-hc-primary text-sm mt-0.5 shrink-0" />
                <p className="text-hc-on-surface-variant text-sm leading-relaxed">{address}</p>
              </div>
            )}
            {phone && (
              <a href={`tel:${phone}`} className="flex items-center gap-3 group">
                <AppIcon name="call" className="text-hc-primary text-sm shrink-0" />
                <p className="text-hc-on-surface-variant text-sm group-hover:text-hc-primary transition-colors">
                  {phone}
                </p>
              </a>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-widest text-hc-on-surface-variant mb-6">
            Navegación
          </h4>
          <ul className="space-y-3">
            {[
              { href: `/${slug}`, label: "Inicio" },
              { href: `/${slug}/servicios`, label: "Servicios" },
              { href: `/${slug}/barberos`, label: "Barberos" },
              { href: `/${slug}/reservar`, label: "Reservar" },
            ].map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-hc-on-surface-variant text-sm hover:text-hc-primary transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* CTA column */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-widest text-hc-on-surface-variant mb-6">
            ¿Primera visita?
          </h4>
          <p className="text-hc-on-surface-variant text-sm mb-6 leading-relaxed">
            Reserva tu cita en minutos. Sin esperas, sin llamadas.
          </p>
          <Link
            href={`/${slug}/reservar`}
            className="border border-hc-primary text-hc-primary px-6 py-2.5 text-xs font-bold uppercase tracking-widest hover:bg-hc-primary hover:text-hc-on-primary transition-all duration-300 inline-block"
          >
            Reservar Ahora
          </Link>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-6 border-t border-hc-outline-variant/10 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="font-body text-xs text-hc-outline">
          © {new Date().getFullYear()} {shopName}. Todos los derechos reservados.
        </p>
        <div className="flex gap-6">
          <span className="text-hc-outline text-xs">Política de Privacidad</span>
          <span className="text-hc-outline text-xs">Términos de Servicio</span>
        </div>
      </div>
    </footer>
  );
}
