import { Controller, Get, Put, Param, Body, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { PrismaService } from "../../infrastructure/database/prisma.service";
import { UpsertScheduleDto } from "./dto/upsert-schedule.dto";
import { ClerkAuthGuard } from "../../infrastructure/auth";

@ApiTags("Schedules")
@Controller("schedules")
export class ScheduleController {
  constructor(private readonly prisma: PrismaService) {}

  @Get("barbershop/:barbershopId")
  @ApiOperation({ summary: "Get weekly schedule for a barbershop" })
  async findByBarbershop(@Param("barbershopId") barbershopId: string) {
    return this.prisma.barbershopSchedule.findMany({
      where: { barbershopId },
      orderBy: { dayOfWeek: "asc" },
    });
  }

  @Put()
  @UseGuards(ClerkAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Upsert a day schedule for a barbershop" })
  async upsert(@Body() dto: UpsertScheduleDto) {
    return this.prisma.barbershopSchedule.upsert({
      where: {
        barbershopId_dayOfWeek: {
          barbershopId: dto.barbershopId,
          dayOfWeek: dto.dayOfWeek,
        },
      },
      create: {
        barbershopId: dto.barbershopId,
        dayOfWeek: dto.dayOfWeek,
        openTime: dto.openTime,
        closeTime: dto.closeTime,
        isOpen: dto.isOpen,
      },
      update: {
        openTime: dto.openTime,
        closeTime: dto.closeTime,
        isOpen: dto.isOpen,
      },
    });
  }
}
