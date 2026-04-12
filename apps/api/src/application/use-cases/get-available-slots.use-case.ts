import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import {
  APPOINTMENT_REPOSITORY,
  IAppointmentRepository,
} from "../../domain/repositories";
import {
  SERVICE_REPOSITORY,
  IServiceRepository,
} from "../../domain/repositories";
import { PrismaService } from "../../infrastructure/database/prisma.service";

export interface TimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
}

@Injectable()
export class GetAvailableSlotsUseCase {
  constructor(
    @Inject(APPOINTMENT_REPOSITORY)
    private readonly appointmentRepo: IAppointmentRepository,
    @Inject(SERVICE_REPOSITORY)
    private readonly serviceRepo: IServiceRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(
    barbershopId: string,
    barberId: string,
    serviceId: string,
    date: string, // YYYY-MM-DD
  ): Promise<TimeSlot[]> {
    // 1. Validate service
    const service = await this.serviceRepo.findById(serviceId);
    if (!service || service.barbershopId !== barbershopId) {
      throw new NotFoundException("Service not found");
    }

    // 2. Get schedule for the day
    const dayOfWeek = new Date(date + "T00:00:00Z").getUTCDay();
    const schedule = await this.prisma.barbershopSchedule.findUnique({
      where: {
        barbershopId_dayOfWeek: { barbershopId, dayOfWeek },
      },
    });

    const isClosed = schedule ? !schedule.isOpen : dayOfWeek === 0; // Default: closed on Sunday
    if (isClosed) {
      return [];
    }

    const startStr = schedule ? schedule.openTime : "09:00";
    const endStr = schedule ? schedule.closeTime : "19:00";

    // 3. Get existing appointments for barber on that day
    const dateObj = new Date(date + "T00:00:00Z");
    const appointments = await this.appointmentRepo.findByBarberAndDate(
      barberId,
      dateObj,
    );

    // 4. Generate slots
    const slots: TimeSlot[] = [];
    const step = 30; // slot interval in minutes
    let cursor = this.toMinutes(startStr);
    const closeMin = this.toMinutes(endStr);

    while (cursor + service.durationMinutes <= closeMin) {
      const start = this.fromMinutes(cursor);
      const end = this.fromMinutes(cursor + service.durationMinutes);

      const isBlocked = appointments.some(
        (a) => a.isActive && a.overlaps(start, end),
      );

      slots.push({ startTime: start, endTime: end, available: !isBlocked });
      cursor += step;
    }

    return slots;
  }

  private toMinutes(t: string): number {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  }

  private fromMinutes(m: number): string {
    const h = Math.floor(m / 60) % 24;
    const min = m % 60;
    return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
  }
}
