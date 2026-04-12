import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import {
  APPOINTMENT_REPOSITORY,
  IAppointmentRepository,
} from "../../domain/repositories";
import { Appointment } from "../../domain/entities";

@Injectable()
export class CancelAppointmentUseCase {
  constructor(
    @Inject(APPOINTMENT_REPOSITORY)
    private readonly repo: IAppointmentRepository,
  ) {}

  async execute(appointmentId: string): Promise<Appointment> {
    const appt = await this.repo.findById(appointmentId);
    if (!appt) {
      throw new NotFoundException("Appointment not found");
    }
    return this.repo.updateStatus(appointmentId, "cancelled");
  }
}
