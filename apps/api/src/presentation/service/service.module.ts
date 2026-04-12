import { Module } from "@nestjs/common";
import { ServiceController } from "./service.controller";
import { SERVICE_REPOSITORY } from "../../domain/repositories";
import { PrismaServiceRepository } from "../../infrastructure/repositories";

@Module({
  controllers: [ServiceController],
  providers: [
    {
      provide: SERVICE_REPOSITORY,
      useClass: PrismaServiceRepository,
    },
  ],
  exports: [SERVICE_REPOSITORY],
})
export class ServiceModule {}
