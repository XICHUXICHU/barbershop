import { Service } from "../entities";

export interface CreateServiceData {
  barbershopId: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  durationMinutes: number;
  priceAmount: number;
  priceCurrency: string;
  isActive: boolean;
}

export interface IServiceRepository {
  findById(id: string): Promise<Service | null>;
  findByBarbershop(barbershopId: string): Promise<Service[]>;
  create(data: CreateServiceData): Promise<Service>;
  update(id: string, data: Partial<Service>): Promise<Service>;
}

export const SERVICE_REPOSITORY = Symbol("IServiceRepository");
