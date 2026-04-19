import Link from "next/link";

export default function DemoPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <h1 className="text-3xl font-bold mb-4">Demo — Barbería Ejemplo</h1>
      <p className="text-gray-500 mb-8 text-center max-w-md">
        Primero necesitas registrar una barbería para ver cómo se ve la página
        pública de reservas.
      </p>
      <div className="flex gap-4">
        <Link
          href="/register"
          className="px-8 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
        >
          Registrar Barbería
        </Link>
        <Link
          href="/"
          className="px-8 py-3 rounded-xl border border-gray-200 text-gray-500 hover:text-gray-900 transition-colors"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
