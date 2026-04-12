import { Barber } from "../entities";

export interface IBarberRepository {
  findById(id: string): Promise<Barber | null>;
  findByBarbershop(barbershopId: string): Promise<Barber[]>;
  create(data: Omit<Barber, "id">): Promise<Barber>;
  update(id: string, data: Partial<Barber>): Promise<Barber>;
}

export const BARBER_REPOSITORY = Symbol("IBarberRepository");
