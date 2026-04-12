import { Appointment, AppointmentStatus } from "../entities";

export interface CreateAppointmentData {
  barbershopId: string;
  barberId: string;
  serviceId: string;
  customerId: string;
  date: Date;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  notes: string | null;
}

export interface IAppointmentRepository {
  findById(id: string): Promise<Appointment | null>;
  findByBarbershopAndDate(
    barbershopId: string,
    date: Date,
  ): Promise<Appointment[]>;
  findByBarberAndDate(barberId: string, date: Date): Promise<Appointment[]>;
  create(data: CreateAppointmentData): Promise<Appointment>;
  updateStatus(id: string, status: AppointmentStatus): Promise<Appointment>;
}

export const APPOINTMENT_REPOSITORY = Symbol("IAppointmentRepository");
