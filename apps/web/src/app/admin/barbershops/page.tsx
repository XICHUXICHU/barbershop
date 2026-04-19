"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

interface ShopRow {
  id: string;
  name: string;
  slug: string;
  phone: string;
  address: string;
  isActive: boolean;
  createdAt: string;
  _count: { barbers: number; services: number; appointments: number };
}

export default function AdminBarbershopsPage() {
  const [shops, setShops] = useState<ShopRow[]>([]);

  const loadShops = () => {
    fetch(`${API}/admin/barbershops`)
      .then((r) => r.json())
      .then((d) => setShops(Array.isArray(d) ? d : []))
      .catch(() => {});
  };

  useEffect(() => {
    loadShops();
  }, []);

  const toggleActive = async (id: string, currentStatus: boolean) => {
    const isConfirm = window.confirm(
      `¿Estás seguro de que deseas ${
        currentStatus ? "suspender" : "activar"
      } esta barbería?`
    );
    if (!isConfirm) return;

    try {
      const res = await fetch(`${API}/barbershops/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      if (res.ok) {
        loadShops();
      } else {
        alert("Ocurrió un error al cambiar el estado.");
      }
    } catch (e) {
      alert("Error de conexión");
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Barberías</h1>

      {shops.length === 0 ? (
        <p className="text-gray-500">
          No hay barberías registradas.
        </p>
      ) : (
        <div className="space-y-4">
          {shops.map((s) => (
            <div
              key={s.id}
              className="bg-white border border-gray-200 rounded-xl p-6"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    {s.name}
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        s.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {s.isActive ? "Activa" : "Suspendida"}
                    </span>
                  </h3>
                  <p className="text-sm text-gray-500">
                    /{s.slug} · {s.phone || "Sin teléfono"} ·{" "}
                    {s.address || "Sin dirección"}
                  </p>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <button
                    onClick={() => toggleActive(s.id, s.isActive)}
                    className={`text-sm px-3 py-1.5 rounded font-medium transition-colors ${
                      s.isActive
                        ? "bg-red-50 text-red-600 hover:bg-red-100"
                        : "bg-green-50 text-green-600 hover:bg-green-100"
                    }`}
                  >
                    {s.isActive ? "Suspender" : "Activar"}
                  </button>
                  <Link
                    href={`/${s.slug}`}
                    target="_blank"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Ver página →
                  </Link>
                </div>
              </div>
              <div className="flex gap-6 mt-4 text-sm">
                <div>
                  <span className="text-gray-500">Barberos:</span>{" "}
                  <span className="font-medium">{s._count.barbers}</span>
                </div>
                <div>
                  <span className="text-gray-500">Servicios:</span>{" "}
                  <span className="font-medium">{s._count.services}</span>
                </div>
                <div>
                  <span className="text-gray-500">Citas:</span>{" "}
                  <span className="font-medium">{s._count.appointments}</span>
                </div>
                <div>
                  <span className="text-gray-500">Registrada:</span>{" "}
                  <span className="font-medium">
                    {new Date(s.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
