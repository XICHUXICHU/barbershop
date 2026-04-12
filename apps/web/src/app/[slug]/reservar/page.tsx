import { notFound } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { AppIcon } from "@/components/app-icon";
import type { BarbershopDto, ServiceDto, BarberDto } from "@barber/shared";
import { BookingWizard } from "./booking-wizard";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ReservarPage({ params }: Props) {
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

  const activeServices = services.filter((s) => s.isActive);
  const activeBarbers = barbers.filter((b) => b.isActive);

  return (
    <>
      {/* ═══ Header ═══ */}
      <header className="pt-32 pb-12 px-6 max-w-5xl mx-auto">
        <div className="text-center md:text-left">
          <h1 className="text-5xl md:text-7xl font-bold font-headline text-hc-on-surface mb-4 tracking-tighter">
            Sesiones de{" "}
            <span className="text-hc-primary italic">{shop.name}</span>
          </h1>
          <p className="text-hc-on-surface-variant font-light max-w-2xl text-lg">
            Creando excelencia a través de la tradición. Asegura tu lugar con
            nuestros maestros barberos.
          </p>
        </div>
      </header>

      {/* ═══ Booking Wizard ═══ */}
      <main className="px-6 max-w-5xl mx-auto pb-24">
        {activeServices.length === 0 || activeBarbers.length === 0 ? (
          <div className="text-center py-20 bg-hc-surface-container-low rounded-xl border border-hc-outline-variant/10">
            <AppIcon name="calendar_month" className="text-hc-outline text-6xl mb-6" />
            <h2 className="font-headline text-3xl font-bold mb-4">
              Reservas Próximamente
            </h2>
            <p className="text-hc-on-surface-variant text-lg max-w-md mx-auto">
              {shop.name} está preparando sus servicios y horarios para
              reservas.
            </p>
          </div>
        ) : (
          <BookingWizard
            barbershopId={shop.id}
            services={activeServices}
            barbers={activeBarbers}
          />
        )}
      </main>
    </>
  );
}
