"use client";

import { useEffect, useState, useCallback } from "react";
import { useBarbershop } from "../barbershop-context";
import { useAuthFetch } from "../../../../lib/use-auth-fetch";
import ImageUpload from "../components/image-upload";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
const MAX_PHOTOS = 20;

interface GalleryPhoto {
  id: string;
  imageUrl: string;
  caption: string | null;
  createdAt: string;
}

export default function GalleryPage() {
  const { barbershopId, barbershopName } = useBarbershop();
  const authFetch = useAuthFetch();

  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<GalleryPhoto | null>(null);

  const fetchPhotos = useCallback(() => {
    if (!barbershopId) return;
    fetch(`${API}/gallery/barbershop/${barbershopId}`)
      .then((r) => r.json())
      .then((data) => setPhotos(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [barbershopId]);

  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  async function handlePhotoUploaded(imageUrl: string) {
    setUploading(true);
    try {
      const res = await authFetch(`/gallery/barbershop/${barbershopId}`, {
        method: "POST",
        body: JSON.stringify({ imageUrl, caption: caption || undefined }),
      });
      if (res.ok) {
        setCaption("");
        fetchPhotos();
      } else {
        const body = await res.json().catch(() => ({}));
        alert(body.message ?? "Error al guardar la foto");
      }
    } catch {
      alert("Error al guardar");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar esta foto?")) return;
    setDeleting(id);
    try {
      await authFetch(`/gallery/${id}`, { method: "DELETE" });
      setPhotos((prev) => prev.filter((p) => p.id !== id));
      if (lightbox?.id === id) setLightbox(null);
    } catch {
      alert("Error al eliminar");
    } finally {
      setDeleting(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-1">Galería de Trabajos</h1>
      <p className="text-gray-500 mb-8">{barbershopName}</p>

      {/* Upload section */}
      <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm mb-8 max-w-xl">
        <h2 className="text-lg font-semibold mb-1">Subir Foto</h2>
        <p className="text-sm text-gray-500 mb-4">
          {photos.length} / {MAX_PHOTOS} fotos · Muestra tus mejores cortes y trabajos a tus clientes.
        </p>

        {photos.length >= MAX_PHOTOS ? (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-amber-800 text-sm">
            Has alcanzado el límite de {MAX_PHOTOS} fotos. Elimina alguna para subir más.
          </div>
        ) : (
          <div className="space-y-3">
            <label className="block">
              <span className="text-sm text-gray-500">Descripción (opcional)</span>
              <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Ej: Fade clásico con diseño"
                maxLength={100}
                className="w-full mt-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900"
              />
            </label>
            <ImageUpload
              label="Foto del trabajo"
              variant="cover"
              currentUrl={null}
              onUploaded={handlePhotoUploaded}
            />
            {uploading && (
              <p className="text-sm text-blue-600">Guardando en galería...</p>
            )}
          </div>
        )}
      </section>

      {/* Gallery grid */}
      {photos.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">📷</p>
          <p className="text-lg font-medium">Tu galería está vacía</p>
          <p className="text-sm">Sube fotos de tus mejores trabajos para atraer más clientes.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="group relative aspect-square rounded-xl overflow-hidden bg-gray-100 cursor-pointer"
              onClick={() => setLightbox(photo)}
            >
              <img
                src={photo.imageUrl}
                alt={photo.caption || "Foto de galería"}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-end p-3">
                {photo.caption && (
                  <p className="text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity truncate">
                    {photo.caption}
                  </p>
                )}
              </div>
              {/* Delete button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(photo.id);
                }}
                disabled={deleting === photo.id}
                className="absolute top-2 right-2 bg-red-600 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700 disabled:opacity-50"
              >
                {deleting === photo.id ? "…" : "✕"}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] rounded-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={lightbox.imageUrl}
              alt={lightbox.caption || "Foto"}
              className="max-w-full max-h-[85vh] object-contain"
            />
            {lightbox.caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-4 text-sm">
                {lightbox.caption}
              </div>
            )}
            <button
              onClick={() => setLightbox(null)}
              className="absolute top-3 right-3 bg-white/20 text-white w-8 h-8 rounded-full flex items-center justify-center text-lg hover:bg-white/40 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
