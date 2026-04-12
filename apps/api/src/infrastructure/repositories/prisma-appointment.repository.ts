import { Injectable } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";
import { IAppointmentRepository, CreateAppointmentData } from "../../domain/repositories";
import {
  Appointment,
  AppointmentStatus,
} from "../../domain/entities";
import { AppointmentStatus as PrismaStatus } from "@prisma/client";

const STATUS_TO_PRISMA: Record<AppointmentStatus, PrismaStatus> = {
  pending: PrismaStatus.PENDING,
  confirmed: PrismaStatus.CONFIRMED,
  completed: PrismaStatus.COMPLETED,
  cancelled: PrismaStatus.CANCELLED,
  no_show: PrismaStatus.NO_SHOW,
};

const STATUS_FROM_PRISMA: Record<PrismaStatus, AppointmentStatus> = {
  [PrismaStatus.PENDING]: "pending",
  [PrismaStatus.CONFIRMED]: "confirmed",
  [PrismaStatus.COMPLETED]: "completed",
  [PrismaStatus.CANCELLED]: "cancelled",
  [PrismaStatus.NO_SHOW]: "no_show",
};

@Injectable()
export class PrismaAppointmentRepository implements IAppointmentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Appointment | null> {
    const row = await this.prisma.appointment.findUnique({ where: { id } });
    return row ? this.toEntity(row) : null;
  }

  async findByBarbershopAndDate(
    barbershopId: string,
    date: Date,
  ): Promise<Appointment[]> {
    const rows = await this.prisma.appointment.findMany({
      where: {
        barbershopId,
        date,
        status: { notIn: [PrismaStatus.CANCELLED] },
      },
      orderBy: { startTime: "asc" },
    });
    return rows.map((r) => this.toEntity(r));
  }

  async findByBarberAndDate(
    barberId: string,
    date: Date,
  ): Promise<Appointment[]> {
    const rows = await this.prisma.appointment.findMany({
      where: {
        barberId,
        date,
        status: { notIn: [PrismaStatus.CANCELLED] },
      },
      orderBy: { startTime: "asc" },
    });
    return rows.map((r) => this.toEntity(r));
  }

  async create(
    data: CreateAppointmentData,
  ): Promise<Appointment> {
    const row = await this.prisma.appointment.create({
      data: {
        barbershopId: data.barbershopId,
        barberId: data.barberId,
        serviceId: data.serviceId,
        customerId: data.customerId,
        date: data.date,
        startTime: data.startTime,
        endTime: data.endTime,
        status: STATUS_TO_PRISMA[data.status],
        notes: data.notes,
      },
    });
    return this.toEntity(row);
  }

  async updateStatus(
    id: string,
    status: AppointmentStatus,
  ): Promise<Appointment> {
    const row = await this.prisma.appointment.update({
      where: { id },
      data: { status: STATUS_TO_PRISMA[status] },
    });
    return this.toEntity(row);
  }

  private toEntity(row: {
    id: string;
    barbershopId: string;
    barberId: string;
    serviceId: string;
    customerId: string;
    date: Date;
    startTime: string;
    endTime: string;
    status: PrismaStatus;
    notes: string | null;
    createdAt: Date;
  }): Appointment {
    return new Appointment(
      row.id,
      row.barbershopId,
      row.barberId,
      row.serviceId,
      row.customerId,
      row.date,
      row.startTime,
      row.endTime,
      STATUS_FROM_PRISMA[row.status],
      row.notes,
      row.createdAt,
    );
  }
}
