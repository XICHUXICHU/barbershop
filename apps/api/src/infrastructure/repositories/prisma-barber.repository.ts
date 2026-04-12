import { Injectable } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";
import { IBarberRepository } from "../../domain/repositories";
import { Barber } from "../../domain/entities";

@Injectable()
export class PrismaBarberRepository implements IBarberRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Barber | null> {
    const row = await this.prisma.barber.findUnique({ where: { id } });
    return row ? this.toEntity(row) : null;
  }

  async findByBarbershop(barbershopId: string): Promise<Barber[]> {
    const rows = await this.prisma.barber.findMany({
      where: { barbershopId },
      orderBy: { name: "asc" },
    });
    return rows.map(this.toEntity);
  }

  async create(data: Omit<Barber, "id">): Promise<Barber> {
    const row = await this.prisma.barber.create({ data });
    return this.toEntity(row);
  }

  async update(id: string, data: Partial<Barber>): Promise<Barber> {
    const { id: _id, ...rest } = data as Record<string, unknown>;
    const row = await this.prisma.barber.update({
      where: { id },
      data: rest,
    });
    return this.toEntity(row);
  }

  private toEntity(row: {
    id: string;
    barbershopId: string;
    name: string;
    avatarUrl: string | null;
    isActive: boolean;
  }): Barber {
    return new Barber(
      row.id,
      row.barbershopId,
      row.name,
      row.avatarUrl,
      row.isActive,
    );
  }
}
