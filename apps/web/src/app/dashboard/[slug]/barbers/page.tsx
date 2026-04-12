"use client";

import { useEffect, useState, FormEvent } from "react";
import { useBarbershop } from "../barbershop-context";
import ImageUpload from "../components/image-upload";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

interface BarberRow {
  id: string;
  name: string;
  avatarUrl: string | null;
  isActive: boolean;
}

export default function BarbersPage() {
  const { barbershopId } = useBarbershop();
  const [barbers, setBarbers] = useState<BarberRow[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newAvatarUrl, setNewAvatarUrl] = useState<string | null>(null);

  function load() {
    if (!barbershopId) return;
    fetch(`${API}/barbers/barbershop/${barbershopId}`)
      .then((r) => r.json())
      .then((d) => setBarbers(Array.isArray(d) ? d : []))
      .catch(() => {});
  }

  useEffect(() => {
    load();
  }, [barbershopId]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    await fetch(`${API}/barbers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        barbershopId,
        name: fd.get("name"),
        avatarUrl: newAvatarUrl,
      }),
    });
    setSaving(false);
    setShowForm(false);
    setNewAvatarUrl(null);
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Barberos</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-5 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
        >
          {showForm ? "Cancelar" : "+ Agregar Barbero"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-sm border border-gray-200 rounded-xl p-6 mb-6 space-y-4"
        >
          <ImageUpload
            label="Foto del Barbero"
            variant="avatar"
            currentUrl={newAvatarUrl}
            onUploaded={(url) => setNewAvatarUrl(url)}
          />
          <label className="block">
            <span className="text-sm text-gray-500">Nombre</span>
            <input name="name" required className="w-full mt-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900" placeholder="Carlos Pérez" />
          </label>
          <button type="submit" disabled={saving} className="px-5 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors disabled:opacity-50">
            {saving ? "Guardando..." : "Guardar Barbero"}
          </button>
        </form>
      )}

      {barbers.length === 0 ? (
        <div className="bg-white shadow-sm rounded-xl border border-gray-200 p-6 text-center text-gray-500">
          <p>Aún no hay barberos registrados.</p>
          <p className="text-sm mt-2">Registra a los profesionales de tu barbería para asignarles citas.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {barbers.map((b) => (
            <div key={b.id} className="bg-white shadow-sm border border-gray-200 rounded-xl p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 text-lg font-bold shrink-0 overflow-hidden">
                {b.avatarUrl ? (
                  <img src={b.avatarUrl} alt={b.name} className="w-full h-full object-cover" />
                ) : (
                  b.name.charAt(0).toUpperCase()
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold">{b.name}</h3>
                <span className={`text-xs ${b.isActive ? "text-green-600" : "text-red-500"}`}>
                  {b.isActive ? "Activo" : "Inactivo"}
                </span>
              </div>
              <label className="cursor-pointer text-xs text-blue-600 hover:text-blue-800 whitespace-nowrap">
                Cambiar foto
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const formData = new FormData();
                    formData.append("file", file);
                    const res = await fetch(`${API}/upload/image`, {
                      method: "POST",
                      body: formData,
                    });
                    if (!res.ok) return;
                    const data: { url: string } = await res.json();
                    await fetch(`${API}/barbers/${b.id}`, {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ avatarUrl: data.url }),
                    });
                    load();
                  }}
                />
              </label>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
