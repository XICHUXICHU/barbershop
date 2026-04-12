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
      {/* ═══ Header ═══ */}
      <header className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
        <div className="text-center md:text-left">
          <h1 className="font-headline text-6xl md:text-8xl font-bold text-hc-primary mb-6 tracking-tighter leading-none">
            {shop.name}
          </h1>
          <p className="font-body text-xl text-hc-on-surface-variant max-w-2xl leading-relaxed">
            Conozca a los curadores de su legado. Nuestros maestros barberos
            combinan tradiciones centenarias con precisión moderna para
            crear su estilo personal.
          </p>
        </div>
      </header>

      {/* ═══ Perfiles ═══ */}
      <main className="px-6 max-w-7xl mx-auto pb-24">
        {activeBarbers.length === 0 ? (
          <div className="text-center py-20">
            <AppIcon name="groups" className="text-hc-outline text-6xl mb-6" />
            <h2 className="font-headline text-3xl font-bold mb-4">
              Próximamente
            </h2>
            <p className="text-hc-on-surface-variant text-lg">
              {shop.name} está incorporando a su equipo de barberos.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {activeBarbers.map((barber, index) => {
              const isEven = index % 2 === 0;

              return (
                <section
                  key={barber.id}
                  className="lg:col-span-12 grid grid-cols-1 md:grid-cols-12 bg-hc-surface-container-low rounded-xl overflow-hidden shadow-2xl"
                >
                  {/* Image Block */}
                  <div
                    className={`md:col-span-5 h-[400px] md:h-auto relative overflow-hidden group ${
                      !isEven ? "order-1 md:order-2" : ""
                    }`}
                  >
                    {barber.avatarUrl ? (
                      <img
                        alt={barber.name}
                        className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700 ease-in-out"
                        src={barber.avatarUrl}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-hc-surface-container-high to-hc-surface-container-lowest">
                        <span className="text-[120px] font-headline text-hc-primary/30">
                          {barber.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 p-8 bg-gradient-to-t from-black/80 to-transparent w-full">
                      <span className="text-hc-primary text-sm font-bold tracking-[0.2em] uppercase">
                        Barbero Profesional
                      </span>
                      <h2 className="font-headline text-4xl text-hc-on-surface mt-2">
                        {barber.name}
                      </h2>
                    </div>
                  </div>

                  {/* Info Block */}
                  <div
                    className={`md:col-span-7 p-8 md:p-12 flex flex-col justify-center ${
                      !isEven ? "order-2 md:order-1" : ""
                    }`}
                  >
                    <div className="mb-8">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-hc-primary mb-4">
                        Especialidades
                      </h3>
                      <div className="flex flex-wrap gap-3">
                        <span className="px-4 py-1.5 rounded-full border border-hc-outline-variant/30 text-sm font-medium bg-hc-surface-container-high">
                          Cortes Clásicos
                        </span>
                        <span className="px-4 py-1.5 rounded-full border border-hc-outline-variant/30 text-sm font-medium bg-hc-surface-container-high">
                          Degradados
                        </span>
                        <span className="px-4 py-1.5 rounded-full border border-hc-outline-variant/30 text-sm font-medium bg-hc-surface-container-high">
                          Arreglo de Barba
                        </span>
                      </div>
                    </div>

                    <div className="mb-10">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-hc-primary mb-4">
                        Sobre {barber.name}
                      </h3>
                      <p className="text-hc-on-surface-variant font-body leading-relaxed text-lg italic">
                        &ldquo;Cada corte es una oportunidad de crear algo
                        único. Mi objetivo es que cada cliente salga sintiéndose
                        la mejor versión de sí mismo.&rdquo;
                      </p>
                    </div>

                    <div className="border-t border-hc-outline-variant/20 pt-8">
                      <Link
                        href={`/${slug}/reservar`}
                        className="bg-hc-primary text-hc-on-primary px-8 py-3 rounded-md font-label font-bold text-sm uppercase tracking-widest hover:bg-hc-primary-container transition-all inline-block"
                      >
                        Reservar con {barber.name}
                      </Link>
                    </div>
                  </div>
                </section>
              );
            })}
          </div>
        )}

        {/* ═══ CTA ═══ */}
        <div className="mt-24 p-12 bg-hc-surface-container-highest rounded-xl text-center border border-hc-outline-variant/10">
          <h2 className="font-headline text-4xl text-hc-primary mb-6">
            ¿Listo para su transformación?
          </h2>
          <p className="text-hc-on-surface-variant mb-10 max-w-xl mx-auto">
            Seleccione a su barbero preferido y asegure su lugar. Recomendamos
            reservar con anticipación para sesiones de fin de semana.
          </p>
          <Link
            href={`/${slug}/reservar`}
            className="bg-hc-primary text-hc-on-primary px-10 py-4 rounded-md font-bold text-lg hover:bg-hc-primary-container transition-all shadow-xl shadow-hc-primary/10 inline-block"
          >
            Reservar una Sesión
          </Link>
        </div>
      </main>
    </>
  );
}
