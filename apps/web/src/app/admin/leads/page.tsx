"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuthFetch } from "../../../lib/use-auth-fetch";

// ─── Types ───

interface SearchResult {
  placeId: string;
  name: string;
  address: string | null;
  phone: string | null;
  website: string | null;
  mapsUrl: string | null;
  rating: number | null;
  totalRatings: number | null;
  alreadySaved: boolean;
}

interface Lead {
  id: string;
  placeId: string;
  name: string;
  address: string | null;
  phone: string | null;
  website: string | null;
  mapsUrl: string | null;
  rating: number | null;
  totalRatings: number | null;
  city: string | null;
  status: string;
  notes: string | null;
  createdAt: string;
}

const STATUS_OPTIONS = [
  { value: "NEW", label: "Nuevo", color: "bg-gray-100 text-gray-700" },
  { value: "CONTACTED", label: "Contactado", color: "bg-blue-100 text-blue-700" },
  { value: "INTERESTED", label: "Interesado", color: "bg-green-100 text-green-700" },
  { value: "NOT_INTERESTED", label: "No interesado", color: "bg-red-100 text-red-700" },
  { value: "CONVERTED", label: "Convertido", color: "bg-purple-100 text-purple-700" },
];

function statusMeta(status: string) {
  return STATUS_OPTIONS.find((s) => s.value === status) ?? STATUS_OPTIONS[0];
}

// ─── Suggested Queries ───

const SUGGESTED_QUERIES = [
  "Barberías en Ciudad de México",
  "Barberías en Monterrey",
  "Barberías en Guadalajara",
  "Peluquerías en Cancún",
  "Barberías en Puebla",
  "Barber shop en Mérida",
  "Peluquerías en Tijuana",
  "Barberías en León",
];

// ─── Component ───

