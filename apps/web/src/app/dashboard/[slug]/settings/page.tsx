"use client";

import { useEffect, useState, FormEvent } from "react";
import { useBarbershop } from "../barbershop-context";
import ImageUpload from "../components/image-upload";
import { useAuthFetch } from "../../../../lib/use-auth-fetch";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

const DAY_NAMES = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

interface ShopInfo {
  name: string;
  phone: string;
  address: string;
  logoUrl: string | null;
  coverUrl: string | null;
}

interface DaySchedule {
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isOpen: boolean;
}

export default function SettingsPage() {
  const { barbershopId, barbershopName } = useBarbershop();
  const authFetch = useAuthFetch();
  const [info, setInfo] = useState<ShopInfo>({
    name: "",
    phone: "",
    address: "",
    logoUrl: null,
    coverUrl: null,
  });
  const DEFAULT_ORDER = [1, 2, 3, 4, 5, 6, 0];
  const [schedule, setSchedule] = useState<DaySchedule[]>(
    DEFAULT_ORDER.map((d) => ({
      dayOfWeek: d,
      openTime: "09:00",
      closeTime: "19:00",
      isOpen: d !== 0,
    })),
  );
  const [savingInfo, setSavingInfo] = useState(false);
  const [savingSchedule, setSavingSchedule] = useState(false);
  const [infoMsg, setInfoMsg] = useState("");
  const [schedMsg, setSchedMsg] = useState("");

  useEffect(() => {
    if (!barbershopId) return;
    fetch(`${API}/barbershops/by-id/${barbershopId}`)
      .then((r) => r.json())
      .then((d) =>
        setInfo({
          name: d.name ?? "",
          phone: d.phone ?? "",
          address: d.address ?? "",
          logoUrl: d.logoUrl ?? null,
          coverUrl: d.coverUrl ?? null,
        }),
      )
      .catch(() => {});

    fetch(`${API}/schedules/barbershop/${barbershopId}`)
      .then((r) => r.json())
      .then((rows: DaySchedule[]) => {
        if (Array.isArray(rows) && rows.length > 0) {
          setSchedule((prev) =>
            prev.map((d) => {
              const found = rows.find((r) => r.dayOfWeek === d.dayOfWeek);
              return found ?? d;
            }),
          );
        }
      })
      .catch(() => {});
  }, [barbershopId]);

  async function saveInfo(e: FormEvent) {
    e.preventDefault();
    setSavingInfo(true);
    setInfoMsg("");
    await authFetch(`/barbershops/${barbershopId}`, {
      method: "PATCH",
      body: JSON.stringify(info),
    });
    setSavingInfo(false);
    setInfoMsg("¡Guardado!");
    setTimeout(() => setInfoMsg(""), 2000);
  }

  async function saveSchedule() {
    setSavingSchedule(true);
    setSchedMsg("");
    for (const day of schedule) {
      await authFetch(`/schedules`, {
        method: "PUT",
        body: JSON.stringify({ barbershopId, ...day }),
      });
    }
    setSavingSchedule(false);
    setSchedMsg("¡Horario guardado!");
    setTimeout(() => setSchedMsg(""), 2000);
  }

  function updateDay(idx: number, partial: Partial<DaySchedule>) {
    setSchedule((prev) =>
      prev.map((d, i) => (i === idx ? { ...d, ...partial } : d)),
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Configuración</h1>
      <p className="text-gray-500 mb-8">{barbershopName}</p>

      <div className="space-y-6 max-w-xl">
        <form
          onSubmit={saveInfo}
          className="bg-white shadow-sm border border-gray-200 rounded-xl p-6 space-y-4"
        >
          <h2 className="text-lg font-semibold">Datos de tu Barbería</h2>

          <div className="space-y-4">
            <ImageUpload
              label="Foto de Portada"
              variant="cover"
              currentUrl={info.coverUrl}
              onUploaded={(url) => {
                setInfo((prev) => ({ ...prev, coverUrl: url }));
                // Auto-save cover
                authFetch(`/barbershops/${barbershopId}`, {
                  method: "PATCH",
                  body: JSON.stringify({ coverUrl: url }),
                });
              }}
            />
            <ImageUpload
              label="Logo"
              variant="logo"
              currentUrl={info.logoUrl}
              onUploaded={(url) => {
                setInfo((prev) => ({ ...prev, logoUrl: url }));
                // Auto-save logo
                authFetch(`/barbershops/${barbershopId}`, {
                  method: "PATCH",
                  body: JSON.stringify({ logoUrl: url }),
                });
              }}
            />
          </div>

          <label className="block">
            <span className="text-sm text-gray-500">Nombre</span>
            <input type="text" value={info.name} onChange={(e) => setInfo({ ...info, name: e.target.value })} className="w-full mt-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900" />
          </label>
          <label className="block">
            <span className="text-sm text-gray-500">Teléfono</span>
            <input type="tel" value={info.phone} onChange={(e) => setInfo({ ...info, phone: e.target.value })} className="w-full mt-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900" />
          </label>
          <label className="block">
            <span className="text-sm text-gray-500">Dirección</span>
            <input type="text" value={info.address} onChange={(e) => setInfo({ ...info, address: e.target.value })} className="w-full mt-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900" />
          </label>
          <div className="flex items-center gap-3">
            <button type="submit" disabled={savingInfo} className="px-5 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors disabled:opacity-50">
              {savingInfo ? "Guardando..." : "Guardar Cambios"}
            </button>
            {infoMsg && <span className="text-green-600 text-sm">{infoMsg}</span>}
          </div>
        </form>

        <section className="bg-white shadow-sm border border-gray-200 rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold">Horario de Atención</h2>
          <p className="text-sm text-gray-500">Configura los días y horas en que atiendes.</p>
          {schedule.map((day, idx) => (
            <div key={day.dayOfWeek} className="flex items-center gap-4">
              <label className="flex items-center gap-2 w-28">
                <input
                  type="checkbox"
                  checked={day.isOpen}
                  onChange={(e) => updateDay(idx, { isOpen: e.target.checked })}
                  className="accent-blue-600"
                />
                <span className="text-sm">{DAY_NAMES[day.dayOfWeek]}</span>
              </label>
              <input type="time" value={day.openTime} disabled={!day.isOpen} onChange={(e) => updateDay(idx, { openTime: e.target.value })} className="bg-white border border-gray-200 rounded-lg px-2 py-1 text-gray-900 text-sm disabled:opacity-40" />
              <span className="text-gray-500">—</span>
              <input type="time" value={day.closeTime} disabled={!day.isOpen} onChange={(e) => updateDay(idx, { closeTime: e.target.value })} className="bg-white border border-gray-200 rounded-lg px-2 py-1 text-gray-900 text-sm disabled:opacity-40" />
            </div>
          ))}
          <div className="flex items-center gap-3">
            <button onClick={saveSchedule} disabled={savingSchedule} className="px-5 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors disabled:opacity-50">
              {savingSchedule ? "Guardando..." : "Guardar Horario"}
            </button>
            {schedMsg && <span className="text-green-600 text-sm">{schedMsg}</span>}
          </div>
        </section>
      </div>
    </div>
  );
}
