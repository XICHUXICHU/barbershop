import { Barbershop } from "../entities";

export interface IBarbershopRepository {
  findById(id: string): Promise<Barbershop | null>;
  findBySlug(slug: string): Promise<Barbershop | null>;
  findAll(): Promise<Barbershop[]>;
  findByOwnerId(ownerId: string): Promise<Barbershop[]>;
  create(data: Omit<Barbershop, "id" | "createdAt">): Promise<Barbershop>;
  update(id: string, data: Partial<Barbershop>): Promise<Barbershop>;
}

export const BARBERSHOP_REPOSITORY = Symbol("IBarbershopRepository");
