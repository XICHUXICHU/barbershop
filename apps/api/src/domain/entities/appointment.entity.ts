export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "no_show";

export class Appointment {
  constructor(
    public readonly id: string,
    public readonly barbershopId: string,
    public readonly barberId: string,
    public readonly serviceId: string,
    public readonly customerId: string,
    public readonly date: Date,
    public readonly startTime: string, // HH:mm
    public readonly endTime: string,   // HH:mm
    public readonly status: AppointmentStatus,
    public readonly notes: string | null,
    public readonly createdAt: Date,
  ) {}

  get isActive(): boolean {
    return this.status === "pending" || this.status === "confirmed";
  }

  /** Returns true if this appointment overlaps with the given time range */
  overlaps(start: string, end: string): boolean {
    return this.startTime < end && this.endTime > start;
  }
}
