import { notFound } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { AppIcon } from "@/components/app-icon";
import type { BarbershopDto, ServiceDto } from "@barber/shared";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ServiciosPage({ params }: Props) {
  const { slug } = await params;

  let shop: BarbershopDto;
  try {
    shop = await apiFetch<BarbershopDto>(`/barbershops/${slug}`);
  } catch {
    notFound();
  }

  const services = await apiFetch<ServiceDto[]>(
    `/services/barbershop/${shop.id}`
  );
  const activeServices = services.filter((s) => s.isActive);

  return (
    <>
      {/* Header */}
      <header className="pt-28 pb-10 px-6 md:px-12 max-w-7xl mx-auto border-b border-hc-outline-variant/20">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <p className="font-body text-xs text-hc-primary uppercase tracking-[0.4em] mb-4">
              {shop.name}
            </p>
            <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tight leading-none text-hc-on-surface">
              Servicios
            </h1>
          </div>
          <p className="font-body text-hc-on-surface-variant text-sm max-w-xs leading-relaxed md:text-right">
            Cada servicio ejecutado con precisión y productos de primera calidad.
          </p>
        </div>
      </header>

      {/* Cartel de Servicios Personalizado */}
      {shop.servicesPosterUrl && (
        <section className="max-w-7xl mx-auto px-6 md:px-12 py-10 border-b border-hc-outline-variant/20">
          <div className="flex flex-col items-center">
            <p className="font-body text-xs text-hc-primary uppercase tracking-[0.4em] mb-6">
              Nuestros Precios
            </p>
            <div className="relative group cursor-pointer" onClick={() => window.open(shop.servicesPosterUrl!, '_blank')}>
              <img
                src={shop.servicesPosterUrl}
                alt="Lista de precios y servicios"
                className="max-w-full md:max-w-2xl h-auto rounded-lg shadow-lg border border-hc-outline-variant/20"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-medium bg-black/60 px-4 py-2 rounded-full">
                  Click para ver en grande
                </span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Lista de Servicios */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-10">
        {activeServices.length === 0 ? (
          <div className="text-center py-32">
            <AppIcon name="content_cut" className="text-hc-outline text-5xl mb-6" />
            <h2 className="font-headline text-3xl font-bold mb-3">Próximamente</h2>
            <p className="text-hc-on-surface-variant text-sm">
              {shop.name} está preparando su menú de servicios.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-hc-outline-variant/20">
            {activeServices.map((service, i) => (
              <div
                key={service.id}
                className="group flex flex-col md:grid md:grid-cols-12 gap-4 md:gap-6 py-6 md:items-center hover:pl-2 transition-all duration-300"
              >
                <span className="hidden md:block font-body text-sm text-hc-on-surface-variant md:col-span-1">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="md:col-span-2 w-16 h-16 overflow-hidden bg-hc-surface-container-high shrink-0">
                  {service.imageUrl ? (
                    <img
                      src={service.imageUrl}
                      alt={service.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <AppIcon name="content_cut" className="text-hc-primary/30 text-xl" />
                    </div>
                  )}
                </div>
                <div className="md:col-span-5">
                  <h3 className="font-headline text-lg md:text-xl font-bold text-hc-on-surface">
                    {service.name}
                  </h3>
                  {service.description && (
                    <p className="text-hc-on-surface-variant text-sm mt-0.5 line-clamp-2">
                      {service.description}
                    </p>
                  )}
                </div>
                <div className="md:col-span-2 flex items-center gap-1.5">
                  <AppIcon name="schedule" className="text-hc-on-surface-variant text-sm" />
                  <span className="text-sm text-hc-on-surface-variant">
                    {service.durationMinutes} min
                  </span>
                </div>
                <div className="md:col-span-2 flex items-center justify-between md:justify-end gap-6">
                  <span className="font-headline text-2xl text-hc-primary font-bold">
                    ${service.priceAmount}
                  </span>
                  <Link
                    href={`/${slug}/reservar`}
                    className="border border-hc-primary text-hc-primary px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-hc-primary hover:text-hc-on-primary transition-all duration-300 opacity-0 group-hover:opacity-100"
                  >
                    Reservar
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="px-6 md:px-12 max-w-7xl mx-auto pb-14">
        <div className="border-t border-b border-hc-outline-variant/20 py-12 text-center">
          <p className="font-body text-xs text-hc-primary uppercase tracking-[0.4em] mb-6">
            Sin esperas
          </p>
          <h2 className="font-headline text-3xl md:text-4xl font-bold tracking-tight mb-8 text-hc-on-surface">
            Elige tu servicio,
            <br />
            <span className="italic text-hc-primary">nosotros hacemos el resto.</span>
          </h2>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href={`/${slug}/reservar`}
              className="bg-hc-primary text-hc-on-primary px-10 py-4 text-xs font-bold uppercase tracking-widest hover:brightness-110 transition-all"
            >
              Reservar Ahora
            </Link>
            <Link
              href={`/${slug}/barberos`}
              className="border border-hc-outline-variant/40 text-hc-on-surface px-10 py-4 text-xs font-bold uppercase tracking-widest hover:border-hc-primary hover:text-hc-primary transition-all"
            >
              Ver Equipo
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
