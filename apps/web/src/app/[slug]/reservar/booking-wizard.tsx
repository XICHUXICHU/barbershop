"use client";

import { useState, useEffect } from "react";
import type { ServiceDto, BarberDto, TimeSlotDto } from "@barber/shared";
import { AppIcon } from "@/components/app-icon";

interface Props {
  barbershopId: string;
  services: ServiceDto[];
  barbers: BarberDto[];
}

type Step = "service" | "barber" | "datetime" | "info" | "confirmed";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const DAY_HEADERS = ["D", "L", "M", "M", "J", "V", "S"];

const serviceIcons: Record<number, string> = {
  0: "content_cut",
  1: "face",
  2: "brush",
  3: "spa",
  4: "clean_hands",
  5: "self_improvement",
};

export function BookingWizard({ barbershopId, services, barbers }: Props) {
  const [step, setStep] = useState<Step>("service");
  const [selectedService, setSelectedService] = useState<ServiceDto | null>(null);
  const [selectedBarber, setSelectedBarber] = useState<BarberDto | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [slots, setSlots] = useState<TimeSlotDto[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlotDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Calendar state
  const [calendarDate, setCalendarDate] = useState(new Date());

  // Customer form
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Calendar helpers
  function getDaysInMonth(year: number, month: number) {
    return new Date(year, month + 1, 0).getDate();
  }

  function getFirstDayOfMonth(year: number, month: number) {
    return new Date(year, month, 1).getDay();
  }

  function toDateString(year: number, month: number, day: number) {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  const calYear = calendarDate.getFullYear();
  const calMonth = calendarDate.getMonth();
  const daysInMonth = getDaysInMonth(calYear, calMonth);
  const firstDay = getFirstDayOfMonth(calYear, calMonth);

  // Previous month overflow days
  const prevMonthDays = getDaysInMonth(calYear, calMonth - 1);
  const overflowDays = Array.from({ length: firstDay }, (_, i) => prevMonthDays - firstDay + 1 + i);

  function prevMonth() {
    setCalendarDate(new Date(calYear, calMonth - 1, 1));
  }

  function nextMonth() {
    setCalendarDate(new Date(calYear, calMonth + 1, 1));
  }

  function isPastDay(day: number) {
    const d = new Date(calYear, calMonth, day);
    d.setHours(0, 0, 0, 0);
    return d < today;
  }

  async function loadSlots(date: string) {
    if (!selectedService || !selectedBarber) return;
    setSelectedDate(date);
    setSelectedSlot(null);
    setLoading(true);
    setError("");
    setSlots([]);
    try {
      const params = new URLSearchParams({
        barbershopId,
        barberId: selectedBarber.id,
        serviceId: selectedService.id,
        date,
      });
      const res = await fetch(`${API_BASE}/availability?${params}`);
      const data: TimeSlotDto[] = await res.json();
      setSlots(data);
    } catch {
      setError("No se pudieron cargar los horarios. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  async function handleBook() {
    if (!selectedService || !selectedBarber || !selectedSlot) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/appointments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          barbershopId,
          barberId: selectedBarber.id,
          serviceId: selectedService.id,
          customerName: name,
          customerPhone: phone,
          customerEmail: email || undefined,
          date: selectedDate,
          startTime: selectedSlot.startTime,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message ?? "Error al confirmar la reserva");
      }
      setStep("confirmed");
    } catch (e: unknown) {
      setError(
        e instanceof Error ? e.message : "Error desconocido al procesar la reserva."
      );
    } finally {
      setLoading(false);
    }
  }

  const stepIndex = { service: 0, barber: 1, datetime: 2, info: 2, confirmed: 3 };
  const currentStepIndex = stepIndex[step];

  return (
    <div className="space-y-8">
      {/* ═══ Stepper ═══ */}
      {step !== "confirmed" && (
        <div className="flex items-center justify-between mb-4 max-w-md mx-auto md:mx-0">
          {[
            { label: "Servicio", idx: 0 },
            { label: "Barbero", idx: 1 },
            { label: "Hora", idx: 2 },
          ].map(({ label, idx }) => (
            <div key={label} className="flex items-center">
              {idx > 0 && (
                <div
                  className={`h-[1px] w-12 sm:w-16 mx-2 sm:mx-4 transition-colors ${
                    currentStepIndex >= idx
                      ? "bg-hc-primary"
                      : "bg-hc-outline-variant/30"
                  }`}
                />
              )}
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                    currentStepIndex >= idx
                      ? "bg-hc-primary text-hc-on-primary shadow-[0_0_20px_rgba(233,195,73,0.3)]"
                      : "border border-hc-outline-variant/30 text-hc-on-surface-variant"
                  }`}
                >
                  {idx + 1}
                </div>
                <span
                  className={`text-[10px] mt-2 uppercase tracking-widest font-bold ${
                    currentStepIndex >= idx
                      ? "text-hc-primary"
                      : "text-hc-on-surface-variant opacity-50"
                  }`}
                >
                  {label}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ═══ Error ═══ */}
      {error && (
        <div className="bg-hc-error-container/20 border-l-4 border-hc-error p-4 rounded-md">
          <p className="text-hc-error text-sm font-medium">{error}</p>
        </div>
      )}

      {/* ═══ Step 1: Servicios (Bento) ═══ */}
      {step === "service" && (
        <section className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {services.map((service, i) => {
            const isFirst = i === 0;

            if (isFirst) {
              return (
                <button
                  key={service.id}
                  onClick={() => {
                    setSelectedService(service);
                    setStep("barber");
                  }}
                  className="md:col-span-8 group cursor-pointer relative overflow-hidden rounded-xl bg-hc-surface-container-low border border-transparent hover:border-hc-primary/20 transition-all duration-500 text-left"
                >
                  <div className="aspect-[16/9] relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-hc-surface-container-high to-hc-surface-container-lowest flex items-center justify-center p-3">
                      {service.imageUrl ? (
                        <img src={service.imageUrl} alt={service.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700" />
                      ) : (
                        <AppIcon name={serviceIcons[0]} className="text-hc-primary/30 text-[100px] group-hover:scale-105 transition-transform duration-700" />
                      )}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-hc-surface-container-low via-transparent to-transparent" />
                    <div className="absolute bottom-0 left-0 p-8 w-full">
                      <div className="flex justify-between items-end w-full">
                        <div>
                          <h3 className="text-3xl font-bold font-headline text-hc-primary mb-2">
                            {service.name}
                          </h3>
                          <p className="text-hc-on-surface-variant max-w-sm">
                            {service.description ||
                              "Nuestro servicio exclusivo con consulta personalizada y acabado de precisión."}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-label uppercase tracking-widest text-hc-outline">
                            {service.durationMinutes} Min
                          </span>
                          <div className="text-2xl font-bold text-hc-on-surface">
                            ${service.priceAmount}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              );
            }

            return (
              <button
                key={service.id}
                onClick={() => {
                  setSelectedService(service);
                  setStep("barber");
                }}
                className={`${
                  i <= 2 ? "md:col-span-4" : "md:col-span-4"
                } p-6 rounded-xl bg-hc-surface-container-high border border-hc-outline-variant/10 hover:border-hc-primary/40 cursor-pointer transition-all text-left flex flex-col justify-between`}
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    {service.imageUrl ? (
                      <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-hc-surface-container-lowest/60 p-1">
                        <img src={service.imageUrl} alt={service.name} className="w-full h-full object-contain" />
                      </div>
                    ) : (
                      <AppIcon name={serviceIcons[i % 6]} className="text-hc-primary text-3xl" />
                    )}
                    <span className="text-xs font-bold text-hc-outline uppercase tracking-widest">
                      {service.durationMinutes} Min
                    </span>
                  </div>
                  <h3 className="text-xl font-bold font-headline mb-2 text-hc-on-surface">
                    {service.name}
                  </h3>
                  <p className="text-sm text-hc-on-surface-variant mb-6">
                    {service.description ||
                      `Servicio profesional de ${service.durationMinutes} minutos.`}
                  </p>
                </div>
                <div className="text-xl font-bold text-hc-primary">
                  ${service.priceAmount}
                </div>
              </button>
            );
          })}
        </section>
      )}

      {/* ═══ Step 2: Barberos ═══ */}
      {step === "barber" && (
        <section>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setStep("service")}
                className="p-2 hover:bg-hc-surface-container-high rounded-lg transition-colors"
              >
                <AppIcon name="arrow_back" className="text-hc-on-surface-variant text-xl" />
              </button>
              <h2 className="text-3xl font-bold font-headline">
                Selecciona tu{" "}
                <span className="text-hc-primary italic">Barbero</span>
              </h2>
            </div>
            <div className="h-px flex-1 bg-hc-outline-variant/20 mx-8 hidden md:block" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {barbers.map((barber) => (
              <button
                key={barber.id}
                onClick={() => {
                  setSelectedBarber(barber);
                  setStep("datetime");
                }}
                className="bg-hc-surface-container-low p-6 rounded-xl border border-transparent hover:border-hc-primary/30 transition-all text-center group cursor-pointer"
              >
                <div className="relative inline-block mb-4">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-hc-primary/20 group-hover:border-hc-primary transition-colors">
                    {barber.avatarUrl ? (
                      <img
                        alt={barber.name}
                        className="w-full h-full object-cover"
                        src={barber.avatarUrl}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-hc-surface-container-high text-3xl font-headline text-hc-primary/50">
                        {barber.name.charAt(0)}
                      </div>
                    )}
                  </div>
                </div>
                <h4 className="font-bold text-lg text-hc-on-surface">
                  {barber.name}
                </h4>
                <p className="text-xs uppercase tracking-widest text-hc-outline mt-1">
                  Barbero Profesional
                </p>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* ═══ Step 3: Fecha & Hora ═══ */}
      {step === "datetime" && (
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Calendar */}
          <div>
            <div className="flex items-center gap-4 mb-8">
              <button
                onClick={() => setStep("barber")}
                className="p-2 hover:bg-hc-surface-container-high rounded-lg transition-colors"
              >
                <AppIcon name="arrow_back" className="text-hc-on-surface-variant text-xl" />
              </button>
              <h2 className="text-3xl font-bold font-headline">
                Elige <span className="text-hc-primary italic">Fecha</span>
              </h2>
            </div>

            <div className="bg-hc-surface-container-low p-8 rounded-xl border border-hc-outline-variant/10">
              <div className="flex items-center justify-between mb-8">
                <span className="font-bold font-headline text-xl">
                  {MONTHS[calMonth]} {calYear}
                </span>
                <div className="flex space-x-4">
                  <button
                    onClick={prevMonth}
                    className="p-2 hover:bg-hc-surface-container-high rounded-lg transition-colors"
                  >
                    <AppIcon name="chevron_left" className="text-xl" />
                  </button>
                  <button
                    onClick={nextMonth}
                    className="p-2 hover:bg-hc-surface-container-high rounded-lg transition-colors"
                  >
                    <AppIcon name="chevron_right" className="text-xl" />
                  </button>
                </div>
              </div>

              {/* Day headers */}
              <div className="grid grid-cols-7 gap-2 text-center text-xs uppercase tracking-widest text-hc-outline mb-4">
                {DAY_HEADERS.map((d, i) => (
                  <div key={`h-${i}`}>{d}</div>
                ))}
              </div>

              {/* Days grid */}
              <div className="grid grid-cols-7 gap-2 text-center font-bold">
                {/* Overflow from previous month */}
                {overflowDays.map((d) => (
                  <div key={`o-${d}`} className="p-3 text-hc-outline/30">
                    {d}
                  </div>
                ))}

                {/* Current month days */}
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(
                  (day) => {
                    const dateStr = toDateString(calYear, calMonth, day);
                    const isSelected = selectedDate === dateStr;
                    const past = isPastDay(day);

                    return (
                      <button
                        key={day}
                        disabled={past}
                        onClick={() => loadSlots(dateStr)}
                        className={`p-3 rounded-lg transition-all ${
                          isSelected
                            ? "bg-hc-primary text-hc-on-primary shadow-[0_0_15px_rgba(233,195,73,0.4)]"
                            : past
                            ? "text-hc-outline/30 cursor-not-allowed"
                            : "hover:bg-hc-primary/10 cursor-pointer"
                        }`}
                      >
                        {day}
                      </button>
                    );
                  }
                )}
              </div>
            </div>
          </div>

          {/* Time Slots */}
          <div>
            <h2 className="text-3xl font-bold font-headline mb-8">
              Selecciona <span className="text-hc-primary italic">Hora</span>
            </h2>

            {!selectedDate ? (
              <div className="bg-hc-surface-container-low rounded-xl border border-hc-outline-variant/10 p-12 text-center">
                <AppIcon name="calendar_today" className="text-hc-outline text-4xl mb-4" />
                <p className="text-hc-on-surface-variant">
                  Selecciona una fecha en el calendario
                </p>
              </div>
            ) : loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-hc-primary border-t-transparent" />
              </div>
            ) : slots.length === 0 ? (
              <div className="bg-hc-surface-container-low rounded-xl border border-hc-outline-variant/10 p-12 text-center">
                <AppIcon name="event_busy" className="text-hc-outline text-4xl mb-4" />
                <p className="text-hc-on-surface-variant font-medium">
                  No hay citas disponibles para este día.
                </p>
                <p className="text-sm text-hc-outline mt-2">
                  Selecciona otra fecha.
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto pr-2">
                  {slots.map((slot) => {
                    const isAvailable = slot.available;
                    const isSelected =
                      selectedSlot?.startTime === slot.startTime;

                    return (
                      <button
                        key={slot.startTime}
                        disabled={!isAvailable}
                        onClick={() => {
                          setSelectedSlot(slot);
                          setStep("info");
                        }}
                        className={`py-4 rounded-lg font-bold transition-all ${
                          isSelected
                            ? "bg-hc-primary text-hc-on-primary shadow-xl shadow-hc-primary/10"
                            : !isAvailable
                            ? "bg-hc-surface-container-low border border-hc-outline-variant/20 opacity-20 cursor-not-allowed"
                            : "bg-hc-surface-container-low border border-hc-outline-variant/20 hover:border-hc-primary/60"
                        }`}
                      >
                        {slot.startTime}
                      </button>
                    );
                  })}
                </div>

                {/* Booking Summary (visible when slot selected in datetime step) */}
                {selectedSlot && (
                  <div className="mt-8 p-6 bg-hc-surface-container-highest rounded-xl border-l-4 border-hc-primary">
                    <div className="flex items-center space-x-6 mb-4">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-hc-surface-container-high flex items-center justify-center">
                        {selectedBarber?.avatarUrl ? (
                          <img
                            alt={selectedBarber.name}
                            className="w-full h-full object-cover"
                            src={selectedBarber.avatarUrl}
                          />
                        ) : (
                          <span className="text-xl font-headline text-hc-primary/50">
                            {selectedBarber?.name.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-widest text-hc-outline">
                          Barbero Seleccionado
                        </p>
                        <p className="font-bold text-hc-on-surface">
                          {selectedBarber?.name}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-hc-on-surface-variant">
                          {selectedService?.name}
                        </span>
                        <span className="font-bold">
                          ${selectedService?.priceAmount ?? ""}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-hc-on-surface-variant">
                          {selectedDate} a las {selectedSlot.startTime}
                        </span>
                        <span className="font-bold">
                          {selectedService?.durationMinutes} Min
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setStep("info")}
                      className="w-full mt-6 bg-hc-primary text-hc-on-primary py-4 rounded-lg font-bold text-lg hover:scale-[0.98] transition-transform"
                    >
                      Continuar
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      )}

      {/* ═══ Step 4: Datos del Cliente ═══ */}
      {step === "info" && (
        <section className="max-w-lg mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => setStep("datetime")}
              className="p-2 hover:bg-hc-surface-container-high rounded-lg transition-colors"
            >
              <AppIcon name="arrow_back" className="text-hc-on-surface-variant text-xl" />
            </button>
            <h2 className="text-3xl font-bold font-headline">Último Paso</h2>
          </div>

          {/* Summary Card */}
          <div className="bg-hc-surface-container-highest rounded-xl p-6 border-l-4 border-hc-primary mb-8">
            <div className="flex items-center space-x-6 mb-4">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-hc-surface-container-high flex items-center justify-center">
                {selectedBarber?.avatarUrl ? (
                  <img
                    alt={selectedBarber.name}
                    className="w-full h-full object-cover"
                    src={selectedBarber.avatarUrl}
                  />
                ) : (
                  <span className="text-xl font-headline text-hc-primary/50">
                    {selectedBarber?.name.charAt(0)}
                  </span>
                )}
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-hc-outline">
                  Barbero
                </p>
                <p className="font-bold text-hc-on-surface">
                  {selectedBarber?.name}
                </p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-hc-on-surface-variant">
                  {selectedService?.name}
                </span>
                <span className="font-bold">
                  ${selectedService?.priceAmount ?? ""}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-hc-on-surface-variant">
                  {selectedDate} a las {selectedSlot?.startTime}
                </span>
                <span className="font-bold">
                  {selectedService?.durationMinutes} Min
                </span>
              </div>
            </div>
          </div>

          {/* Form */}
          <form
            className="space-y-5"
            onSubmit={(e) => {
              e.preventDefault();
              handleBook();
            }}
          >
            <div>
              <label className="block text-sm font-label font-medium text-hc-on-surface-variant mb-2 uppercase tracking-widest">
                Nombre completo <span className="text-hc-error">*</span>
              </label>
              <input
                type="text"
                placeholder="Ej. Juan Pérez"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-hc-surface-container-low border border-hc-outline-variant/30 rounded-lg px-4 py-3.5 text-hc-on-surface placeholder-hc-outline focus:ring-2 focus:ring-hc-primary focus:border-hc-primary transition-all outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-label font-medium text-hc-on-surface-variant mb-2 uppercase tracking-widest">
                Teléfono o WhatsApp <span className="text-hc-error">*</span>
              </label>
              <input
                type="tel"
                placeholder="Ej. +52 123 456 7890"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full bg-hc-surface-container-low border border-hc-outline-variant/30 rounded-lg px-4 py-3.5 text-hc-on-surface placeholder-hc-outline focus:ring-2 focus:ring-hc-primary focus:border-hc-primary transition-all outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-label font-medium text-hc-on-surface-variant mb-2 uppercase tracking-widest">
                Correo electrónico (Opcional)
              </label>
              <input
                type="email"
                placeholder="ejemplo@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-hc-surface-container-low border border-hc-outline-variant/30 rounded-lg px-4 py-3.5 text-hc-on-surface placeholder-hc-outline focus:ring-2 focus:ring-hc-primary focus:border-hc-primary transition-all outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !name || !phone}
              className="w-full py-4 mt-4 rounded-lg bg-hc-primary text-hc-on-primary font-bold text-lg hover:bg-hc-primary-container transition-all shadow-xl shadow-hc-primary/10 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-hc-on-primary border-t-transparent mr-3" />
                  Procesando reserva...
                </>
              ) : (
                "Confirmar Cita"
              )}
            </button>
          </form>
        </section>
      )}

      {/* ═══ Step 5: Confirmada ═══ */}
      {step === "confirmed" && (
        <section className="text-center py-16 px-4 flex flex-col items-center">
          <div className="w-24 h-24 bg-hc-primary/20 text-hc-primary rounded-full flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(233,195,73,0.2)]">
            <AppIcon name="check_circle" className="text-5xl" />
          </div>
          <h3 className="text-4xl font-bold font-headline text-hc-on-surface mb-3">
            ¡Cita Confirmada!
          </h3>
          <p className="text-hc-on-surface-variant text-lg mb-10 max-w-sm">
            Tu reserva con <strong className="text-hc-primary">{selectedBarber?.name}</strong> se
            ha guardado correctamente.
          </p>

          <div className="w-full max-w-md bg-hc-surface-container-low border border-hc-outline-variant/10 rounded-xl p-8 shadow-2xl mb-10 space-y-4 text-left divide-y divide-hc-outline-variant/10 text-sm">
            <div className="pb-3 flex justify-between">
              <span className="text-hc-on-surface-variant">Servicio</span>
              <span className="font-bold text-hc-on-surface">
                {selectedService?.name}
              </span>
            </div>
            <div className="py-3 flex justify-between">
              <span className="text-hc-on-surface-variant">Día</span>
              <span className="font-bold text-hc-on-surface">
                {selectedDate}
              </span>
            </div>
            <div className="py-3 flex justify-between">
              <span className="text-hc-on-surface-variant">Hora</span>
              <span className="bg-hc-primary/20 text-hc-primary px-3 py-1 rounded-full font-bold text-base">
                {selectedSlot?.startTime}
              </span>
            </div>
            <div className="pt-3 flex justify-between">
              <span className="text-hc-on-surface-variant">Total</span>
              <span className="font-bold text-hc-primary text-lg">
                ${selectedService?.priceAmount ?? ""}
              </span>
            </div>
          </div>

          <button
            onClick={() => window.location.reload()}
            className="text-hc-primary font-bold hover:underline transition-colors uppercase tracking-widest text-sm"
          >
            Hacer otra reserva
          </button>
        </section>
      )}
    </div>
  );
}
