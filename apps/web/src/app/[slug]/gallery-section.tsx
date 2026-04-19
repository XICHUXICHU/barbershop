"use client";

import { useState, useEffect, useCallback } from "react";

interface GalleryPhoto {
  id: string;
  imageUrl: string;
  caption: string | null;
}

export default function GallerySection({ gallery }: { gallery: GalleryPhoto[] }) {
  const [current, setCurrent] = useState<number | null>(null);

  const close = useCallback(() => setCurrent(null), []);
  const prev = useCallback(
    () => setCurrent((i) => (i !== null && i > 0 ? i - 1 : gallery.length - 1)),
    [gallery.length],
  );
  const next = useCallback(
    () => setCurrent((i) => (i !== null && i < gallery.length - 1 ? i + 1 : 0)),
    [gallery.length],
  );

  useEffect(() => {
    if (current === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    }
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [current, close, prev, next]);

  const photo = current !== null ? gallery[current] : null;

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1">
        {gallery.map((p, i) => (
          <div
            key={p.id}
            className="group relative aspect-square overflow-hidden bg-hc-surface-container-high cursor-pointer"
            onClick={() => setCurrent(i)}
          >
            <img
              src={p.imageUrl}
              alt={p.caption || "Trabajo realizado"}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3 sm:p-4">
              {p.caption && (
                <p className="text-white text-xs sm:text-sm font-body">{p.caption}</p>
              )}
              <span className="absolute top-2 right-2 text-white/70 text-xs bg-black/40 rounded px-1.5 py-0.5">
                Ver
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox modal */}
      {photo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={close}
        >
          {/* Close button */}
          <button
            onClick={close}
            className="absolute top-4 right-4 z-50 text-white/80 hover:text-white text-3xl w-10 h-10 flex items-center justify-center"
            aria-label="Cerrar"
          >
            ✕
          </button>

          {/* Counter */}
          <span className="absolute top-4 left-4 text-white/60 text-sm font-body">
            {current! + 1} / {gallery.length}
          </span>

          {/* Prev */}
          {gallery.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); prev(); }}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-50 text-white/70 hover:text-white text-4xl sm:text-5xl w-12 h-16 flex items-center justify-center select-none"
              aria-label="Anterior"
            >
              ‹
            </button>
          )}

          {/* Next */}
          {gallery.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); next(); }}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-50 text-white/70 hover:text-white text-4xl sm:text-5xl w-12 h-16 flex items-center justify-center select-none"
              aria-label="Siguiente"
            >
              ›
            </button>
          )}

          {/* Image */}
          <div
            className="max-w-[90vw] max-h-[85vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={photo.imageUrl}
              alt={photo.caption || "Trabajo realizado"}
              className="max-w-full max-h-[80vh] object-contain rounded"
            />
            {photo.caption && (
              <p className="text-white/80 text-sm mt-3 text-center font-body px-4">
                {photo.caption}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
