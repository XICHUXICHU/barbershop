import {
  Inject,
  Injectable,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import {
  APPOINTMENT_REPOSITORY,
  IAppointmentRepository,
  CUSTOMER_REPOSITORY,
  ICustomerRepository,
  SERVICE_REPOSITORY,
  IServiceRepository,
  BARBER_REPOSITORY,
  IBarberRepository,
} from "../../domain/repositories";
import { Appointment } from "../../domain/entities";

export interface BookAppointmentInput {
  barbershopId: string;
  barberId: string;
  serviceId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  notes?: string;
}

@Injectable()
export class BookAppointmentUseCase {
  constructor(
    @Inject(APPOINTMENT_REPOSITORY)
    private readonly appointmentRepo: IAppointmentRepository,
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepo: ICustomerRepository,
    @Inject(SERVICE_REPOSITORY)
    private readonly serviceRepo: IServiceRepository,
    @Inject(BARBER_REPOSITORY)
    private readonly barberRepo: IBarberRepository,
  ) {}

  async execute(input: BookAppointmentInput): Promise<Appointment> {
    // 1. Validate barber exists
    const barber = await this.barberRepo.findById(input.barberId);
    if (!barber || barber.barbershopId !== input.barbershopId) {
      throw new NotFoundException("Barber not found in this barbershop");
    }

    // 2. Validate service & compute end time
    const service = await this.serviceRepo.findById(input.serviceId);
    if (!service || service.barbershopId !== input.barbershopId) {
      throw new NotFoundException("Service not found in this barbershop");
    }
    const endTime = this.addMinutes(input.startTime, service.durationMinutes);

    // 3. Check for overlapping appointments (prevent double booking)
    const dateObj = new Date(input.date + "T00:00:00Z");
    const existing = await this.appointmentRepo.findByBarberAndDate(
      input.barberId,
      dateObj,
    );
    const hasConflict = existing.some(
      (appt) => appt.isActive && appt.overlaps(input.startTime, endTime),
    );
    if (hasConflict) {
      throw new BadRequestException(
        "This time slot is already booked for this barber",
      );
    }

    // 4. Upsert customer
    const customer = await this.customerRepo.upsertByPhone({
      name: input.customerName,
      phone: input.customerPhone,
      email: input.customerEmail ?? null,
    });

    // 5. Create appointment
    return this.appointmentRepo.create({
      barbershopId: input.barbershopId,
      barberId: input.barberId,
      serviceId: input.serviceId,
      customerId: customer.id,
      date: dateObj,
      startTime: input.startTime,
      endTime,
      status: "pending",
      notes: input.notes ?? null,
    });
  }

  private addMinutes(time: string, minutes: number): string {
    const [h, m] = time.split(":").map(Number);
    const totalMinutes = h * 60 + m + minutes;
    const newH = Math.floor(totalMinutes / 60) % 24;
    const newM = totalMinutes % 60;
    return `${String(newH).padStart(2, "0")}:${String(newM).padStart(2, "0")}`;
  }
}
