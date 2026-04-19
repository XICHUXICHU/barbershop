import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex bg-gray-50 text-gray-900">
      <aside className="w-64 bg-white border-r border-gray-200 p-6 flex flex-col gap-6">
        <div>
          <h2 className="text-xl font-bold text-blue-600">
            Super Admin
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Panel de control de la plataforma
          </p>
        </div>

        <nav className="flex flex-col gap-1">
          <Link
            href="/admin"
            className="px-3 py-2 rounded-lg hover:bg-gray-100 text-sm font-medium text-gray-700"
          >
            Dashboard
          </Link>
          <Link
            href="/admin/barbershops"
            className="px-3 py-2 rounded-lg hover:bg-gray-100 text-sm font-medium text-gray-700"
          >
            Barberías
          </Link>
          <Link
            href="/admin/appointments"
            className="px-3 py-2 rounded-lg hover:bg-gray-100 text-sm font-medium text-gray-700"
          >
            Citas Recientes
          </Link>
          <Link
            href="/admin/leads"
            className="px-3 py-2 rounded-lg hover:bg-gray-100 text-sm font-medium text-gray-700"
          >
            🔍 Prospectos
          </Link>
        </nav>

        <div className="mt-auto">
          <Link
            href="/dashboard"
            className="text-xs text-gray-500 hover:text-gray-900 block mb-4"
          >
            ← Volver al Dashboard
          </Link>
          <div className="pt-4 border-t border-gray-200">
            <UserButton showName />
          </div>
        </div>
      </aside>

      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
