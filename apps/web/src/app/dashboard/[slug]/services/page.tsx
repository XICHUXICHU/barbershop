"use client";

import { useEffect, useState, FormEvent } from "react";
import { useBarbershop } from "../barbershop-context";
import ImageUpload from "../components/image-upload";
import { useAuthFetch } from "../../../../lib/use-auth-fetch";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

interface ServiceRow {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  durationMinutes: number;
  priceAmount: number;
  priceCurrency: string;
  isActive: boolean;
}

interface EditState {
  name: string;
  description: string;
  durationMinutes: number;
  priceAmount: number;
}

export default function ServicesPage() {
  const { barbershopId } = useBarbershop();
  const authFetch = useAuthFetch();
  const [services, setServices] = useState<ServiceRow[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editState, setEditState] = useState<EditState | null>(null);
  const [editSaving, setEditSaving] = useState(false);

  function load() {
    if (!barbershopId) return;
    fetch(`${API}/services/barbershop/${barbershopId}`)
      .then((r) => r.json())
      .then((d) => setServices(Array.isArray(d) ? d : []))
      .catch(() => {});
  }

  useEffect(() => {
    load();
  }, [barbershopId]);

  function startEdit(s: ServiceRow) {
    setEditingId(s.id);
    setEditState({
      name: s.name,
      description: s.description ?? "",
      durationMinutes: s.durationMinutes,
      priceAmount: s.priceAmount,
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditState(null);
  }

  async function saveEdit(id: string) {
    if (!editState) return;
    setEditSaving(true);
    await authFetch(`/services/${id}`, {
      method: "PATCH",
      body: JSON.stringify({
        name: editState.name,
        description: editState.description || null,
        durationMinutes: editState.durationMinutes,
        priceAmount: editState.priceAmount,
      }),
    });
    setEditSaving(false);
    cancelEdit();
    load();
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    await authFetch(`/services`, {
      method: "POST",
      body: JSON.stringify({
        barbershopId,
        name: fd.get("name"),
        description: fd.get("description") || null,
        imageUrl: newImageUrl,
        durationMinutes: Number(fd.get("duration")),
        priceAmount: Number(fd.get("price")),
        priceCurrency: "MXN",
      }),
    });
    setSaving(false);
    setShowForm(false);
    setNewImageUrl(null);
    load();
  }

  async function handleImageChange(serviceId: string, file: File) {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${API}/upload/image`, { method: "POST", body: formData });
    if (!res.ok) return;
    const data: { url: string } = await res.json();
    await authFetch(`/services/${serviceId}`, {
      method: "PATCH",
      body: JSON.stringify({ imageUrl: data.url }),
    });
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Servicios</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-5 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
        >
          {showForm ? "Cancelar" : "+ Nuevo Servicio"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-sm border border-gray-200 rounded-xl p-6 mb-6 grid grid-cols-2 gap-4"
        >
          <div className="col-span-2">
            <ImageUpload
              label="Foto del Servicio"
              variant="cover"
              currentUrl={newImageUrl}
              onUploaded={(url) => setNewImageUrl(url)}
            />
          </div>
          <label className="block col-span-2">
            <span className="text-sm text-gray-500">Nombre</span>
            <input name="name" required className="w-full mt-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900" placeholder="Corte clásico" />
          </label>
          <label className="block col-span-2">
            <span className="text-sm text-gray-500">Descripción</span>
            <input name="description" className="w-full mt-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900" placeholder="Incluye lavado y secado" />
          </label>
          <label className="block">
            <span className="text-sm text-gray-500">Duración (min)</span>
            <input name="duration" type="number" required min={5} className="w-full mt-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900" placeholder="30" />
          </label>
          <label className="block">
            <span className="text-sm text-gray-500">Precio (MXN)</span>
            <input name="price" type="number" required min={0} step={0.01} className="w-full mt-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900" placeholder="25.00" />
          </label>
          <div className="col-span-2">
            <button type="submit" disabled={saving} className="px-5 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors disabled:opacity-50">
              {saving ? "Guardando..." : "Guardar Servicio"}
            </button>
          </div>
        </form>
      )}

      {services.length === 0 ? (
        <div className="bg-white shadow-sm rounded-xl border border-gray-200 p-6 text-center text-gray-500">
          <p>Aún no hay servicios registrados.</p>
          <p className="text-sm mt-2">Agrega tus cortes, afeitados y paquetes con su precio y duración.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => {
            const isEditing = editingId === s.id;

            return (
              <div key={s.id} className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
                {/* Image section */}
                {s.imageUrl ? (
                  <div className="relative h-36 overflow-hidden bg-gray-50 p-2">
                    <img src={s.imageUrl} alt={s.name} className="w-full h-full object-contain" />
                    <label className="absolute top-2 right-2 cursor-pointer bg-black/50 hover:bg-black/70 text-white text-xs px-2 py-1 rounded transition-colors">
                      Cambiar
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/avif"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageChange(s.id, file);
                        }}
                      />
                    </label>
                  </div>
                ) : (
                  <label className="h-36 flex flex-col items-center justify-center bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors">
                    <svg className="h-8 w-8 text-gray-300 mb-1" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                    </svg>
                    <span className="text-xs text-gray-400">Agregar foto</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/avif"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageChange(s.id, file);
                      }}
                    />
                  </label>
                )}

                {/* Content section */}
                <div className="p-5">
                  {isEditing && editState ? (
                    <div className="space-y-3">
                      <label className="block">
                        <span className="text-xs text-gray-500">Nombre</span>
                        <input
                          value={editState.name}
                          onChange={(e) => setEditState({ ...editState, name: e.target.value })}
                          className="w-full mt-1 bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-gray-900 text-sm"
                        />
                      </label>
                      <label className="block">
                        <span className="text-xs text-gray-500">Descripción</span>
                        <input
                          value={editState.description}
                          onChange={(e) => setEditState({ ...editState, description: e.target.value })}
                          className="w-full mt-1 bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-gray-900 text-sm"
                        />
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <label className="block">
                          <span className="text-xs text-gray-500">Precio (MXN)</span>
                          <input
                            type="number"
                            min={0}
                            step={0.01}
                            value={editState.priceAmount}
                            onChange={(e) => setEditState({ ...editState, priceAmount: Number(e.target.value) })}
                            className="w-full mt-1 bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-gray-900 text-sm"
                          />
                        </label>
                        <label className="block">
                          <span className="text-xs text-gray-500">Duración (min)</span>
                          <input
                            type="number"
                            min={5}
                            value={editState.durationMinutes}
                            onChange={(e) => setEditState({ ...editState, durationMinutes: Number(e.target.value) })}
                            className="w-full mt-1 bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-gray-900 text-sm"
                          />
                        </label>
                      </div>
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() => saveEdit(s.id)}
                          disabled={editSaving}
                          className="px-4 py-1.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                          {editSaving ? "Guardando..." : "Guardar"}
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="px-4 py-1.5 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between">
                        <h3 className="font-semibold text-lg">{s.name}</h3>
                        <button
                          onClick={() => startEdit(s)}
                          className="text-gray-400 hover:text-blue-600 transition-colors ml-2 shrink-0"
                          title="Editar servicio"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                          </svg>
                        </button>
                      </div>
                      {s.description && <p className="text-sm text-gray-500 mt-1">{s.description}</p>}
                      <div className="flex gap-4 mt-3 text-sm">
                        <span className="text-blue-600 font-bold">${s.priceAmount} MXN</span>
                        <span className="text-gray-500">{s.durationMinutes} min</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
