"use client";

import { useEffect, useState, useCallback, useRef, DragEvent, ChangeEvent } from "react";
import { useBarbershop } from "../barbershop-context";
import { useAuthFetch } from "../../../../lib/use-auth-fetch";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
const MAX_PHOTOS = 20;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

interface GalleryPhoto {
  id: string;
  imageUrl: string;
  caption: string | null;
  createdAt: string;
}

interface UploadItem {
  id: string;
  file: File;
  preview: string;
  status: "pending" | "uploading" | "done" | "error";
  error?: string;
  caption: string;
}

export default function GalleryPage() {
  const { barbershopId, barbershopName } = useBarbershop();
  const authFetch = useAuthFetch();
  const inputRef = useRef<HTMLInputElement>(null);

  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<GalleryPhoto | null>(null);

  // Multi-upload state
  const [queue, setQueue] = useState<UploadItem[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

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

  // Add files to queue
  function addFiles(files: FileList | File[]) {
    const remaining = MAX_PHOTOS - photos.length - queue.filter((q) => q.status !== "error").length;
    const fileArray = Array.from(files).slice(0, Math.max(0, remaining));

    const newItems: UploadItem[] = fileArray
      .filter((f) => {
        if (!ALLOWED_TYPES.includes(f.type)) return false;
        if (f.size > MAX_FILE_SIZE) return false;
        return true;
      })
      .map((file) => ({
        id: crypto.randomUUID(),
        file,
        preview: URL.createObjectURL(file),
        status: "pending" as const,
        caption: "",
      }));

    if (newItems.length < fileArray.length) {
      const skipped = fileArray.length - newItems.length;
      alert(`${skipped} archivo(s) omitidos (formato no permitido o mayor a 5MB)`);
    }

    setQueue((prev) => [...prev, ...newItems]);
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
    }
  }

  function onChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(e.target.files);
      e.target.value = "";
    }
  }

  function removeFromQueue(id: string) {
    setQueue((prev) => {
      const item = prev.find((q) => q.id === id);
      if (item) URL.revokeObjectURL(item.preview);
      return prev.filter((q) => q.id !== id);
    });
  }

  function updateCaption(id: string, caption: string) {
    setQueue((prev) => prev.map((q) => (q.id === id ? { ...q, caption } : q)));
  }

  // Upload all pending files
  async function uploadAll() {
    const pending = queue.filter((q) => q.status === "pending");
    if (pending.length === 0) return;

    setIsUploading(true);

    for (const item of pending) {
      // Mark uploading
      setQueue((prev) =>
        prev.map((q) => (q.id === item.id ? { ...q, status: "uploading" as const } : q)),
      );

      try {
        // 1. Upload image to Cloudinary
        const formData = new FormData();
        formData.append("file", item.file);
        const uploadRes = await fetch(`${API}/upload/image`, {
          method: "POST",
          body: formData,
        });
        if (!uploadRes.ok) throw new Error("Error al subir imagen");
        const { url } = await uploadRes.json();

        // 2. Save to gallery
        const saveRes = await authFetch(`/gallery/barbershop/${barbershopId}`, {
          method: "POST",
          body: JSON.stringify({ imageUrl: url, caption: item.caption || undefined }),
        });
        if (!saveRes.ok) {
          const body = await saveRes.json().catch(() => ({}));
          throw new Error(body.message ?? "Error al guardar");
        }

        setQueue((prev) =>
          prev.map((q) => (q.id === item.id ? { ...q, status: "done" as const } : q)),
        );
      } catch (err: any) {
        setQueue((prev) =>
          prev.map((q) =>
            q.id === item.id
              ? { ...q, status: "error" as const, error: err.message ?? "Error" }
              : q,
          ),
        );
      }
    }

    // Refresh gallery and clear done items after a short delay
    fetchPhotos();
    setTimeout(() => {
      setQueue((prev) => {
        prev.filter((q) => q.status === "done").forEach((q) => URL.revokeObjectURL(q.preview));
        return prev.filter((q) => q.status !== "done");
      });
    }, 1500);
    setIsUploading(false);
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

  const spotsLeft = MAX_PHOTOS - photos.length;
  const pendingCount = queue.filter((q) => q.status === "pending").length;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-1">Galería de Trabajos</h1>
      <p className="text-gray-500 mb-8">{barbershopName}</p>

      {/* Upload section */}
      <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold">Subir Fotos</h2>
            <p className="text-sm text-gray-500">
              {photos.length} / {MAX_PHOTOS} fotos · {spotsLeft > 0 ? `Puedes subir ${spotsLeft} más` : "Límite alcanzado"}
            </p>
          </div>
          {/* Progress bar */}
          <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${(photos.length / MAX_PHOTOS) * 100}%`,
                backgroundColor: photos.length >= MAX_PHOTOS ? "#ef4444" : photos.length >= 15 ? "#f59e0b" : "#3b82f6",
              }}
            />
          </div>
        </div>

        {spotsLeft <= 0 ? (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-amber-800 text-sm">
            Has alcanzado el límite de {MAX_PHOTOS} fotos. Elimina alguna para subir más.
          </div>
        ) : (
          <>
            {/* Drop zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              onClick={() => inputRef.current?.click()}
              className={`relative cursor-pointer border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                dragOver
                  ? "border-blue-500 bg-blue-50 scale-[1.01]"
                  : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
              }`}
            >
              <div className="text-4xl mb-3">📸</div>
              <p className="text-gray-700 font-medium">
                Arrastra fotos aquí o haz clic para seleccionar
              </p>
              <p className="text-gray-400 text-sm mt-1">
                Puedes seleccionar varias fotos a la vez · JPG, PNG, WebP · Máx 5MB c/u
              </p>
              <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                multiple
                onChange={onChange}
                className="hidden"
              />
            </div>

            {/* Upload queue */}
            {queue.length > 0 && (
              <div className="mt-5 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-700">
                    {pendingCount} foto(s) listas para subir
                  </p>
                  <div className="flex gap-2">
                    {queue.some((q) => q.status === "error") && (
                      <button
                        onClick={() => setQueue((prev) => prev.filter((q) => q.status !== "error"))}
                        className="px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        Limpiar errores
                      </button>
                    )}
                    {pendingCount > 0 && (
                      <button
                        onClick={uploadAll}
                        disabled={isUploading}
                        className="px-5 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        {isUploading ? "Subiendo..." : `🚀 Subir ${pendingCount} foto(s)`}
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {queue.map((item) => (
                    <div key={item.id} className="relative group">
                      <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 relative">
                        <img
                          src={item.preview}
                          alt="Preview"
                          className={`w-full h-full object-cover ${
                            item.status === "uploading" ? "opacity-50" : ""
                          } ${item.status === "error" ? "opacity-30 grayscale" : ""}`}
                        />
                        {/* Status overlay */}
                        {item.status === "uploading" && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
                          </div>
                        )}
                        {item.status === "done" && (
                          <div className="absolute inset-0 flex items-center justify-center bg-green-600/30">
                            <span className="text-white text-2xl">✓</span>
                          </div>
                        )}
                        {item.status === "error" && (
                          <div className="absolute inset-0 flex items-center justify-center bg-red-600/20">
                            <span className="text-red-600 text-xl font-bold">✕</span>
                          </div>
                        )}
                      </div>
                      {/* Caption input */}
                      {item.status === "pending" && (
                        <input
                          type="text"
                          value={item.caption}
                          onChange={(e) => updateCaption(item.id, e.target.value)}
                          placeholder="Descripción..."
                          maxLength={100}
                          className="w-full mt-1 text-xs bg-white border border-gray-200 rounded px-2 py-1 text-gray-700"
                        />
                      )}
                      {item.status === "error" && (
                        <p className="text-red-500 text-xs mt-1 truncate">{item.error}</p>
                      )}
                      {/* Remove button */}
                      {(item.status === "pending" || item.status === "error") && (
                        <button
                          onClick={() => removeFromQueue(item.id)}
                          className="absolute top-1 right-1 bg-black/60 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs hover:bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
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
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-end p-3">
                {photo.caption && (
                  <p className="text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity truncate">
                    {photo.caption}
                  </p>
                )}
              </div>
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
