"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

interface ShopSummary {
  id: string;
  name: string;
  slug: string;
  address: string;
  phone: string;
}

export default function DashboardIndexPage() {
  const { user, isLoaded } = useUser();
  const [shops, setShops] = useState<ShopSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded || !user) return;
    fetch(`${API_BASE}/barbershops/by-owner/${user.id}`)
      .then((r) => r.json())
      .then((data) => setShops(Array.isArray(data) ? data : []))
      .catch(() => setShops([]))
      .finally(() => setLoading(false));
  }, [isLoaded, user]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">
            <span className="text-blue-600">Barber</span>Book
          </h1>
          <a
            href="/register"
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Nueva Barbería
          </a>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Mis Barberías</h2>
        <p className="text-gray-500 mb-8">
          Selecciona una barbería para acceder a su panel de control.
        </p>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : shops.length === 0 ? (
          <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-10 text-center">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">💈</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No tienes barberías aún</h3>
            <p className="text-gray-500 mb-6">Registra tu primera barbería y empieza a recibir citas online.</p>
            <a
              href="/register"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors"
            >
              Registrar mi Barbería
            </a>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {shops.map((shop) => (
              <a
                key={shop.id}
                href={`/dashboard/${shop.slug}`}
                className="block bg-white border border-gray-200 shadow-sm rounded-2xl p-6 hover:border-blue-400 hover:shadow-md transition-all group"
              >
                <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 text-2xl font-bold mb-4 group-hover:bg-blue-100 transition-colors">
                  {shop.name.charAt(0).toUpperCase()}
                </div>
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {shop.name}
                </h3>
                <p className="text-sm text-gray-500 mt-1 truncate">{shop.address}</p>
                <div className="mt-4 text-sm text-blue-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  Abrir Panel →
                </div>
              </a>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
