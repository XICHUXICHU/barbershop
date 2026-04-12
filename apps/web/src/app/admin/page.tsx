"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

interface Stats {
  totalBarbershops: number;
  totalBarbers: number;
  totalCustomers: number;
  totalAppointments: number;
  appointmentsToday: number;
}

interface ShopRow {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  _count: { barbers: number; services: number; appointments: number };
}

export default function AdminPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [shops, setShops] = useState<ShopRow[]>([]);

  useEffect(() => {
    fetch(`${API}/admin/stats`)
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {});
    fetch(`${API}/admin/barbershops`)
      .then((r) => r.json())
      .then((d) => setShops(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Panel de Administración</h1>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
        {[
          { label: "Barberías", value: stats?.totalBarbershops },
          { label: "Barberos", value: stats?.totalBarbers },
          { label: "Clientes", value: stats?.totalCustomers },
          { label: "Citas Totales", value: stats?.totalAppointments },
          { label: "Citas Hoy", value: stats?.appointmentsToday },
        ].map((c) => (
          <div
            key={c.label}
            className="bg-[white] border border-gray-200 rounded-xl p-5"
          >
            <p className="text-sm text-[gray-500]">{c.label}</p>
            <p className="text-3xl font-bold mt-1">
              {c.value ?? "—"}
            </p>
          </div>
        ))}
      </div>

      {/* Barbershops overview */}
      <h2 className="text-xl font-semibold mb-4">Barberías Registradas</h2>
      {shops.length === 0 ? (
        <p className="text-[gray-500]">
          No hay barberías registradas aún.
        </p>
      ) : (
        <div className="bg-[white] border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200 text-[gray-500] text-sm">
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">Barberos</th>
                <th className="px-4 py-3">Servicios</th>
                <th className="px-4 py-3">Citas</th>
                <th className="px-4 py-3">Registrada</th>
                <th className="px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {shops.map((s) => (
                <tr
                  key={s.id}
                  className="border-b border-gray-200 last:border-0"
                >
                  <td className="px-4 py-3 font-medium">{s.name}</td>
                  <td className="px-4 py-3 font-mono text-sm text-[gray-500]">
                    {s.slug}
                  </td>
                  <td className="px-4 py-3">{s._count.barbers}</td>
                  <td className="px-4 py-3">{s._count.services}</td>
                  <td className="px-4 py-3">{s._count.appointments}</td>
                  <td className="px-4 py-3 text-sm text-[gray-500]">
                    {new Date(s.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/${s.slug}`}
                      target="_blank"
                      className="text-xs text-[blue-600] hover:underline"
                    >
                      Ver página
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
