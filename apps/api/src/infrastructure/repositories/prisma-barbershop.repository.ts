import { Injectable } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";
import { IBarbershopRepository } from "../../domain/repositories";
import { Barbershop } from "../../domain/entities";

@Injectable()
export class PrismaBarbershopRepository implements IBarbershopRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Barbershop | null> {
    const row = await this.prisma.barbershop.findUnique({ where: { id } });
    return row ? this.toEntity(row) : null;
  }

  async findBySlug(slug: string): Promise<Barbershop | null> {
    const row = await this.prisma.barbershop.findUnique({ where: { slug } });
    return row ? this.toEntity(row) : null;
  }

  async findAll(): Promise<Barbershop[]> {
    const rows = await this.prisma.barbershop.findMany({
      orderBy: { createdAt: "desc" },
    });
    return rows.map(this.toEntity);
  }

  async create(
    data: Omit<Barbershop, "id" | "createdAt">,
  ): Promise<Barbershop> {
    const row = await this.prisma.barbershop.create({ data });
    return this.toEntity(row);
  }

  async update(id: string, data: Partial<Barbershop>): Promise<Barbershop> {
    const { id: _id, createdAt: _ca, ...rest } = data as Record<string, unknown>;
    const row = await this.prisma.barbershop.update({
      where: { id },
      data: rest,
    });
    return this.toEntity(row);
  }

  private toEntity(row: {
    id: string;
    name: string;
    slug: string;
    phone: string;
    address: string;
    logoUrl: string | null;
    coverUrl: string | null;
    isActive: boolean;
    createdAt: Date;
  }): Barbershop {
    return new Barbershop(
      row.id,
      row.name,
      row.slug,
      row.phone,
      row.address,
      row.logoUrl,
      row.coverUrl,
      row.isActive,
      row.createdAt,
    );
  }
}
