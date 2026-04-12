"use client";

import { useEffect, useState } from "react";
import { useBarbershop } from "./barbershop-context";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

interface AppointmentRow {
  id: string;
  startTime: string;
  endTime: string;
  status: string;
  customer: { name: string; phone: string };
  service: { name: string; priceAmount: number };
  barber: { name: string };
}

export default function DashboardPage() {
  const { barbershopId, barbershopName, loading: ctxLoading } = useBarbershop();
  const [appointments, setAppointments] = useState<AppointmentRow[]>([]);
  const [loading, setLoading] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (!barbershopId) return;
    setLoading(true);
    fetch(
      `${API_BASE}/appointments/barbershop/${barbershopId}?date=${today}`,
    )
      .then((r) => r.json())
      .then((data) => setAppointments(Array.isArray(data) ? data : []))
      .catch(() => setAppointments([]))
      .finally(() => setLoading(false));
  }, [barbershopId]);

  const confirmed = appointments.filter(
    (a) => a.status === "CONFIRMED" || a.status === "PENDING",
  );

  if (ctxLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Panel de Control</h1>
      <p className="text-gray-500 mb-8">{barbershopName}</p>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4 mb-10">
        <StatCard label="Citas Hoy" value={String(confirmed.length)} icon="📅" />
        <StatCard label="Pendientes" value={String(appointments.filter((a) => a.status === "PENDING").length)} icon="⏳" />
        <StatCard label="Completadas" value={String(appointments.filter((a) => a.status === "COMPLETED").length)} icon="✅" />
        <StatCard label="Canceladas" value={String(appointments.filter((a) => a.status === "CANCELLED").length)} icon="❌" />
      </div>

      {/* Today's appointments */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Citas de Hoy — {today}</h2>
        {loading ? (
          <p className="text-gray-500">Cargando...</p>
        ) : appointments.length === 0 ? (
          <div className="bg-white shadow-sm rounded-xl border border-gray-200 p-6 text-center text-gray-500">
            No hay citas para hoy.
          </div>
        ) : (
          <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500 text-sm">
                  <th className="px-4 py-3">Hora</th>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Servicio</th>
                  <th className="px-4 py-3">Barbero</th>
                  <th className="px-4 py-3">Estado</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((a) => (
                  <tr key={a.id} className="border-b border-gray-100 last:border-0">
                    <td className="px-4 py-3 font-mono text-sm">{a.startTime} – {a.endTime}</td>
                    <td className="px-4 py-3">
                      <div>{a.customer?.name}</div>
                      <div className="text-xs text-gray-500">{a.customer?.phone}</div>
                    </td>
                    <td className="px-4 py-3">{a.service?.name}</td>
                    <td className="px-4 py-3">{a.barber?.name}</td>
                    <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="bg-white shadow-sm border border-gray-200 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-500">{label}</span>
        <span className="text-2xl">{icon}</span>
      </div>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string }> = {
    PENDING: { label: "Pendiente", color: "bg-yellow-100 text-yellow-800" },
    CONFIRMED: { label: "Confirmada", color: "bg-blue-100 text-blue-800" },
    COMPLETED: { label: "Completada", color: "bg-green-100 text-green-800" },
    CANCELLED: { label: "Cancelada", color: "bg-red-100 text-red-800" },
    NO_SHOW: { label: "No asistió", color: "bg-gray-100 text-gray-800" },
  };
  const s = map[status] ?? { label: status, color: "bg-gray-100 text-gray-800" };
  return (
    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${s.color}`}>{s.label}</span>
  );
}
