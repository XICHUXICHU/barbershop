"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser, useAuth, UserButton } from "@clerk/nextjs";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

export default function RegisterPage() {
  const router = useRouter();
  const { user } = useUser();
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  function handleNameChange(value: string) {
    setName(value);
    // Auto-generate slug from name
    const autoSlug = value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // remove accents
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    setSlug(autoSlug);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/barbershops`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ ownerId: user?.id, name, slug, phone, address }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message ?? `Error ${res.status}`);
      }

      const shop = await res.json();
      // Redirect to the new barbershop's dashboard
      router.push(`/dashboard/${shop.slug}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Usuario autenticado */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <UserButton />
          <span className="text-sm text-gray-600">
            {user?.primaryEmailAddress?.emailAddress}
          </span>
        </div>

        <h1 className="text-3xl font-bold text-center mb-2">
          Registra tu Barbería
        </h1>
        <p className="text-center text-gray-500 mb-8">
          Crea tu página y empieza a recibir citas online hoy.
        </p>

        {error && (
          <div className="bg-red-900/40 border border-red-600 rounded-lg p-3 text-red-300 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="text-sm text-gray-500">
              Nombre de tu barbería
            </span>
            <input
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Ej: Fresh Cuts Barber"
              required
              className="w-full mt-1 bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-blue-600 focus:outline-none"
            />
          </label>

          <label className="block">
            <span className="text-sm text-gray-500">
              URL de tu página
            </span>
            <div className="flex items-center mt-1 bg-white border border-gray-200 rounded-xl overflow-hidden">
              <span className="px-3 text-gray-500 text-sm bg-white">
                barbershop-web-sigma.vercel.app/
              </span>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="mi-barberia"
                required
                pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$"
                title="Solo letras minúsculas, números y guiones"
                className="flex-1 bg-transparent px-3 py-3 text-gray-900 placeholder-gray-500 focus:outline-none"
              />
            </div>
          </label>

          <label className="block">
            <span className="text-sm text-gray-500">
              Teléfono / WhatsApp
            </span>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+52 55 1234 5678"
              required
              className="w-full mt-1 bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-blue-600 focus:outline-none"
            />
          </label>

          <label className="block">
            <span className="text-sm text-gray-500">
              Dirección
            </span>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Calle Principal #123, Colonia, Ciudad"
              required
              className="w-full mt-1 bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-blue-600 focus:outline-none"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold text-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {loading ? "Registrando..." : "Crear mi Barbería"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          ¿Ya tienes cuenta?{" "}
          <a
            href="/dashboard"
            className="text-blue-600 hover:underline"
          >
            Ir al panel
          </a>
        </p>
      </div>
    </div>
  );
}
