import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { apiFetch } from "@/lib/api";
import type { BarbershopDto } from "@barber/shared";
import { Navbar } from "./components/navbar";
import { Footer } from "./components/footer";

interface Props {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  try {
    const shop = await apiFetch<BarbershopDto>(`/barbershops/${slug}`);
    if (!shop.isActive) {
      return { title: 'Página Suspendida', description: 'La página de esta barbería se encuentra inactiva' };
    }
    return {
      title: `${shop.name} — Reserva tu cita`,
      description: `Agenda tu corte en ${shop.name}. Reserva online en segundos.`,
    };
  } catch {
    return { title: "Barbería no encontrada" };
  }
}

export default async function BarbershopLayout({ params, children }: Props) {
  const { slug } = await params;

  let shop: BarbershopDto;
  try {
    shop = await apiFetch<BarbershopDto>(`/barbershops/${slug}`);
  } catch {
    notFound();
  }

  return (
    <div className="bg-hc-background text-hc-on-surface font-body min-h-screen flex flex-col">
      {!shop.isActive ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-hc-on-surface-variant min-h-[70vh]">
          <h2 className="text-3xl font-heading text-hc-on-surface mb-4">Página Suspendida</h2>
          <p className="max-w-md mx-auto text-lg leading-relaxed">
            La página web de <strong>{shop.name}</strong> se encuentra temporalmente suspendida o inactiva. 
            Por favor, ponte en contacto con la barbería directamente o vuelve a intentarlo más tarde.
          </p>
        </div>
      ) : (
        <>
          <Navbar shopName={shop.name} slug={shop.slug} phone={shop.phone} />
          <main className="flex-1">{children}</main>
          <Footer shopName={shop.name} slug={shop.slug} address={shop.address} phone={shop.phone} />
        </>
      )}
    </div>
  );
}
