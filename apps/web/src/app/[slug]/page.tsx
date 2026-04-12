import { notFound } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { AppIcon } from "@/components/app-icon";
import type { BarbershopDto, ServiceDto, BarberDto } from "@barber/shared";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function HomePage({ params }: Props) {
  const { slug } = await params;

  let shop: BarbershopDto;
  try {
    shop = await apiFetch<BarbershopDto>(`/barbershops/${slug}`);
  } catch {
    notFound();
  }

  const [services, barbers] = await Promise.all([
    apiFetch<ServiceDto[]>(`/services/barbershop/${shop.id}`),
    apiFetch<BarberDto[]>(`/barbers/barbershop/${shop.id}`),
  ]);

  const activeServices = services.filter((s) => s.isActive).slice(0, 3);
  const activeBarbers = barbers.filter((b) => b.isActive);

  const serviceIcons = ["content_cut", "face", "clean_hands", "spa", "brush"];

  return (
    <>
      {/* ═══ Hero Section ═══ */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          {shop.coverUrl ? (
            <img
              src={shop.coverUrl}
              alt={`Portada de ${shop.name}`}
              className="w-full h-full object-cover opacity-60"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-950 opacity-80" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-hc-surface via-hc-surface/40 to-transparent" />
        </div>

        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
          <h1 className="font-headline text-5xl md:text-8xl font-bold tracking-tight mb-6 leading-none">
            El Arte de la{" "}
            <span className="text-hc-primary italic">Precisión</span>
          </h1>
          <p className="font-body text-lg md:text-xl text-hc-on-surface-variant max-w-2xl mx-auto mb-10 tracking-wide uppercase">
            {shop.name}: Donde la tradición atemporal se encuentra con el oficio
            moderno.
          </p>
          <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
            <Link
              href={`/${slug}/reservar`}
              className="bg-hc-primary text-hc-on-primary px-10 py-4 rounded-lg font-bold text-lg hover:bg-hc-primary-container transition-all"
            >
              Reserva tu Cita
            </Link>
            <Link
              href={`/${slug}/servicios`}
              className="border border-hc-outline/20 text-hc-primary px-10 py-4 rounded-lg font-bold text-lg hover:bg-hc-surface-container-low transition-all"
            >
              Ver Menú
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ Servicios Destacados ═══ */}
      {activeServices.length > 0 && (
        <section className="py-24 bg-hc-surface-container-low">
          <div className="max-w-7xl mx-auto px-8">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
              <div className="max-w-2xl">
                <span className="text-hc-primary font-label text-sm tracking-[0.3em] uppercase mb-4 block">
                  Artesanía
                </span>
                <h2 className="font-headline text-4xl md:text-6xl font-bold">
                  Servicios Curados
                </h2>
              </div>
              <p className="font-body text-hc-on-surface-variant text-lg max-w-md">
                Cada servicio se realiza con una atención meticulosa al detalle
                utilizando productos premium y herramientas artesanales.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-hc-outline-variant/10 overflow-hidden rounded-xl border border-hc-outline-variant/10">
              {activeServices.map((service, i) => (
                <div
                  key={service.id}
                  className="bg-hc-surface group hover:bg-hc-surface-container-high transition-all duration-500 flex flex-col"
                >
                  {service.imageUrl ? (
                    <div className="h-48 overflow-hidden bg-hc-surface-container-high/30 p-2">
                      <img src={service.imageUrl} alt={service.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700" />
                    </div>
                  ) : (
                    <div className="h-48 flex items-center justify-center bg-hc-surface-container-high/30">
                      <AppIcon name={serviceIcons[i % serviceIcons.length]} className="text-hc-primary/40 text-6xl" />
                    </div>
                  )}
                  <div className="p-10 flex-1 flex flex-col">
                    <h3 className="font-headline text-2xl font-bold mb-4">
                      {service.name}
                    </h3>
                    <p className="text-hc-on-surface-variant mb-8 flex-1">
                      {service.description ||
                        `Servicio profesional de ${service.durationMinutes} minutos.`}
                    </p>
                    <span className="text-hc-primary font-bold text-lg">
                      ${(service.priceAmount / 100).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link
                href={`/${slug}/servicios`}
                className="text-hc-primary uppercase tracking-widest font-bold text-sm hover:underline"
              >
                Ver Todos los Servicios →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ═══ Nuestros Barberos ═══ */}
      {activeBarbers.length > 0 && (
        <section className="py-24 bg-hc-surface">
          <div className="max-w-7xl mx-auto px-8">
            <div className="text-center mb-16">
              <h2 className="font-headline text-4xl md:text-6xl font-bold mb-4">
                Los Maestros
              </h2>
              <p className="font-body text-hc-on-surface-variant uppercase tracking-widest text-sm">
                Experiencia y pasión frente al sillón.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeBarbers.slice(0, 3).map((barber) => (
                <div
                  key={barber.id}
                  className="group relative overflow-hidden rounded-xl aspect-[3/4] bg-hc-surface-container-high"
                >
                  {barber.avatarUrl ? (
                    <img
                      src={barber.avatarUrl}
                      alt={barber.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-hc-surface-container-high to-hc-surface-container-lowest">
                      <span className="text-8xl font-headline text-hc-primary/30">
                        {barber.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-8">
                    <h4 className="font-headline text-2xl font-bold">
                      {barber.name}
                    </h4>
                    <p className="text-hc-primary font-bold uppercase tracking-widest text-sm">
                      Barbero Profesional
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {activeBarbers.length > 3 && (
              <div className="text-center mt-12">
                <Link
                  href={`/${slug}/barberos`}
                  className="text-hc-primary uppercase tracking-widest font-bold text-sm hover:underline"
                >
                  Ver Todos los Barberos →
                </Link>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ═══ CTA Block ═══ */}
      <section className="py-24 px-8">
        <div className="max-w-5xl mx-auto bg-hc-primary py-20 px-8 rounded-2xl text-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          <h2 className="font-headline text-hc-on-primary text-4xl md:text-6xl font-bold mb-8 relative z-10">
            Reserva tu Sillón
          </h2>
          <p className="text-hc-on-primary/80 font-body text-xl mb-10 max-w-xl mx-auto relative z-10">
            Únete a las filas de los bien arreglados. Nuestra agenda se llena
            rápido—asegura tu lugar hoy mismo.
          </p>
          <Link
            href={`/${slug}/reservar`}
            className="bg-hc-surface-container-lowest text-hc-primary px-12 py-5 rounded-lg font-bold text-xl hover:scale-105 transition-transform relative z-10 inline-block"
          >
            Reservar Ahora
          </Link>
        </div>
      </section>

      {/* ═══ Contacto & Ubicación ═══ */}
      {(shop.address || shop.phone) && (
        <section className="py-24 bg-hc-surface-container-low">
          <div className="max-w-7xl mx-auto px-8">
            <div className="text-center mb-16">
              <span className="text-hc-primary font-label text-sm tracking-[0.3em] uppercase mb-4 block">
                Encuéntranos
              </span>
              <h2 className="font-headline text-4xl md:text-6xl font-bold">
                Contacto & Ubicación
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-hc-outline-variant/10 overflow-hidden rounded-xl border border-hc-outline-variant/10">
              {shop.address && (
                <div className="bg-hc-surface p-12 flex flex-col items-center text-center">
                  <AppIcon name="location_on" className="text-hc-primary text-4xl mb-6" />
                  <h3 className="font-headline text-xl font-bold mb-3">Dirección</h3>
                  <p className="text-hc-on-surface-variant">{shop.address}</p>
                </div>
              )}
              {shop.phone && (
                <div className="bg-hc-surface p-12 flex flex-col items-center text-center">
                  <AppIcon name="call" className="text-hc-primary text-4xl mb-6" />
                  <h3 className="font-headline text-xl font-bold mb-3">Teléfono</h3>
                  <a href={`tel:${shop.phone}`} className="text-hc-on-surface-variant hover:text-hc-primary transition-colors">
                    {shop.phone}
                  </a>
                </div>
              )}
              <div className="bg-hc-surface p-12 flex flex-col items-center text-center">
                <AppIcon name="schedule" className="text-hc-primary text-4xl mb-6" />
                <h3 className="font-headline text-xl font-bold mb-3">Horario</h3>
                <p className="text-hc-on-surface-variant">
                  Reserva online las 24 horas
                </p>
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
