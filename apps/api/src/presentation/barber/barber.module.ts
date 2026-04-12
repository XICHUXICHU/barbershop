import { Module } from "@nestjs/common";
import { BarberController } from "./barber.controller";
import { BARBER_REPOSITORY } from "../../domain/repositories";
import { PrismaBarberRepository } from "../../infrastructure/repositories";

@Module({
  controllers: [BarberController],
  providers: [
    {
      provide: BARBER_REPOSITORY,
      useClass: PrismaBarberRepository,
    },
  ],
  exports: [BARBER_REPOSITORY],
})
export class BarberModule {}
