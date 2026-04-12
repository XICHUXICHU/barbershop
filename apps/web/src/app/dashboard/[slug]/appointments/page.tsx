"use client";

import { useEffect, useState } from "react";
import { useBarbershop } from "../barbershop-context";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

interface AppointmentRow {
  id: string;
  startTime: string;
  endTime: string;
  status: string;
  notes: string | null;
  customer: { name: string; phone: string };
  service: { name: string; priceAmount: number };
  barber: { name: string };
}

export default function AppointmentsPage() {
  const { barbershopId } = useBarbershop();
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [appointments, setAppointments] = useState<AppointmentRow[]>([]);
  const [loading, setLoading] = useState(false);

  function load() {
    if (!barbershopId || !date) return;
    setLoading(true);
    fetch(
      `${API_BASE}/appointments/barbershop/${barbershopId}?date=${date}`,
    )
      .then((r) => r.json())
      .then((data) => setAppointments(Array.isArray(data) ? data : []))
      .catch(() => setAppointments([]))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, [barbershopId, date]);

  async function handleCancel(id: string) {
    if (!confirm("¿Cancelar esta cita?")) return;
    await fetch(`${API_BASE}/appointments/${id}/cancel`, { method: "PATCH" });
    load();
  }

  function buildWhatsAppUrl(appointment: AppointmentRow) {
    const phone = appointment.customer?.phone?.replace(/\D/g, "") ?? "";
    const fullPhone = phone.startsWith("52") ? phone : `52${phone}`;
    const name = appointment.customer?.name ?? "cliente";
    const service = appointment.service?.name ?? "tu servicio";
    const time = appointment.startTime ?? "";
    const msg = `¡Hola ${name}! 👋 Tu cita para *${service}* a las *${time}* ha sido *confirmada* ✅. ¡Te esperamos!`;
    return `https://wa.me/${fullPhone}?text=${encodeURIComponent(msg)}`;
  }

  async function handleConfirm(id: string) {
    await fetch(`${API_BASE}/appointments/${id}/confirm`, { method: "PATCH" });
    const appointment = appointments.find((a) => a.id === id);
    if (appointment?.customer?.phone) {
      window.open(buildWhatsAppUrl(appointment), "_blank");
    }
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Citas</h1>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="bg-white shadow-sm border border-gray-200 rounded-lg px-4 py-2 text-gray-900"
        />
      </div>

      {loading ? (
        <p className="text-gray-500">Cargando...</p>
      ) : appointments.length === 0 ? (
        <div className="bg-white shadow-sm rounded-xl border border-gray-200 p-6 text-center text-gray-500">
          No hay citas para el {date}.
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
                <th className="px-4 py-3">Acciones</th>
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
                  <td className="px-4 py-3 space-x-2">
                    {a.status === "PENDING" && (
                      <button
                        onClick={() => handleConfirm(a.id)}
                        className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded hover:bg-blue-200"
                      >
                        Confirmar
                      </button>
                    )}
                    {a.status === "CONFIRMED" && a.customer?.phone && (
                      <a
                        href={buildWhatsAppUrl(a)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded hover:bg-green-200 inline-block"
                      >
                        📱 WhatsApp
                      </a>
                    )}
                    {(a.status === "PENDING" || a.status === "CONFIRMED") && (
                      <button
                        onClick={() => handleCancel(a.id)}
                        className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded hover:bg-red-200"
                      >
                        Cancelar
                      </button>
                    )}
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
