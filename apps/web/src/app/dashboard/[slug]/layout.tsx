"use client";

import { use, useState } from "react";
import { UserButton, useUser } from "@clerk/nextjs";
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
        <div className="flex-1 flex flex-col">
          <MobileHeader />
          <main className="flex-1 p-6 md:p-10">{children}</main>
        </div>
      </div>
    </BarbershopProvider>
  );
}

function MobileHeader() {
  const { barbershopName, barbershopSlug } = useBarbershop();
  const [open, setOpen] = useState(false);
  const { user } = useUser();
  const isAdmin = (user?.publicMetadata as { role?: string })?.role === "admin";

  return (
    <>
      <header className="md:hidden flex items-center justify-between bg-white border-b border-gray-200 px-4 py-3">
        <button onClick={() => setOpen(true)} className="text-gray-700">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <span className="font-semibold text-sm truncate">{barbershopName}</span>
        <UserButton />
      </header>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <aside className="relative w-64 bg-white shadow-lg p-6 flex flex-col z-10">
            <button onClick={() => setOpen(false)} className="self-end mb-4 text-gray-500">
              ✕
            </button>
            <h2 className="text-xl font-bold mb-2">
              <a href="/">
                <span className="text-blue-600">Barber</span>Book
              </a>
            </h2>
            <div className="mb-6 px-3 py-2 bg-blue-50 border border-blue-100 rounded-lg">
              <p className="text-sm font-semibold text-gray-900 truncate">{barbershopName || "Cargando..."}</p>
              <p className="text-xs text-gray-500 truncate">/{barbershopSlug}</p>
            </div>
            <nav className="flex flex-col gap-1" onClick={() => setOpen(false)}>
              <NavItem href={`/dashboard/${barbershopSlug}`} label="Panel" icon="📊" />
              <NavItem href={`/dashboard/${barbershopSlug}/appointments`} label="Citas" icon="📅" />
              <NavItem href={`/dashboard/${barbershopSlug}/services`} label="Servicios" icon="✂️" />
              <NavItem href={`/dashboard/${barbershopSlug}/barbers`} label="Barberos" icon="👤" />
              <NavItem href={`/dashboard/${barbershopSlug}/settings`} label="Configuración" icon="⚙️" />
            </nav>
            <div className="mt-auto pt-6 border-t border-gray-200 space-y-2">
              <a href={`/${barbershopSlug}`} target="_blank" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900">🌐 Ver página pública</a>
              <a href="/dashboard" className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600">← Mis Barberías</a>
              {isAdmin && <a href="/admin" className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600">🛡️ Super Admin</a>}
            </div>
          </aside>
        </div>
      )}
    </>
  );
}

function Sidebar() {
  const { barbershopName, barbershopSlug } = useBarbershop();
  const { user } = useUser();
  const isAdmin = (user?.publicMetadata as { role?: string })?.role === "admin";

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
        {isAdmin && (
          <a
            href="/admin"
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600"
          >
            🛡️ Super Admin
          </a>
        )}
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200">
        <UserButton showName />
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
