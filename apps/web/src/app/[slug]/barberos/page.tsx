import { notFound } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { AppIcon } from "@/components/app-icon";
import type { BarbershopDto, BarberDto } from "@barber/shared";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function BarberosPage({ params }: Props) {
  const { slug } = await params;

  let shop: BarbershopDto;
  try {
    shop = await apiFetch<BarbershopDto>(`/barbershops/${slug}`);
  } catch {
    notFound();
  }

  const barbers = await apiFetch<BarberDto[]>(
    `/barbers/barbershop/${shop.id}`
  );
  const activeBarbers = barbers.filter((b) => b.isActive);

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
              Equipo
            </h1>
          </div>
          <p className="font-body text-hc-on-surface-variant text-sm max-w-xs leading-relaxed md:text-right">
            Profesionales dedicados a llevar tu estilo al siguiente nivel.
          </p>
        </div>
      </header>

      {/* Perfiles */}
      <main className="px-6 md:px-12 max-w-7xl mx-auto py-10">
        {activeBarbers.length === 0 ? (
          <div className="text-center py-32">
            <AppIcon name="groups" className="text-hc-outline text-5xl mb-6" />
            <h2 className="font-headline text-3xl font-bold mb-3">Próximamente</h2>
            <p className="text-hc-on-surface-variant text-sm">
              {shop.name} está incorporando a su equipo.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-hc-outline-variant/20">
            {activeBarbers.map((barber, index) => {
              const isEven = index % 2 === 0;
              return (
                <div
                  key={barber.id}
                  className="grid grid-cols-1 md:grid-cols-12 overflow-hidden"
                >
                  {/* Image */}
                  <div
                    className={`md:col-span-5 h-[400px] md:h-[500px] relative overflow-hidden bg-hc-surface-container-high group ${
                      !isEven ? "md:order-2" : ""
                    }`}
                  >
                    {barber.avatarUrl ? (
                      <img
                        src={barber.avatarUrl}
                        alt={barber.name}
                        className="w-full h-full object-cover grayscale hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-hc-surface-container">
                        <span className="font-headline text-[120px] text-hc-primary/15">
                          {barber.name.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div
                    className={`md:col-span-7 flex flex-col justify-center px-8 md:px-16 py-12 bg-hc-surface-container-lowest ${
                      !isEven ? "md:order-1" : ""
                    }`}
                  >
                    <p className="font-body text-xs text-hc-primary uppercase tracking-[0.4em] mb-4">
                      Barbero
                    </p>
                    <h2 className="font-headline text-3xl md:text-4xl font-bold tracking-tight mb-4 text-hc-on-surface">
                      {barber.name}
                    </h2>
                    <div className="h-px w-12 bg-hc-primary mb-6" />
                    <p className="text-hc-on-surface-variant text-sm leading-relaxed mb-8 max-w-sm">
                      Especialista en cortes de precisión con años de experiencia
                      en el arte de la barbería.
                    </p>
                    <Link
                      href={`/${slug}/reservar`}
                      className="border border-hc-primary text-hc-primary px-8 py-3 text-xs font-bold uppercase tracking-widest hover:bg-hc-primary hover:text-hc-on-primary transition-all duration-300 self-start"
                    >
                      Reservar con {barber.name.split(" ")[0]}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* CTA */}
        <div className="mt-14 border-t border-b border-hc-outline-variant/20 py-12 text-center">
          <h2 className="font-headline text-3xl md:text-4xl font-bold tracking-tight mb-6 text-hc-on-surface">
            ¿Listo para su{" "}
            <span className="italic text-hc-primary">transformación?</span>
          </h2>
          <Link
            href={`/${slug}/reservar`}
            className="border border-hc-primary text-hc-primary px-10 py-4 text-xs font-bold uppercase tracking-widest hover:bg-hc-primary hover:text-hc-on-primary transition-all duration-300 inline-block"
          >
            Reservar una Sesión
          </Link>
        </div>
      </main>
    </>
  );
}
