"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuthFetch } from "../../../lib/use-auth-fetch";

/* ───────────── Types ───────────── */

interface ShopRow {
  id: string;
  name: string;
  slug: string;
  phone: string;
  address: string;
  logoUrl: string | null;
  coverUrl: string | null;
  isActive: boolean;
  createdAt: string;
  _count: { barbers: number; services: number; appointments: number };
}

interface ManualData {
  contacted: boolean;
  trained: boolean;
  paid: boolean;
  launched: boolean;
  notes: string;
}

/* ───────────── Helpers ───────────── */

const MANUAL_KEY = "admin_seguimiento_manual";

function loadManual(): Record<string, ManualData> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(MANUAL_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveManual(data: Record<string, ManualData>) {
  localStorage.setItem(MANUAL_KEY, JSON.stringify(data));
}

function getManual(id: string, all: Record<string, ManualData>): ManualData {
  return (
    all[id] ?? {
      contacted: false,
      trained: false,
      paid: false,
      launched: false,
      notes: "",
    }
  );
}

/* ───────────── Step definitions ───────────── */

interface Step {
  key: string;
  label: string;
  icon: string;
  auto: boolean;
}

const STEPS: Step[] = [
  { key: "registered", label: "Barbería registrada", icon: "📋", auto: true },
  { key: "logo", label: "Logo subido", icon: "🖼️", auto: true },
  { key: "cover", label: "Portada subida", icon: "🏞️", auto: true },
  { key: "services", label: "Servicios registrados", icon: "✂️", auto: true },
  { key: "barbers", label: "Barberos registrados", icon: "💈", auto: true },
  { key: "firstAppt", label: "Primera cita recibida", icon: "📅", auto: true },
  { key: "contacted", label: "Dueño contactado", icon: "📞", auto: false },
  { key: "trained", label: "Capacitación realizada", icon: "🎓", auto: false },
  { key: "paid", label: "Primer pago confirmado", icon: "💰", auto: false },
  { key: "launched", label: "Lanzada oficialmente", icon: "🚀", auto: false },
];

function evalStep(
  step: Step,
  shop: ShopRow,
  manual: ManualData
): boolean {
  if (!step.auto) return manual[step.key as keyof ManualData] as boolean;
  switch (step.key) {
    case "registered":
      return true;
    case "logo":
      return !!shop.logoUrl;
    case "cover":
      return !!shop.coverUrl;
    case "services":
      return shop._count.services > 0;
    case "barbers":
      return shop._count.barbers > 0;
    case "firstAppt":
      return shop._count.appointments > 0;
    default:
      return false;
  }
}

/* ───────────── Components ───────────── */

function ProgressBar({ pct }: { pct: number }) {
  const color =
    pct >= 80
      ? "bg-green-500"
      : pct >= 50
      ? "bg-yellow-500"
      : pct >= 20
      ? "bg-orange-500"
      : "bg-red-500";
  return (
    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
      <div
        className={`${color} h-full rounded-full transition-all duration-500`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function ShopCard({
  shop,
  manual,
  onToggle,
  onNotesChange,
}: {
  shop: ShopRow;
  manual: ManualData;
  onToggle: (step: string) => void;
  onNotesChange: (val: string) => void;
}) {
  const [open, setOpen] = useState(false);

  const completed = STEPS.filter((s) => evalStep(s, shop, manual)).length;
  const pct = Math.round((completed / STEPS.length) * 100);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left px-5 py-4 flex items-center gap-4 hover:bg-gray-50 transition"
      >
        {/* Avatar / Logo */}
        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg overflow-hidden">
          {shop.logoUrl ? (
            <img
              src={shop.logoUrl}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            shop.name.charAt(0).toUpperCase()
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900 truncate">
              {shop.name}
            </h3>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                shop.isActive
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {shop.isActive ? "Activa" : "Suspendida"}
            </span>
          </div>
          <p className="text-xs text-gray-500 truncate mt-0.5">
            /{shop.slug} · {shop.phone}
          </p>
        </div>

        {/* Progress */}
        <div className="flex-shrink-0 w-36 hidden sm:block">
          <ProgressBar pct={pct} />
        </div>
        <span className="flex-shrink-0 text-sm font-bold text-gray-700 w-12 text-right">
          {pct}%
        </span>
        <span
          className={`text-gray-400 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        >
          ▾
        </span>
      </button>

      {/* Mobile progress */}
      <div className="px-5 pb-2 sm:hidden">
        <ProgressBar pct={pct} />
      </div>

      {/* Expanded content */}
      {open && (
        <div className="border-t border-gray-100 px-5 py-4">
          {/* Step grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
            {STEPS.map((step) => {
              const done = evalStep(step, shop, manual);
              const isManual = !step.auto;
              return (
                <div
                  key={step.key}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border transition ${
                    done
                      ? "bg-green-50 border-green-200"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <span className="text-lg">{step.icon}</span>
                  <span
                    className={`flex-1 text-sm ${
                      done
                        ? "text-green-700 font-medium"
                        : "text-gray-500"
                    }`}
                  >
                    {step.label}
                  </span>

                  {isManual ? (
                    <button
                      onClick={() => onToggle(step.key)}
                      className={`w-6 h-6 rounded-md border-2 flex items-center justify-center text-xs transition ${
                        done
                          ? "bg-green-500 border-green-500 text-white"
                          : "border-gray-300 hover:border-blue-400"
                      }`}
                    >
                      {done && "✓"}
                    </button>
                  ) : (
                    <span
                      className={`text-sm font-bold ${
                        done ? "text-green-500" : "text-gray-300"
                      }`}
                    >
                      {done ? "✓" : "✗"}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Counters */}
          <div className="flex gap-4 text-xs text-gray-500 mb-4">
            <span>
              👤 {shop._count.barbers} barbero
              {shop._count.barbers !== 1 && "s"}
            </span>
            <span>
              ✂️ {shop._count.services} servicio
              {shop._count.services !== 1 && "s"}
            </span>
            <span>
              📅 {shop._count.appointments} cita
              {shop._count.appointments !== 1 && "s"}
            </span>
            <span>
              📆 Registrada{" "}
              {new Date(shop.createdAt).toLocaleDateString("es-MX", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">
              📝 Notas del admin
            </label>
            <textarea
              value={manual.notes}
              onChange={(e) => onNotesChange(e.target.value)}
              placeholder="Agrega notas sobre esta barbería..."
              rows={2}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
            />
          </div>
        </div>
      )}
    </div>
  );
}

/* ───────────── Main Page ───────────── */

type SortOption = "name" | "progress" | "recent";
type FilterOption = "all" | "active" | "suspended" | "incomplete";

export default function SeguimientoPage() {
  const authFetch = useAuthFetch();
  const [shops, setShops] = useState<ShopRow[]>([]);
  const [manualAll, setManualAll] = useState<Record<string, ManualData>>({});
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<SortOption>("progress");
  const [filter, setFilter] = useState<FilterOption>("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    setManualAll(loadManual());
  }, []);

  useEffect(() => {
    authFetch("/admin/barbershops")
      .then((r) => r.json())
      .then((d) => setShops(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [authFetch]);

  const toggleManual = useCallback(
    (shopId: string, stepKey: string) => {
      setManualAll((prev) => {
        const m = getManual(shopId, prev);
        const updated = {
          ...prev,
          [shopId]: { ...m, [stepKey]: !m[stepKey as keyof ManualData] },
        };
        saveManual(updated);
        return updated;
      });
    },
    []
  );

  const updateNotes = useCallback((shopId: string, notes: string) => {
    setManualAll((prev) => {
      const m = getManual(shopId, prev);
      const updated = { ...prev, [shopId]: { ...m, notes } };
      saveManual(updated);
      return updated;
    });
  }, []);

  /* Progress calculator */
  const getPct = useCallback(
    (shop: ShopRow) => {
      const manual = getManual(shop.id, manualAll);
      const completed = STEPS.filter((s) => evalStep(s, shop, manual)).length;
      return Math.round((completed / STEPS.length) * 100);
    },
    [manualAll]
  );

  /* Filtered + sorted list */
  const displayed = shops
    .filter((s) => {
      if (search) {
        const q = search.toLowerCase();
        if (
          !s.name.toLowerCase().includes(q) &&
          !s.slug.toLowerCase().includes(q)
        )
          return false;
      }
      if (filter === "active") return s.isActive;
      if (filter === "suspended") return !s.isActive;
      if (filter === "incomplete") return getPct(s) < 100;
      return true;
    })
    .sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "progress") return getPct(a) - getPct(b);
      return (
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    });

  /* Stats */
  const totalShops = shops.length;
  const completedShops = shops.filter((s) => getPct(s) === 100).length;
  const avgProgress =
    totalShops > 0
      ? Math.round(shops.reduce((acc, s) => acc + getPct(s), 0) / totalShops)
      : 0;
  const needAttention = shops.filter((s) => getPct(s) < 50).length;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">
        📊 Seguimiento de Barberías
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        Monitorea el progreso de registro y activación de cada barbería.
        Los pasos manuales y notas se guardan localmente en este navegador.
      </p>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-3xl font-bold text-blue-600">{totalShops}</p>
          <p className="text-xs text-gray-500 mt-1">Total</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-3xl font-bold text-green-600">{completedShops}</p>
          <p className="text-xs text-gray-500 mt-1">Completadas</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-3xl font-bold text-yellow-600">{avgProgress}%</p>
          <p className="text-xs text-gray-500 mt-1">Promedio</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-3xl font-bold text-red-600">{needAttention}</p>
          <p className="text-xs text-gray-500 mt-1">Requieren atención</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 items-center mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar barbería..."
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-60 focus:outline-none focus:ring-2 focus:ring-blue-300"
        />

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as FilterOption)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          <option value="all">Todas</option>
          <option value="active">Activas</option>
          <option value="suspended">Suspendidas</option>
          <option value="incomplete">Incompletas</option>
        </select>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortOption)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          <option value="progress">Ordenar: Menor progreso</option>
          <option value="name">Ordenar: Nombre</option>
          <option value="recent">Ordenar: Más reciente</option>
        </select>

        <span className="text-xs text-gray-400 ml-auto">
          Mostrando {displayed.length} de {totalShops}
        </span>
      </div>

      {/* List */}
      {loading ? (
        <div className="text-center py-20 text-gray-400">Cargando…</div>
      ) : displayed.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          No se encontraron barberías.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {displayed.map((shop) => (
            <ShopCard
              key={shop.id}
              shop={shop}
              manual={getManual(shop.id, manualAll)}
              onToggle={(stepKey) => toggleManual(shop.id, stepKey)}
              onNotesChange={(val) => updateNotes(shop.id, val)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
