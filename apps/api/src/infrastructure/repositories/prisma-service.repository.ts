import { Injectable } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";
import { IServiceRepository, CreateServiceData } from "../../domain/repositories";
import { Service } from "../../domain/entities";

@Injectable()
export class PrismaServiceRepository implements IServiceRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Service | null> {
    const row = await this.prisma.service.findUnique({ where: { id } });
    return row ? this.toEntity(row) : null;
  }

  async findByBarbershop(barbershopId: string): Promise<Service[]> {
    const rows = await this.prisma.service.findMany({
      where: { barbershopId },
      orderBy: { name: "asc" },
    });
    return rows.map(this.toEntity);
  }

  async create(data: CreateServiceData): Promise<Service> {
    const row = await this.prisma.service.create({ data });
    return this.toEntity(row);
  }

  async update(id: string, data: Partial<Service>): Promise<Service> {
    const { id: _id, ...rest } = data as Record<string, unknown>;
    const row = await this.prisma.service.update({
      where: { id },
      data: rest,
    });
    return this.toEntity(row);
  }

  private toEntity(row: {
    id: string;
    barbershopId: string;
    name: string;
    description: string | null;
    imageUrl: string | null;
    durationMinutes: number;
    priceAmount: number;
    priceCurrency: string;
    isActive: boolean;
  }): Service {
    return new Service(
      row.id,
      row.barbershopId,
      row.name,
      row.description,
      row.imageUrl,
      row.durationMinutes,
      row.priceAmount,
      row.priceCurrency,
      row.isActive,
    );
  }
}
