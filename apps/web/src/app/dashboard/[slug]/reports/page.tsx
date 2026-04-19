"use client";

import { useEffect, useState } from "react";
import { useBarbershop } from "../barbershop-context";
import { useAuthFetch } from "../../../../lib/use-auth-fetch";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const STATUS_LABELS: Record<string, string> = {
  COMPLETED: "Completadas",
  CANCELLED: "Canceladas",
  NO_SHOW: "No asistieron",
  PENDING: "Pendientes",
  CONFIRMED: "Confirmadas",
};

const STATUS_COLORS: Record<string, string> = {
  COMPLETED: "#22c55e",
  CONFIRMED: "#3b82f6",
  PENDING: "#f59e0b",
  CANCELLED: "#ef4444",
  NO_SHOW: "#6b7280",
};

const CHART_COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#06b6d4", "#f97316"];

interface Summary {
  totalAppointments: number;
  completedThisMonth: number;
  completedLastMonth: number;
  cancelledThisMonth: number;
  noShowThisMonth: number;
  revenueThisMonth: number;
  revenueLastMonth: number;
  totalCustomers: number;
}

export default function ReportsPage() {
  const { barbershopId, barbershopName } = useBarbershop();
  const authFetch = useAuthFetch();

  const [summary, setSummary] = useState<Summary | null>(null);
  const [dailyRevenue, setDailyRevenue] = useState<{ date: string; revenue: number }[]>([]);
  const [popularServices, setPopularServices] = useState<{ name: string; count: number; revenue: number }[]>([]);
  const [barberPerf, setBarberPerf] = useState<{ name: string; appointments: number }[]>([]);
  const [peakHours, setPeakHours] = useState<{ label: string; count: number }[]>([]);
  const [statusBreakdown, setStatusBreakdown] = useState<{ status: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!barbershopId) return;

    const base = `/reports/barbershop/${barbershopId}`;

    Promise.all([
      authFetch(`${base}/summary`).then((r) => r.json()),
      authFetch(`${base}/revenue-daily`).then((r) => r.json()),
      authFetch(`${base}/popular-services`).then((r) => r.json()),
      authFetch(`${base}/barber-performance`).then((r) => r.json()),
      authFetch(`${base}/peak-hours`).then((r) => r.json()),
      authFetch(`${base}/status-breakdown`).then((r) => r.json()),
    ])
      .then(([sum, rev, svc, barber, peak, status]) => {
        setSummary(sum);
        setDailyRevenue(rev);
        setPopularServices(svc);
        setBarberPerf(barber);
        setPeakHours(peak);
        setStatusBreakdown(status);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [barbershopId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  const revDelta =
    summary && summary.revenueLastMonth > 0
      ? Math.round(((summary.revenueThisMonth - summary.revenueLastMonth) / summary.revenueLastMonth) * 100)
      : null;

  const apptDelta =
    summary && summary.completedLastMonth > 0
      ? Math.round(((summary.completedThisMonth - summary.completedLastMonth) / summary.completedLastMonth) * 100)
      : null;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-1">Reportes</h1>
      <p className="text-gray-500 mb-8">{barbershopName}</p>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KpiCard
          title="Ingresos este mes"
          value={`$${(summary?.revenueThisMonth ?? 0).toLocaleString()} MXN`}
          delta={revDelta}
        />
        <KpiCard
          title="Citas completadas"
          value={String(summary?.completedThisMonth ?? 0)}
          delta={apptDelta}
        />
        <KpiCard
          title="Clientes totales"
          value={String(summary?.totalCustomers ?? 0)}
        />
        <KpiCard
          title="Cancelaciones / No-show"
          value={`${summary?.cancelledThisMonth ?? 0} / ${summary?.noShowThisMonth ?? 0}`}
          negative
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue chart */}
        <ChartCard title="Ingresos Diarios (últimos 30 días)">
          {dailyRevenue.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={dailyRevenue}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: "#6b7280" }}
                  tickFormatter={(v: string) => v.slice(5)}
                />
                <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} tickFormatter={(v: any) => `$${v}`} />
                <Tooltip formatter={(v: any) => [`$${Number(v).toLocaleString()} MXN`, "Ingresos"]} />
                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState />
          )}
        </ChartCard>

        {/* Peak hours */}
        <ChartCard title="Horas Más Populares">
          {peakHours.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={peakHours}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#6b7280" }} />
                <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} allowDecimals={false} />
                <Tooltip formatter={(v: any) => [v, "Citas"]} />
                <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState />
          )}
        </ChartCard>

        {/* Popular services */}
        <ChartCard title="Servicios Más Populares">
          {popularServices.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={popularServices} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" tick={{ fontSize: 11, fill: "#6b7280" }} allowDecimals={false} />
                <YAxis
                  dataKey="name"
                  type="category"
                  tick={{ fontSize: 11, fill: "#6b7280" }}
                  width={100}
                />
                <Tooltip
                  formatter={(v: any, name: any) => {
                    if (name === "count") return [v, "Citas"];
                    return [`$${Number(v).toLocaleString()} MXN`, "Ingresos"];
                  }}
                />
                <Bar dataKey="count" fill="#10b981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState />
          )}
        </ChartCard>

        {/* Status breakdown (pie) */}
        <ChartCard title="Estado de Citas">
          {statusBreakdown.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={statusBreakdown}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={(props: any) =>
                    `${STATUS_LABELS[props.status] ?? props.status}: ${props.count}`
                  }
                >
                  {statusBreakdown.map((entry, i) => (
                    <Cell key={i} fill={STATUS_COLORS[entry.status] ?? CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v: any, name: any) => [v, STATUS_LABELS[name] ?? name]}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState />
          )}
        </ChartCard>

        {/* Barber performance */}
        {barberPerf.length > 0 && (
          <ChartCard title="Rendimiento por Barbero" className="lg:col-span-2">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={barberPerf}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#6b7280" }} />
                <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} allowDecimals={false} />
                <Tooltip formatter={(v: any) => [v, "Citas completadas"]} />
                <Bar dataKey="appointments" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}
      </div>
    </div>
  );
}

/* ─── Small components ─── */

function KpiCard({
  title,
  value,
  delta,
  negative,
}: {
  title: string;
  value: string;
  delta?: number | null;
  negative?: boolean;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
      <p className="text-sm text-gray-500 mb-1">{title}</p>
      <p className={`text-2xl font-bold ${negative ? "text-red-600" : "text-gray-900"}`}>{value}</p>
      {delta !== undefined && delta !== null && (
        <p className={`text-xs mt-1 ${delta >= 0 ? "text-green-600" : "text-red-500"}`}>
          {delta >= 0 ? "↑" : "↓"} {Math.abs(delta)}% vs mes anterior
        </p>
      )}
    </div>
  );
}

function ChartCard({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-white border border-gray-200 rounded-xl p-5 shadow-sm ${className}`}>
      <h3 className="font-semibold text-gray-900 mb-4">{title}</h3>
      {children}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
      Sin datos suficientes aún
    </div>
  );
}
