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
    <footer className="bg-neutral-950">
      <div className="w-full py-12 px-8 border-t border-white/5 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 text-left">
        <div className="md:col-span-2">
          <div className="text-xl font-headline text-hc-primary mb-6">
            {shopName}
          </div>
          <p className="font-body text-sm tracking-wide text-neutral-400 max-w-xs mb-8">
            Excelencia en el cuidado masculino, donde las técnicas tradicionales
            se encuentran con el estilo contemporáneo.
          </p>
          {address && (
            <div className="flex gap-4 mb-4">
              <AppIcon name="location_on" className="text-hc-primary text-xl" />
              <p className="text-neutral-500 text-sm">{address}</p>
            </div>
          )}
          {phone && (
            <a href={`tel:${phone}`} className="flex gap-4 items-center group">
              <AppIcon name="call" className="text-hc-primary text-xl" />
              <p className="text-neutral-500 text-sm group-hover:text-neutral-200 transition-colors">{phone}</p>
            </a>
          )}
        </div>

        <div>
          <h4 className="text-hc-primary font-bold mb-6 text-sm uppercase tracking-widest">
            Navegación
          </h4>
          <ul className="space-y-4 font-body text-sm tracking-wide">
            <li>
              <Link
                href={`/${slug}`}
                className="text-neutral-500 hover:text-neutral-200 hover:underline decoration-hc-primary"
              >
                Inicio
              </Link>
            </li>
            <li>
              <Link
                href={`/${slug}/servicios`}
                className="text-neutral-500 hover:text-neutral-200 hover:underline decoration-hc-primary"
              >
                Servicios
              </Link>
            </li>
            <li>
              <Link
                href={`/${slug}/barberos`}
                className="text-neutral-500 hover:text-neutral-200 hover:underline decoration-hc-primary"
              >
                Barberos
              </Link>
            </li>
            <li>
              <Link
                href={`/${slug}/reservar`}
                className="text-neutral-500 hover:text-neutral-200 hover:underline decoration-hc-primary"
              >
                Reservar
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-hc-primary font-bold mb-6 text-sm uppercase tracking-widest">
            Legal
          </h4>
          <ul className="space-y-4 font-body text-sm tracking-wide">
            <li>
              <span className="text-neutral-500">Política de Privacidad</span>
            </li>
            <li>
              <span className="text-neutral-500">Términos de Servicio</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8 border-t border-white/5 text-center">
        <p className="font-body text-sm tracking-wide text-neutral-600">
          © {new Date().getFullYear()} {shopName}. Todos los Derechos
          Reservados.
        </p>
      </div>
    </footer>
  );
}
