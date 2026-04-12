"use client";

import { use } from "react";
import { BarbershopProvider, useBarbershop } from "./barbershop-context";

export default function DashboardSlugLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);

  return (
    <BarbershopProvider slug={slug}>
      <div className="min-h-screen flex bg-gray-50 text-gray-900">
        <Sidebar />
        <main className="flex-1 p-6 md:p-10">{children}</main>
      </div>
    </BarbershopProvider>
  );
}

function Sidebar() {
  const { barbershopName, barbershopSlug } = useBarbershop();

  return (
    <aside className="w-64 bg-white shadow-sm border-r border-gray-200 p-6 hidden md:flex flex-col">
      <h2 className="text-xl font-bold mb-2">
        <a href="/">
          <span className="text-blue-600">Barber</span>Book
        </a>
      </h2>

      {/* Current barbershop name */}
      <div className="mb-6 px-3 py-2 bg-blue-50 border border-blue-100 rounded-lg">
        <p className="text-sm font-semibold text-gray-900 truncate">{barbershopName || "Cargando..."}</p>
        <p className="text-xs text-gray-500 truncate">/{barbershopSlug}</p>
      </div>

      <nav className="flex flex-col gap-1">
        <NavItem href={`/dashboard/${barbershopSlug}`} label="Panel" icon="📊" />
        <NavItem href={`/dashboard/${barbershopSlug}/appointments`} label="Citas" icon="📅" />
        <NavItem href={`/dashboard/${barbershopSlug}/services`} label="Servicios" icon="✂️" />
        <NavItem href={`/dashboard/${barbershopSlug}/barbers`} label="Barberos" icon="👤" />
        <NavItem href={`/dashboard/${barbershopSlug}/settings`} label="Configuración" icon="⚙️" />
      </nav>

      <div className="mt-auto pt-6 border-t border-gray-200 space-y-2">
        <a
          href={`/${barbershopSlug}`}
          target="_blank"
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900"
        >
          🌐 Ver página pública
        </a>
        <a
          href="/dashboard"
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600"
        >
          ← Mis Barberías
        </a>
        <a
          href="/admin"
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600"
        >
          🛡️ Super Admin
        </a>
      </div>
    </aside>
  );
}

function NavItem({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: string;
}) {
  return (
    <a
      href={href}
      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-gray-500 hover:text-gray-900"
    >
      <span>{icon}</span>
      <span>{label}</span>
    </a>
  );
}
