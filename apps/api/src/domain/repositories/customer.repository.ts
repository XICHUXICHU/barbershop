import { Customer } from "../entities";

export interface ICustomerRepository {
  findById(id: string): Promise<Customer | null>;
  findByPhone(phone: string): Promise<Customer | null>;
  create(data: Omit<Customer, "id">): Promise<Customer>;
  upsertByPhone(data: Omit<Customer, "id">): Promise<Customer>;
}

export const CUSTOMER_REPOSITORY = Symbol("ICustomerRepository");
