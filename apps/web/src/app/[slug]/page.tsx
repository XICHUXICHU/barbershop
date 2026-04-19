import { notFound } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { AppIcon } from "@/components/app-icon";
import type { BarbershopDto, ServiceDto, BarberDto } from "@barber/shared";

interface Props {
  params: Promise<{ slug: string }>;
}

interface GalleryPhoto {
  id: string;
  imageUrl: string;
  caption: string | null;
}

export default async function HomePage({ params }: Props) {
  const { slug } = await params;

  let shop: BarbershopDto;
  try {
    shop = await apiFetch<BarbershopDto>(`/barbershops/${slug}`);
  } catch {
    notFound();
  }

  const [services, barbers, gallery] = await Promise.all([
    apiFetch<ServiceDto[]>(`/services/barbershop/${shop.id}`),
    apiFetch<BarberDto[]>(`/barbers/barbershop/${shop.id}`),
    apiFetch<GalleryPhoto[]>(`/gallery/barbershop/${shop.id}`).catch(() => [] as GalleryPhoto[]),
  ]);

  const activeServices = services.filter((s) => s.isActive).slice(0, 4);
  const activeBarbers = barbers.filter((b) => b.isActive);

  return (
    <>
      {/* ═══ HERO ═══ */}
      <section className="relative min-h-[85vh] flex items-end pb-16 md:pb-24 overflow-hidden">
        <div className="absolute inset-0 z-0">
          {shop.coverUrl ? (
            <img
              src={shop.coverUrl}
              alt={`Portada de ${shop.name}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-hc-surface via-hc-surface/70 to-hc-surface/30" />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12">
          <p className="font-body text-xs text-hc-primary uppercase tracking-[0.4em] mb-6">
            Barbería de Autor
          </p>
          <h1 className="font-headline text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-[0.9] tracking-tight text-white mb-6">
            {shop.name}
          </h1>
          <div className="h-px w-16 bg-hc-primary mb-6" />
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <Link
              href={`/${slug}/reservar`}
              className="bg-hc-primary text-hc-on-primary px-8 py-3.5 text-xs font-bold uppercase tracking-widest hover:brightness-110 transition-all duration-300"
            >
              Reservar Cita
            </Link>
            <Link
              href={`/${slug}/servicios`}
              className="border border-hc-on-surface/30 text-hc-on-surface px-8 py-3.5 text-xs font-bold uppercase tracking-widest hover:border-hc-primary hover:text-hc-primary transition-all duration-300"
            >
              Ver Servicios
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 right-12 hidden md:flex flex-col items-center gap-3 opacity-30">
          <span className="text-[10px] uppercase tracking-[0.3em] font-body [writing-mode:vertical-rl]">
            Scroll
          </span>
          <div className="w-px h-12 bg-hc-on-surface-variant" />
        </div>
      </section>

      {/* ═══ SERVICIOS DESTACADOS ═══ */}
      {activeServices.length > 0 && (
        <section className="py-14 md:py-20">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <div className="flex items-end justify-between mb-8 gap-8 border-b border-hc-outline-variant/20 pb-6">
              <h2 className="font-headline text-3xl md:text-4xl font-bold tracking-tight">
                Servicios
              </h2>
              <Link
                href={`/${slug}/servicios`}
                className="text-hc-primary text-xs uppercase tracking-widest font-bold hover:opacity-70 transition-opacity whitespace-nowrap"
              >
                Ver todos →
              </Link>
            </div>

            <div className="divide-y divide-hc-outline-variant/20">
              {activeServices.map((service, i) => (
                <div
                  key={service.id}
                  className="group flex items-center gap-6 py-7 hover:pl-2 transition-all duration-300"
                >
                  <span className="font-body text-sm text-hc-on-surface-variant w-6 shrink-0 select-none">
                    0{i + 1}
                  </span>
                  <div className="w-14 h-14 shrink-0 overflow-hidden bg-hc-surface-container-high">
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
                  <div className="flex-1 min-w-0">
                    <h3 className="font-headline text-lg md:text-xl font-bold text-hc-on-surface">
                      {service.name}
                    </h3>
                    {service.description && (
                      <p className="text-hc-on-surface-variant text-sm mt-0.5 truncate">
                        {service.description}
                      </p>
                    )}
                  </div>
                  <span className="hidden md:block text-sm text-hc-on-surface-variant uppercase tracking-wider shrink-0">
                    {service.durationMinutes} min
                  </span>
                  <span className="font-headline text-xl text-hc-primary font-bold shrink-0">
                    ${service.priceAmount}
                  </span>
                  <span className="text-hc-primary opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    →
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══ EQUIPO ═══ */}
      {activeBarbers.length > 0 && (
        <section className="py-14 md:py-20 bg-hc-surface-container-lowest">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <div className="flex items-end justify-between mb-8 border-b border-hc-outline-variant/20 pb-6">
              <h2 className="font-headline text-3xl md:text-4xl font-bold tracking-tight">
                Equipo
              </h2>
              {activeBarbers.length > 3 && (
                <Link
                  href={`/${slug}/barberos`}
                  className="text-hc-primary text-xs uppercase tracking-widest font-bold hover:opacity-70 transition-opacity whitespace-nowrap"
                >
                  Ver todos →
                </Link>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-hc-outline-variant/10">
              {activeBarbers.slice(0, 3).map((barber) => (
                <div
                  key={barber.id}
                  className="group relative overflow-hidden aspect-[3/4] bg-hc-surface-container-high cursor-pointer"
                >
                  {barber.avatarUrl ? (
                    <img
                      src={barber.avatarUrl}
                      alt={barber.name}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-hc-surface-container">
                      <span className="font-headline text-9xl text-hc-primary/15">
                        {barber.name.charAt(0)}
                      </span>
                    </div>
                  )}

                  {/* Always visible name */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-hc-surface/80 to-transparent group-hover:opacity-0 transition-opacity duration-400">
                    <h4 className="font-headline text-xl font-bold text-hc-on-surface">
                      {barber.name}
                    </h4>
                  </div>

                  {/* Hover reveal */}
                  <div className="absolute inset-0 bg-hc-surface/85 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-400 p-8 text-center">
                    <h4 className="font-headline text-2xl font-bold text-hc-on-surface mb-2">
                      {barber.name}
                    </h4>
                    <div className="h-px w-8 bg-hc-primary my-4" />
                    <Link
                      href={`/${slug}/reservar`}
                      className="border border-hc-primary text-hc-primary px-6 py-2.5 text-xs font-bold uppercase tracking-widest hover:bg-hc-primary hover:text-hc-on-primary transition-all duration-300"
                    >
                      Reservar
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══ GALERÍA DE TRABAJOS ═══ */}
      {gallery.length > 0 && (
        <section className="py-14 md:py-20">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <div className="flex items-end justify-between mb-8 border-b border-hc-outline-variant/20 pb-6">
              <h2 className="font-headline text-3xl md:text-4xl font-bold tracking-tight">
                Nuestro Trabajo
              </h2>
              <span className="text-hc-on-surface-variant text-xs uppercase tracking-widest font-body">
                {gallery.length} fotos
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1">
              {gallery.slice(0, 8).map((photo) => (
                <div
                  key={photo.id}
                  className="group relative aspect-square overflow-hidden bg-hc-surface-container-high"
                >
                  <img
                    src={photo.imageUrl}
                    alt={photo.caption || "Trabajo realizado"}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {photo.caption && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                      <p className="text-white text-sm font-body">{photo.caption}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══ CTA EDITORIAL ═══ */}
      <section className="py-14 md:py-20 px-6 md:px-12">
        <div className="max-w-7xl mx-auto border-t border-b border-hc-outline-variant/20 py-12 text-center">
          <p className="font-body text-xs text-hc-primary uppercase tracking-[0.4em] mb-6">
            Agenda tu visita
          </p>
          <h2 className="font-headline text-4xl md:text-5xl font-bold tracking-tight mb-8 text-hc-on-surface">
            ¿Listo para tu
            <br />
            <span className="italic text-hc-primary">próxima cita?</span>
          </h2>
          <Link
            href={`/${slug}/reservar`}
            className="border border-hc-primary text-hc-primary px-12 py-4 text-xs font-bold uppercase tracking-widest hover:bg-hc-primary hover:text-hc-on-primary transition-all duration-300 inline-block"
          >
            Reservar Ahora
          </Link>
        </div>
      </section>

      {/* ═══ CONTACTO ═══ */}
      {(shop.address || shop.phone) && (
        <section className="py-10 bg-hc-surface-container-lowest border-t border-hc-outline-variant/10">
          <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row items-start md:items-center gap-10 md:gap-16 flex-wrap">
            {shop.address && (
              <div className="flex items-start gap-3">
                <AppIcon name="location_on" className="text-hc-primary text-base mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs uppercase tracking-widest text-hc-outline mb-1">
                    Dirección
                  </p>
                  <p className="text-hc-on-surface-variant text-sm">{shop.address}</p>
                </div>
              </div>
            )}
            {shop.phone && (
              <div className="flex items-start gap-3">
                <AppIcon name="call" className="text-hc-primary text-base mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs uppercase tracking-widest text-hc-outline mb-1">
                    Teléfono
                  </p>
                  <a
                    href={`tel:${shop.phone}`}
                    className="text-hc-on-surface-variant text-sm hover:text-hc-primary transition-colors"
                  >
                    {shop.phone}
                  </a>
                </div>
              </div>
            )}
            <div className="flex items-start gap-3">
              <AppIcon name="schedule" className="text-hc-primary text-base mt-0.5 shrink-0" />
              <div>
                <p className="text-xs uppercase tracking-widest text-hc-outline mb-1">
                  Reservas
                </p>
                <p className="text-hc-on-surface-variant text-sm">Online las 24 horas</p>
              </div>
            </div>
            <div className="md:ml-auto shrink-0">
              <Link
                href={`/${slug}/reservar`}
                className="bg-hc-primary text-hc-on-primary px-8 py-3 text-xs font-bold uppercase tracking-widest hover:brightness-110 transition-all"
              >
                Reservar Cita
              </Link>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
