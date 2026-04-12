import { Module } from "@nestjs/common";
import { AvailabilityController } from "./availability.controller";
import { GetAvailableSlotsUseCase } from "../../application/use-cases";
import {
  APPOINTMENT_REPOSITORY,
  SERVICE_REPOSITORY,
} from "../../domain/repositories";
import {
  PrismaAppointmentRepository,
  PrismaServiceRepository,
} from "../../infrastructure/repositories";

@Module({
  controllers: [AvailabilityController],
  providers: [
    GetAvailableSlotsUseCase,
    {
      provide: APPOINTMENT_REPOSITORY,
      useClass: PrismaAppointmentRepository,
    },
    {
      provide: SERVICE_REPOSITORY,
      useClass: PrismaServiceRepository,
    },
  ],
})
export class AvailabilityModule {}
