import { Module } from "@nestjs/common";
import { BarbershopController } from "./barbershop.controller";
import {
  GetBarbershopBySlugUseCase,
  CreateBarbershopUseCase,
} from "../../application/use-cases";
import { BARBERSHOP_REPOSITORY } from "../../domain/repositories";
import { PrismaBarbershopRepository } from "../../infrastructure/repositories";

@Module({
  controllers: [BarbershopController],
  providers: [
    GetBarbershopBySlugUseCase,
    CreateBarbershopUseCase,
    {
      provide: BARBERSHOP_REPOSITORY,
      useClass: PrismaBarbershopRepository,
    },
  ],
  exports: [BARBERSHOP_REPOSITORY],
})
export class BarbershopModule {}
