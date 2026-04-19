import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { Inject } from "@nestjs/common";
import {
  BookAppointmentUseCase,
  CancelAppointmentUseCase,
} from "../../application/use-cases";
import {
  APPOINTMENT_REPOSITORY,
  IAppointmentRepository,
} from "../../domain/repositories";
import { PrismaService } from "../../infrastructure/database/prisma.service";
import { CreateAppointmentDto } from "./dto/create-appointment.dto";
import { ClerkAuthGuard } from "../../infrastructure/auth";

@ApiTags("Appointments")
@Controller("appointments")
export class AppointmentController {
  constructor(
    private readonly bookAppointment: BookAppointmentUseCase,
    private readonly cancelAppointment: CancelAppointmentUseCase,
    @Inject(APPOINTMENT_REPOSITORY)
    private readonly appointmentRepo: IAppointmentRepository,
    private readonly prisma: PrismaService,
  ) {}

  @Post()
  @ApiOperation({ summary: "Book a new appointment" })
  async create(@Body() dto: CreateAppointmentDto) {
    return this.bookAppointment.execute(dto);
  }

  @Get("barbershop/:barbershopId")
  @ApiOperation({ summary: "List appointments for a barbershop on a date" })
  async findByBarbershop(
    @Param("barbershopId") barbershopId: string,
    @Query("date") date: string,
  ) {
    return this.prisma.appointment.findMany({
      where: {
        barbershopId,
        date: new Date(date + "T00:00:00Z"),
      },
      include: {
        customer: true,
        service: true,
        barber: true,
      },
      orderBy: { startTime: "asc" },
    });
  }

  @Patch(":id/cancel")
  @UseGuards(ClerkAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Cancel an appointment" })
  async cancel(@Param("id") id: string) {
    return this.cancelAppointment.execute(id);
  }

  @Patch(":id/confirm")
  @UseGuards(ClerkAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Confirm an appointment" })
  async confirm(@Param("id") id: string) {
    return this.appointmentRepo.updateStatus(id, "confirmed");
  }

  @Patch(":id/complete")
  @UseGuards(ClerkAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Mark an appointment as completed" })
  async complete(@Param("id") id: string) {
    return this.appointmentRepo.updateStatus(id, "completed");
  }

  @Patch(":id/no-show")
  @UseGuards(ClerkAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Mark an appointment as no-show" })
  async noShow(@Param("id") id: string) {
    return this.appointmentRepo.updateStatus(id, "no_show");
  }
}
