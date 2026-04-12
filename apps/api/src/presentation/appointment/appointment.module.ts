import { Module } from "@nestjs/common";
import { AppointmentController } from "./appointment.controller";
import {
  BookAppointmentUseCase,
  CancelAppointmentUseCase,
} from "../../application/use-cases";
import {
  APPOINTMENT_REPOSITORY,
  CUSTOMER_REPOSITORY,
  SERVICE_REPOSITORY,
  BARBER_REPOSITORY,
} from "../../domain/repositories";
import {
  PrismaAppointmentRepository,
  PrismaCustomerRepository,
  PrismaServiceRepository,
  PrismaBarberRepository,
} from "../../infrastructure/repositories";

@Module({
  controllers: [AppointmentController],
  providers: [
    BookAppointmentUseCase,
    CancelAppointmentUseCase,
    {
      provide: APPOINTMENT_REPOSITORY,
      useClass: PrismaAppointmentRepository,
    },
    {
      provide: CUSTOMER_REPOSITORY,
      useClass: PrismaCustomerRepository,
    },
    {
      provide: SERVICE_REPOSITORY,
      useClass: PrismaServiceRepository,
    },
    {
      provide: BARBER_REPOSITORY,
      useClass: PrismaBarberRepository,
    },
  ],
})
export class AppointmentModule {}
