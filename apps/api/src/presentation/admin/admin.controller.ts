import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { PrismaService } from "../../infrastructure/database/prisma.service";
import { ClerkAuthGuard, Roles } from "../../infrastructure/auth";

@ApiTags("Admin")
@ApiBearerAuth()
@UseGuards(ClerkAuthGuard)
@Roles("admin")
@Controller("admin")
export class AdminController {
  constructor(private readonly prisma: PrismaService) {}

  @Get("stats")
  @ApiOperation({ summary: "Platform-wide statistics (super admin)" })
  async getStats() {
    const [
      totalBarbershops,
      totalBarbers,
      totalCustomers,
      totalAppointments,
      appointmentsToday,
    ] = await Promise.all([
      this.prisma.barbershop.count(),
      this.prisma.barber.count(),
      this.prisma.customer.count(),
      this.prisma.appointment.count(),
      this.prisma.appointment.count({
        where: {
          date: new Date(new Date().toISOString().split("T")[0] + "T00:00:00Z"),
        },
      }),
    ]);

    return {
      totalBarbershops,
      totalBarbers,
      totalCustomers,
      totalAppointments,
      appointmentsToday,
    };
  }

  @Get("barbershops")
  @ApiOperation({ summary: "List all barbershops with counts (super admin)" })
  async getAllBarbershops() {
    const shops = await this.prisma.barbershop.findMany({
      include: {
        _count: {
          select: {
            barbers: true,
            services: true,
            appointments: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return shops;
  }

  @Get("appointments/recent")
  @ApiOperation({ summary: "Recent appointments across all barbershops" })
  async getRecentAppointments() {
    return this.prisma.appointment.findMany({
      include: {
        barbershop: { select: { name: true, slug: true } },
        barber: { select: { name: true } },
        service: { select: { name: true, priceAmount: true } },
        customer: { select: { name: true, phone: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  }
}
