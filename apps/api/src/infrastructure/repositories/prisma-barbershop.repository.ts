import { Injectable } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";
import { IBarbershopRepository } from "../../domain/repositories";
import { Barbershop } from "../../domain/entities";

// Explicit type to avoid Prisma client cache issues
type BarbershopRow = {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  phone: string;
  address: string;
  logoUrl: string | null;
  coverUrl: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class PrismaBarbershopRepository implements IBarbershopRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Barbershop | null> {
    const row = await this.prisma.barbershop.findUnique({ where: { id } }) as BarbershopRow | null;
    return row ? this.toEntity(row) : null;
  }

  async findBySlug(slug: string): Promise<Barbershop | null> {
    const row = await this.prisma.barbershop.findUnique({ where: { slug } }) as BarbershopRow | null;
    return row ? this.toEntity(row) : null;
  }

  async findAll(): Promise<Barbershop[]> {
    const rows = await this.prisma.barbershop.findMany({
      orderBy: { createdAt: "desc" },
    }) as BarbershopRow[];
    return rows.map((r) => this.toEntity(r));
  }

  async findByOwnerId(ownerId: string): Promise<Barbershop[]> {
    const rows = await this.prisma.barbershop.findMany({
      where: { ownerId },
      orderBy: { createdAt: "desc" },
    }) as BarbershopRow[];
    return rows.map((r) => this.toEntity(r));
  }

  async create(
    data: Omit<Barbershop, "id" | "createdAt">,
  ): Promise<Barbershop> {
    const row = await this.prisma.barbershop.create({ data }) as BarbershopRow;
    return this.toEntity(row);
  }

  async update(id: string, data: Partial<Barbershop>): Promise<Barbershop> {
    const { id: _id, createdAt: _ca, ...rest } = data as Record<string, unknown>;
    const row = await this.prisma.barbershop.update({
      where: { id },
      data: rest,
    }) as BarbershopRow;
    return this.toEntity(row);
  }

  private toEntity(row: BarbershopRow): Barbershop {
    return new Barbershop(
      row.id,
      row.ownerId,
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
