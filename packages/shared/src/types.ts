// ─── Barbershop ───
export interface BarbershopDto {
  id: string;
  name: string;
  slug: string;
  phone: string;
  address: string;
  logoUrl: string | null;
  coverUrl: string | null;
  servicesPosterUrl: string | null;
  isActive: boolean;
  createdAt: string;
}

// ─── Barber ───
export interface BarberDto {
  id: string;
  barbershopId: string;
  name: string;
  avatarUrl: string | null;
  isActive: boolean;
}

// ─── Service ───
export interface ServiceDto {
  id: string;
  barbershopId: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  durationMinutes: number;
  priceAmount: number;
  priceCurrency: string;
  isActive: boolean;
}

// ─── Customer ───
export interface CustomerDto {
  id: string;
  name: string;
  phone: string;
  email: string | null;
}

// ─── Appointment ───
export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "no_show";

export interface AppointmentDto {
  id: string;
  barbershopId: string;
  barberId: string;
  serviceId: string;
  customerId: string;
  date: string; // ISO date YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  status: AppointmentStatus;
  notes: string | null;
  createdAt: string;
}

// ─── Schedule / Availability ───
export interface DayScheduleDto {
  dayOfWeek: number; // 0=Sunday … 6=Saturday
  openTime: string; // HH:mm
  closeTime: string; // HH:mm
  isOpen: boolean;
}

export interface TimeSlotDto {
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  available: boolean;
}

// ─── API Request/Response helpers ───
export interface CreateAppointmentRequest {
  barbershopId: string;
  barberId: string;
  serviceId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  date: string;
  startTime: string;
  notes?: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  statusCode: number;
  message: string;
  errors?: Record<string, string[]>;
}
