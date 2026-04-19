import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "./infrastructure/database/prisma.module";
import { BarbershopModule } from "./presentation/barbershop/barbershop.module";
import { ServiceModule } from "./presentation/service/service.module";
import { BarberModule } from "./presentation/barber/barber.module";
import { AppointmentModule } from "./presentation/appointment/appointment.module";
import { AvailabilityModule } from "./presentation/availability/availability.module";
import { ScheduleModule } from "./presentation/schedule/schedule.module";
import { AdminModule } from "./presentation/admin/admin.module";
import { UploadModule } from "./presentation/upload/upload.module";
import { ReportsModule } from "./presentation/reports/reports.module";
import { GalleryModule } from "./presentation/gallery/gallery.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    BarbershopModule,
    ServiceModule,
    BarberModule,
    AppointmentModule,
    AvailabilityModule,
    ScheduleModule,
    AdminModule,
    UploadModule,
    ReportsModule,
    GalleryModule,
  ],
})
export class AppModule {}
