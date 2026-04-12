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

  const iconMap: Record<number, string> = {
    0: "content_cut",
    1: "face",
    2: "clean_hands",
    3: "spa",
    4: "brush",
    5: "self_improvement",
  };

  // Split services for bento layout: first one is featured, rest are cards/rows
  const featured = activeServices[0];
  const secondary = activeServices.slice(1, 3);
  const remaining = activeServices.slice(3);

  return (
    <>
      {/* ═══ Hero Header ═══ */}
      <header className="relative px-8 pt-32 pb-20 overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col items-start gap-6 relative z-10">
          <h1 className="font-headline text-6xl md:text-8xl font-bold tracking-tighter leading-tight max-w-3xl">
            El Arte de la{" "}
            <span className="text-hc-primary italic">Precisión</span>
          </h1>
          <p className="font-body text-xl text-hc-on-surface-variant max-w-xl leading-relaxed">
            Estándares rigurosos para el caballero moderno. Cada servicio en{" "}
            {shop.name} es un ritual de restauración y estilo.
          </p>
          <div className="h-px w-24 bg-hc-primary mt-4" />
        </div>
      </header>

      {/* ═══ Bento Grid de Servicios ═══ */}
      <section className="px-8 max-w-7xl mx-auto pb-24">
        {activeServices.length === 0 ? (
          <div className="text-center py-20">
            <AppIcon name="content_cut" className="text-hc-outline text-6xl mb-6" />
            <h2 className="font-headline text-3xl font-bold mb-4">
              Próximamente
            </h2>
            <p className="text-hc-on-surface-variant text-lg">
              {shop.name} está preparando su menú de servicios.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Featured Service (large card) */}
            {featured && (
              <div className="md:col-span-8 group relative overflow-hidden bg-hc-surface-container-low rounded-lg transition-all duration-500 hover:bg-hc-surface-container">
                <div className="flex flex-col md:flex-row h-full">
                  <div className="md:w-1/2 h-64 md:h-auto overflow-hidden bg-gradient-to-br from-hc-surface-container-high to-hc-surface-container-lowest flex items-center justify-center p-4">
                    {featured.imageUrl ? (
                      <img src={featured.imageUrl} alt={featured.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700" />
                    ) : (
                      <AppIcon name={iconMap[0]} className="text-hc-primary/40 text-[120px] group-hover:scale-110 transition-transform duration-700" />
                    )}
                  </div>
                  <div className="md:w-1/2 p-8 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="font-headline text-3xl font-bold text-hc-on-surface">
                          {featured.name}
                        </h3>
                        <span className="font-headline text-2xl text-hc-primary">
                          ${(featured.priceAmount / 100).toFixed(2)}
                        </span>
                      </div>
                      <p className="text-hc-on-surface-variant mb-6 leading-relaxed">
                        {featured.description ||
                          "Nuestro servicio exclusivo. Incluye consulta personalizada y acabado de precisión."}
                      </p>
                      <div className="flex items-center gap-2 text-sm font-label text-hc-outline uppercase tracking-widest">
                        <AppIcon name="schedule" className="text-sm" />
                        <span>{featured.durationMinutes} Minutos</span>
                      </div>
                    </div>
                    <Link
                      href={`/${slug}/reservar`}
                      className="mt-8 text-hc-primary font-label text-sm uppercase tracking-widest flex items-center gap-2 hover:gap-4 transition-all"
                    >
                      Reservar{" "}
                      <AppIcon name="chevron_right" className="text-base" />
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Secondary Services (side cards) */}
            {secondary.length > 0 && (
              <div className="md:col-span-4 flex flex-col gap-6">
                {secondary.map((service, i) => (
                  <div
                    key={service.id}
                    className="flex-1 p-8 rounded-lg bg-hc-surface-container-high border-b-2 border-transparent hover:border-hc-primary transition-all flex flex-col justify-between overflow-hidden"
                  >
                    <div>
                      {service.imageUrl ? (
                        <div className="-mx-8 -mt-8 mb-6 h-44 overflow-hidden bg-hc-surface-container-lowest/60 p-2">
                          <img src={service.imageUrl} alt={service.name} className="w-full h-full object-contain" />
                        </div>
                      ) : (
                        <AppIcon name={iconMap[(i + 1) % 6]} className="text-hc-primary text-4xl mb-6" />
                      )}
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-headline text-2xl font-bold">
                          {service.name}
                        </h3>
                        <span className="font-headline text-xl text-hc-primary">
                          ${(service.priceAmount / 100).toFixed(2)}
                        </span>
                      </div>
                      <p className="text-hc-on-surface-variant text-sm leading-relaxed mb-6">
                        {service.description ||
                          `Servicio profesional de ${service.durationMinutes} minutos.`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-label text-hc-outline uppercase tracking-widest">
                      <AppIcon name="schedule" className="text-xs" />
                      <span>{service.durationMinutes} Minutos</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Remaining Services (list rows) */}
            {remaining.length > 0 && (
              <div className="md:col-span-12 mt-12">
                <h2 className="font-headline text-3xl font-bold mb-8">
                  Detalles de Refinamiento
                </h2>
                <div className="space-y-4">
                  {remaining.map((service, i) => (
                    <div
                      key={service.id}
                      className="flex items-center justify-between p-6 bg-hc-surface-container-lowest rounded-md group hover:bg-hc-surface-container-low transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-6">
                        {service.imageUrl ? (
                          <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-hc-surface-container-high/40 p-1">
                            <img src={service.imageUrl} alt={service.name} className="w-full h-full object-contain" />
                          </div>
                        ) : (
                          <AppIcon name={iconMap[(i + 3) % 6]} className="text-hc-outline group-hover:text-hc-primary transition-colors text-xl" />
                        )}
                        <div>
                          <h4 className="font-label font-bold">
                            {service.name}
                          </h4>
                          <p className="text-xs text-hc-outline uppercase tracking-tighter">
                            Tratamiento de {service.durationMinutes} Min
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-8">
                        <span className="font-headline text-lg">
                          ${(service.priceAmount / 100).toFixed(2)}
                        </span>
                        <Link href={`/${slug}/reservar`}>
                          <AppIcon name="add_circle" className="text-hc-outline-variant hover:text-hc-primary transition-colors text-xl" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* ═══ CTA ═══ */}
      <section className="px-8 max-w-7xl mx-auto pb-24">
        <div className="bg-hc-surface-container-low p-12 rounded-lg text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-hc-primary/10 via-transparent to-transparent opacity-50" />
          <div className="relative z-10">
            <h2 className="font-headline text-4xl md:text-5xl font-bold mb-6">
              ¿Listo para tu transformación?
            </h2>
            <p className="text-hc-on-surface-variant max-w-2xl mx-auto mb-10 text-lg">
              Nuestros maestros barberos están aceptando nuevos clientes
              actualmente. Asegura tu cita ahora.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href={`/${slug}/reservar`}
                className="bg-hc-primary text-hc-on-primary px-10 py-4 rounded-md font-label font-bold uppercase tracking-widest hover:bg-hc-primary-container transition-all"
              >
                Reserva tu Servicio
              </Link>
              <Link
                href={`/${slug}/barberos`}
                className="border border-hc-outline-variant text-hc-on-surface px-10 py-4 rounded-md font-label font-bold uppercase tracking-widest hover:bg-hc-surface-container-high transition-all"
              >
                Ver Barberos
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