export default function LeadsPage() {
  const authFetch = useAuthFetch();

  // Tab: search | saved
  const [tab, setTab] = useState<"search" | "saved">("search");

  // Search state
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [searchError, setSearchError] = useState("");
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set());

  // Saved leads state
  const [leads, setLeads] = useState<Lead[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loadingLeads, setLoadingLeads] = useState(false);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterCity, setFilterCity] = useState("");
  const [filterQ, setFilterQ] = useState("");
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [notesText, setNotesText] = useState("");

  // ─── Search ───

  async function doSearch(pageToken?: string) {
    const q = query.trim();
    if (q.length < 3) return;

    setSearching(true);
    setSearchError("");
    if (!pageToken) setResults([]);

    try {
      const params = new URLSearchParams({ query: q });
      if (pageToken) params.set("pageToken", pageToken);

      const res = await authFetch(`/admin/leads/search?${params}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message ?? `Error ${res.status}`);
      }
      const data = await res.json();

      if (pageToken) {
        setResults((prev) => [...prev, ...data.results]);
      } else {
        setResults(data.results);
      }
      setNextPageToken(data.nextPageToken);
    } catch (err: any) {
      setSearchError(err.message ?? "Error al buscar");
    } finally {
      setSearching(false);
    }
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    doSearch();
  }

  function handleSuggestion(q: string) {
    setQuery(q);
    setResults([]);
    setNextPageToken(null);
    // Trigger search after state update
    setTimeout(() => {
      const params = new URLSearchParams({ query: q });
      setSearching(true);
      setSearchError("");
      authFetch(`/admin/leads/search?${params}`)
        .then((res) => {
          if (!res.ok) throw new Error("Error");
          return res.json();
        })
        .then((data) => {
          setResults(data.results);
          setNextPageToken(data.nextPageToken);
        })
        .catch((err) => setSearchError(err.message))
        .finally(() => setSearching(false));
    }, 0);
  }

  // ─── Save Lead ───

  async function saveLead(result: SearchResult) {
    setSavingIds((prev) => new Set([...prev, result.placeId]));

    // Extract city from query
    const cityMatch = query.match(/en\s+(.+)/i);
    const city = cityMatch ? cityMatch[1].trim() : null;

    try {
      const res = await authFetch("/admin/leads", {
        method: "POST",
        body: JSON.stringify({
          placeId: result.placeId,
          name: result.name,
          address: result.address,
          phone: result.phone,
          website: result.website,
          mapsUrl: result.mapsUrl,
          rating: result.rating,
          totalRatings: result.totalRatings,
          city,
        }),
      });

      if (res.ok) {
        // Mark as saved in results
        setResults((prev) =>
          prev.map((r) =>
            r.placeId === result.placeId ? { ...r, alreadySaved: true } : r,
          ),
        );
      } else {
        const body = await res.json().catch(() => ({}));
        alert(body.message ?? "Error al guardar");
      }
    } catch {
      alert("Error de conexión");
    } finally {
      setSavingIds((prev) => {
        const next = new Set(prev);
        next.delete(result.placeId);
        return next;
      });
    }
  }

  // ─── Load saved leads ───

  const loadLeads = useCallback(async () => {
    setLoadingLeads(true);
    try {
      const params = new URLSearchParams();
      if (filterStatus !== "ALL") params.set("status", filterStatus);
      if (filterCity) params.set("city", filterCity);
      if (filterQ) params.set("q", filterQ);

      const res = await authFetch(`/admin/leads?${params}`);
      if (res.ok) {
        const data = await res.json();
        setLeads(data.leads);
        setCounts(data.counts);
      }
    } catch {
    } finally {
      setLoadingLeads(false);
    }
  }, [authFetch, filterStatus, filterCity, filterQ]);

  useEffect(() => {
    if (tab === "saved") {
      loadLeads();
    }
  }, [tab, loadLeads]);

  // ─── Update Lead ───

  async function updateLeadStatus(id: string, status: string) {
    const res = await authFetch(`/admin/leads/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
      loadLeads(); // refresh counts
    }
  }

  async function saveNotes(id: string) {
    const res = await authFetch(`/admin/leads/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ notes: notesText }),
    });
    if (res.ok) {
      setLeads((prev) =>
        prev.map((l) => (l.id === id ? { ...l, notes: notesText } : l)),
      );
      setEditingNotes(null);
    }
  }

  async function deleteLead(id: string) {
    if (!confirm("¿Eliminar este lead?")) return;
    const res = await authFetch(`/admin/leads/${id}`, { method: "DELETE" });
    if (res.ok) {
      setLeads((prev) => prev.filter((l) => l.id !== id));
      loadLeads(); // refresh counts
    }
  }

  // ─── Render ───

  const totalSaved = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-1">Prospectos</h1>
      <p className="text-gray-500 mb-6">
        Busca barberías y peluquerías para ofrecerles la plataforma
      </p>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-8 w-fit">
        <button
          onClick={() => setTab("search")}
          className={`px-5 py-2 rounded-md text-sm font-medium transition-colors ${
            tab === "search"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          🔍 Buscar Negocios
        </button>
        <button
          onClick={() => setTab("saved")}
          className={`px-5 py-2 rounded-md text-sm font-medium transition-colors ${
            tab === "saved"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          📋 Guardados {totalSaved > 0 && `(${totalSaved})`}
        </button>
      </div>

      {/* ═══ SEARCH TAB ═══ */}
      {tab === "search" && (
        <div>
          {/* Search form */}
          <form onSubmit={handleSearchSubmit} className="flex gap-3 mb-4">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder='Ej: "Barberías en Monterrey" o "Peluquerías cerca de Polanco"'
              className="flex-1 bg-white border border-gray-200 rounded-lg px-4 py-3 text-gray-900 placeholder:text-gray-400"
            />
            <button
              type="submit"
              disabled={searching || query.trim().length < 3}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 shrink-0"
            >
              {searching ? "Buscando..." : "Buscar"}
            </button>
          </form>

          {/* Suggestions */}
          {results.length === 0 && !searching && !searchError && (
            <div className="mb-6">
              <p className="text-sm text-gray-500 mb-3">Búsquedas sugeridas:</p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_QUERIES.map((sq) => (
                  <button
                    key={sq}
                    onClick={() => handleSuggestion(sq)}
                    className="px-3 py-1.5 bg-gray-100 text-gray-600 text-sm rounded-full hover:bg-gray-200 transition-colors"
                  >
                    {sq}
                  </button>
                ))}
              </div>
            </div>
          )}

          {searchError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm mb-4">
              {searchError}
            </div>
          )}

          {/* Results */}
          {results.length > 0 && (
            <div>
              <p className="text-sm text-gray-500 mb-4">
                {results.length} resultados encontrados
              </p>

              <div className="space-y-3">
                {results.map((r) => (
                  <div
                    key={r.placeId}
                    className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col sm:flex-row gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2">
                        <h3 className="font-semibold text-gray-900 text-lg">
                          {r.name}
                        </h3>
                        {r.rating && (
                          <span className="shrink-0 text-sm bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded-lg font-medium">
                            ⭐ {r.rating.toFixed(1)}
                            {r.totalRatings ? ` (${r.totalRatings})` : ""}
                          </span>
                        )}
                      </div>

                      {r.address && (
                        <p className="text-sm text-gray-500 mt-1">📍 {r.address}</p>
                      )}

                      <div className="flex flex-wrap gap-3 mt-3">
                        {r.phone && (
                          <a
                            href={`tel:${r.phone}`}
                            className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline"
                          >
                            📞 {r.phone}
                          </a>
                        )}
                        {r.website && (
                          <a
                            href={r.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline"
                          >
                            🌐 Sitio web
                          </a>
                        )}
                        {r.mapsUrl && (
                          <a
                            href={r.mapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline"
                          >
                            🗺️ Google Maps
                          </a>
                        )}
                      </div>

                      {!r.phone && !r.website && (
                        <p className="text-xs text-gray-400 mt-2">
                          Sin teléfono ni sitio web registrado
                        </p>
                      )}
                    </div>

                    <div className="shrink-0 flex items-center">
                      {r.alreadySaved ? (
                        <span className="px-4 py-2 bg-green-50 text-green-600 rounded-lg text-sm font-medium">
                          ✓ Guardado
                        </span>
                      ) : (
                        <button
                          onClick={() => saveLead(r)}
                          disabled={savingIds.has(r.placeId)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                          {savingIds.has(r.placeId) ? "Guardando..." : "💾 Guardar Lead"}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Load more */}
              {nextPageToken && (
                <div className="mt-6 text-center">
                  <button
                    onClick={() => doSearch(nextPageToken)}
                    disabled={searching}
                    className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
                  >
                    {searching ? "Cargando más..." : "Cargar más resultados"}
                  </button>
                </div>
              )}
            </div>
          )}

          {searching && results.length === 0 && (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
                <p className="text-gray-500">Buscando negocios...</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══ SAVED LEADS TAB ═══ */}
      {tab === "saved" && (
        <div>
          {/* Status filter pills */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <button
              onClick={() => setFilterStatus("ALL")}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filterStatus === "ALL"
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Todos ({totalSaved})
            </button>
            {STATUS_OPTIONS.map((s) => (
              <button
                key={s.value}
                onClick={() => setFilterStatus(s.value)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  filterStatus === s.value
                    ? "bg-gray-900 text-white"
                    : `${s.color} hover:opacity-80`
                }`}
              >
                {s.label} ({counts[s.value] ?? 0})
              </button>
            ))}
          </div>

          {/* Search/filter bar */}
          <div className="flex gap-3 mb-6">
            <input
              type="text"
              value={filterQ}
              onChange={(e) => setFilterQ(e.target.value)}
              placeholder="Buscar por nombre, teléfono o dirección..."
              className="flex-1 bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400"
            />
            <input
              type="text"
              value={filterCity}
              onChange={(e) => setFilterCity(e.target.value)}
              placeholder="Filtrar por ciudad..."
              className="w-48 bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400"
            />
            <button
              onClick={loadLeads}
              className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors shrink-0"
            >
              Filtrar
            </button>
          </div>

          {loadingLeads ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          ) : leads.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-4xl mb-3">📋</p>
              <p className="text-lg font-medium">No hay leads guardados</p>
              <p className="text-sm mt-1">
                Busca negocios en la pestaña &quot;Buscar Negocios&quot; y guárdalos aquí.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {leads.map((lead) => {
                const meta = statusMeta(lead.status);
                return (
                  <div
                    key={lead.id}
                    className="bg-white border border-gray-200 rounded-xl p-5"
                  >
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2 flex-wrap">
                          <h3 className="font-semibold text-gray-900">
                            {lead.name}
                          </h3>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${meta.color}`}
                          >
                            {meta.label}
                          </span>
                          {lead.rating && (
                            <span className="text-xs bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded-lg">
                              ⭐ {lead.rating.toFixed(1)}
                              {lead.totalRatings ? ` (${lead.totalRatings})` : ""}
                            </span>
                          )}
                          {lead.city && (
                            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-lg">
                              📍 {lead.city}
                            </span>
                          )}
                        </div>

                        {lead.address && (
                          <p className="text-sm text-gray-500 mt-1">{lead.address}</p>
                        )}

                        <div className="flex flex-wrap gap-3 mt-2">
                          {lead.phone && (
                            <a
                              href={`tel:${lead.phone}`}
                              className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
                            >
                              📞 {lead.phone}
                            </a>
                          )}
                          {lead.website && (
                            <a
                              href={lead.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
                            >
                              🌐 Web
                            </a>
                          )}
                          {lead.mapsUrl && (
                            <a
                              href={lead.mapsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
                            >
                              🗺️ Maps
                            </a>
                          )}
                        </div>

                        {/* Notes */}
                        {editingNotes === lead.id ? (
                          <div className="mt-3 flex gap-2">
                            <input
                              type="text"
                              value={notesText}
                              onChange={(e) => setNotesText(e.target.value)}
                              placeholder="Notas sobre este prospecto..."
                              className="flex-1 bg-gray-50 border border-gray-200 rounded px-3 py-1.5 text-sm text-gray-900"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === "Enter") saveNotes(lead.id);
                                if (e.key === "Escape") setEditingNotes(null);
                              }}
                            />
                            <button
                              onClick={() => saveNotes(lead.id)}
                              className="text-sm px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                              Guardar
                            </button>
                            <button
                              onClick={() => setEditingNotes(null)}
                              className="text-sm px-3 py-1.5 text-gray-500 hover:text-gray-700"
                            >
                              Cancelar
                            </button>
                          </div>
                        ) : (
                          <div className="mt-2">
                            {lead.notes ? (
                              <p
                                className="text-sm text-gray-600 italic cursor-pointer hover:text-gray-900"
                                onClick={() => {
                                  setEditingNotes(lead.id);
                                  setNotesText(lead.notes ?? "");
                                }}
                              >
                                📝 {lead.notes}
                              </p>
                            ) : (
                              <button
                                onClick={() => {
                                  setEditingNotes(lead.id);
                                  setNotesText("");
                                }}
                                className="text-xs text-gray-400 hover:text-blue-600"
                              >
                                + Agregar nota
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="shrink-0 flex flex-col gap-2 sm:items-end">
                        <select
                          value={lead.status}
                          onChange={(e) =>
                            updateLeadStatus(lead.id, e.target.value)
                          }
                          className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 cursor-pointer"
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s.value} value={s.value}>
                              {s.label}
                            </option>
                          ))}
                        </select>

                        {lead.phone && (
                          <a
                            href={`https://wa.me/${lead.phone.replace(/[^0-9+]/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-center px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                          >
                            💬 WhatsApp
                          </a>
                        )}

                        <button
                          onClick={() => deleteLead(lead.id)}
                          className="text-xs text-red-400 hover:text-red-600 transition-colors"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
