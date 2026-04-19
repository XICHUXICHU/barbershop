"use client";

import { useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

interface AppointmentRow {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  barbershop: { name: string; slug: string };
  barber: { name: string };
  service: { name: string; priceAmount: number };
  customer: { name: string; phone: string };
}

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState<AppointmentRow[]>([]);

  useEffect(() => {
    fetch(`${API}/admin/appointments/recent`)
      .then((r) => r.json())
      .then((d) => setAppointments(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, []);

  const statusMap: Record<string, { label: string; color: string }> = {
    PENDING: { label: "Pendiente", color: "bg-yellow-600/30 text-yellow-300" },
    CONFIRMED: { label: "Confirmada", color: "bg-blue-600/30 text-blue-300" },
    COMPLETED: { label: "Completada", color: "bg-green-600/30 text-green-300" },
    CANCELLED: { label: "Cancelada", color: "bg-red-600/30 text-red-300" },
    NO_SHOW: { label: "No asistió", color: "bg-gray-600/30 text-gray-600" },
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Citas Recientes</h1>

      {appointments.length === 0 ? (
        <p className="text-gray-500">
          No hay citas registradas aún.
        </p>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-gray-500">
                <th className="px-4 py-3">Barbería</th>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Hora</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Servicio</th>
                <th className="px-4 py-3">Barbero</th>
                <th className="px-4 py-3">Precio</th>
                <th className="px-4 py-3">Estado</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((a) => {
                const s = statusMap[a.status] ?? {
                  label: a.status,
                  color: "bg-gray-600/30 text-gray-600",
                };
                return (
                  <tr
                    key={a.id}
                    className="border-b border-gray-200 last:border-0"
                  >
                    <td className="px-4 py-3 font-medium">
                      {a.barbershop?.name}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {a.date?.split("T")[0]}
                    </td>
                    <td className="px-4 py-3 font-mono">
                      {a.startTime} – {a.endTime}
                    </td>
                    <td className="px-4 py-3">
                      <div>{a.customer?.name}</div>
                      <div className="text-xs text-gray-500">
                        {a.customer?.phone}
                      </div>
                    </td>
                    <td className="px-4 py-3">{a.service?.name}</td>
                    <td className="px-4 py-3">{a.barber?.name}</td>
                    <td className="px-4 py-3 text-blue-600">
                      ${a.service?.priceAmount?.toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-lg text-xs font-medium ${s.color}`}
                      >
                        {s.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
