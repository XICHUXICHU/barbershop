import { Controller, Get, Param, Query, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { PrismaService } from "../../infrastructure/database/prisma.service";
import { ClerkAuthGuard } from "../../infrastructure/auth";

@ApiTags("Reports")
@ApiBearerAuth()
@UseGuards(ClerkAuthGuard)
@Controller("reports/barbershop")
export class ReportsController {
  constructor(private readonly prisma: PrismaService) {}

  /* ─── Summary KPIs ─── */
  @Get(":id/summary")
  @ApiOperation({ summary: "Summary KPIs for a barbershop" })
  async getSummary(@Param("id") id: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const [
      totalAppointments,
      completedThisMonth,
      completedLastMonth,
      cancelledThisMonth,
      noShowThisMonth,
      revenueThisMonth,
      revenueLastMonth,
      totalCustomers,
    ] = await Promise.all([
      this.prisma.appointment.count({ where: { barbershopId: id } }),
      this.prisma.appointment.count({
        where: { barbershopId: id, status: "COMPLETED", date: { gte: startOfMonth } },
      }),
      this.prisma.appointment.count({
        where: {
          barbershopId: id,
          status: "COMPLETED",
          date: { gte: startOfLastMonth, lte: endOfLastMonth },
        },
      }),
      this.prisma.appointment.count({
        where: { barbershopId: id, status: "CANCELLED", date: { gte: startOfMonth } },
      }),
      this.prisma.appointment.count({
        where: { barbershopId: id, status: "NO_SHOW", date: { gte: startOfMonth } },
      }),
      this.prisma.appointment.findMany({
        where: { barbershopId: id, status: "COMPLETED", date: { gte: startOfMonth } },
        include: { service: { select: { priceAmount: true } } },
      }),
      this.prisma.appointment.findMany({
        where: {
          barbershopId: id,
          status: "COMPLETED",
          date: { gte: startOfLastMonth, lte: endOfLastMonth },
        },
        include: { service: { select: { priceAmount: true } } },
      }),
      this.prisma.appointment.findMany({
        where: { barbershopId: id },
        select: { customerId: true },
        distinct: ["customerId"],
      }),
    ]);

    const revThisMonth = revenueThisMonth.reduce((s, a) => s + (a.service?.priceAmount ?? 0), 0);
    const revLastMonth = revenueLastMonth.reduce((s, a) => s + (a.service?.priceAmount ?? 0), 0);

    return {
      totalAppointments,
      completedThisMonth,
      completedLastMonth,
      cancelledThisMonth,
      noShowThisMonth,
      revenueThisMonth: revThisMonth,
      revenueLastMonth: revLastMonth,
      totalCustomers: totalCustomers.length,
    };
  }

  /* ─── Revenue over time (last 30 days) ─── */
  @Get(":id/revenue-daily")
  @ApiOperation({ summary: "Daily revenue for the last 30 days" })
  async getRevenueDays(@Param("id") id: string) {
    const since = new Date();
    since.setDate(since.getDate() - 30);

    const appointments = await this.prisma.appointment.findMany({
      where: { barbershopId: id, status: "COMPLETED", date: { gte: since } },
      include: { service: { select: { priceAmount: true } } },
      orderBy: { date: "asc" },
    });

    const map: Record<string, number> = {};
    for (const a of appointments) {
      const key = a.date.toISOString().split("T")[0];
      map[key] = (map[key] ?? 0) + (a.service?.priceAmount ?? 0);
    }

    // Fill missing days with 0
    const result: { date: string; revenue: number }[] = [];
    const cursor = new Date(since);
    const today = new Date();
    while (cursor <= today) {
      const key = cursor.toISOString().split("T")[0];
      result.push({ date: key, revenue: map[key] ?? 0 });
      cursor.setDate(cursor.getDate() + 1);
    }

    return result;
  }

  /* ─── Popular services ─── */
  @Get(":id/popular-services")
  @ApiOperation({ summary: "Most popular services (by completed appointments)" })
  async getPopularServices(@Param("id") id: string) {
    const rows = await this.prisma.appointment.groupBy({
      by: ["serviceId"],
      where: { barbershopId: id, status: "COMPLETED" },
      _count: { id: true },
    });

    const serviceIds = rows.map((r) => r.serviceId);
    const services = await this.prisma.service.findMany({
      where: { id: { in: serviceIds } },
      select: { id: true, name: true, priceAmount: true },
    });

    const svcMap = Object.fromEntries(services.map((s) => [s.id, s]));

    return rows
      .map((r) => ({
        serviceId: r.serviceId,
        name: svcMap[r.serviceId]?.name ?? "Desconocido",
        price: svcMap[r.serviceId]?.priceAmount ?? 0,
        count: r._count.id,
        revenue: (svcMap[r.serviceId]?.priceAmount ?? 0) * r._count.id,
      }))
      .sort((a, b) => b.count - a.count);
  }

  /* ─── Barber performance ─── */
  @Get(":id/barber-performance")
  @ApiOperation({ summary: "Appointment count per barber" })
  async getBarberPerformance(@Param("id") id: string) {
    const rows = await this.prisma.appointment.groupBy({
      by: ["barberId"],
      where: { barbershopId: id, status: "COMPLETED" },
      _count: { id: true },
    });

    const barberIds = rows.map((r) => r.barberId);
    const barbers = await this.prisma.barber.findMany({
      where: { id: { in: barberIds } },
      select: { id: true, name: true },
    });

    const bMap = Object.fromEntries(barbers.map((b) => [b.id, b.name]));

    return rows
      .map((r) => ({
        barberId: r.barberId,
        name: bMap[r.barberId] ?? "Desconocido",
        appointments: r._count.id,
      }))
      .sort((a, b) => b.appointments - a.appointments);
  }

  /* ─── Peak hours ─── */
  @Get(":id/peak-hours")
  @ApiOperation({ summary: "Busiest hours of the day" })
  async getPeakHours(@Param("id") id: string) {
    const appointments = await this.prisma.appointment.findMany({
      where: { barbershopId: id, status: { in: ["COMPLETED", "CONFIRMED", "PENDING"] } },
      select: { startTime: true },
    });

    const hourMap: Record<number, number> = {};
    for (const a of appointments) {
      const hour = parseInt(a.startTime.split(":")[0], 10);
      hourMap[hour] = (hourMap[hour] ?? 0) + 1;
    }

    return Array.from({ length: 24 }, (_, h) => ({
      hour: h,
      label: `${h.toString().padStart(2, "0")}:00`,
      count: hourMap[h] ?? 0,
    })).filter((h) => h.count > 0 || (h.hour >= 7 && h.hour <= 21));
  }

  /* ─── Status breakdown ─── */
  @Get(":id/status-breakdown")
  @ApiOperation({ summary: "Appointment status breakdown" })
  async getStatusBreakdown(@Param("id") id: string) {
    const rows = await this.prisma.appointment.groupBy({
      by: ["status"],
      where: { barbershopId: id },
      _count: { id: true },
    });

    return rows.map((r) => ({
      status: r.status,
      count: r._count.id,
    }));
  }
}
