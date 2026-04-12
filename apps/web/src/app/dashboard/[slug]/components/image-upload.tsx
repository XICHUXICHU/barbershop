"use client";

import { useState, useRef, DragEvent, ChangeEvent } from "react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

interface ImageUploadProps {
  currentUrl: string | null;
  onUploaded: (url: string) => void;
  label: string;
  /** "cover" = rectangular 16:9, "avatar" = circle, "logo" = square */
  variant?: "cover" | "avatar" | "logo";
}

export default function ImageUpload({
  currentUrl,
  onUploaded,
  label,
  variant = "logo",
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const displayUrl = preview ?? currentUrl;

  async function handleFile(file: File) {
    setError("");

    if (file.size > 5 * 1024 * 1024) {
      setError("El archivo es muy grande (máx 5 MB)");
      return;
    }

    if (!["image/jpeg", "image/png", "image/webp", "image/avif"].includes(file.type)) {
      setError("Formato no permitido. Usa JPG, PNG, WebP o AVIF");
      return;
    }

    // Show local preview immediately
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${API}/upload/image`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message ?? "Error al subir imagen");
      }

      const data: { url: string } = await res.json();
      onUploaded(data.url);
      setPreview(data.url);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al subir imagen");
      setPreview(null);
    } finally {
      setUploading(false);
    }
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function onChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  const sizeClasses =
    variant === "cover"
      ? "w-full aspect-[16/7] rounded-xl"
      : variant === "avatar"
        ? "w-32 h-32 rounded-full"
        : "w-32 h-32 rounded-xl";

  return (
    <div>
      <span className="text-sm text-gray-500 block mb-2">{label}</span>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative cursor-pointer border-2 border-dashed transition-colors overflow-hidden flex items-center justify-center bg-gray-50 ${sizeClasses} ${
          dragOver
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-blue-400"
        }`}
      >
        {displayUrl ? (
          <>
            <img
              src={displayUrl}
              alt={label}
              className="w-full h-full object-cover"
            />
            {uploading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </>
        ) : (
          <div className="text-center p-4">
            <svg
              className="mx-auto h-8 w-8 text-gray-400 mb-2"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.338-2.32 3.75 3.75 0 013.555 5.345A3.75 3.75 0 0117.25 19.5H6.75z"
              />
            </svg>
            <p className="text-xs text-gray-500">
              {uploading ? "Subiendo..." : "Arrastra o haz clic"}
            </p>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          onChange={onChange}
          className="hidden"
        />
      </div>

      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
