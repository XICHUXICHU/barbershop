import { Injectable } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";
import { ICustomerRepository } from "../../domain/repositories";
import { Customer } from "../../domain/entities";

@Injectable()
export class PrismaCustomerRepository implements ICustomerRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Customer | null> {
    const row = await this.prisma.customer.findUnique({ where: { id } });
    return row ? this.toEntity(row) : null;
  }

  async findByPhone(phone: string): Promise<Customer | null> {
    const row = await this.prisma.customer.findUnique({ where: { phone } });
    return row ? this.toEntity(row) : null;
  }

  async create(data: Omit<Customer, "id">): Promise<Customer> {
    const row = await this.prisma.customer.create({ data });
    return this.toEntity(row);
  }

  async upsertByPhone(data: Omit<Customer, "id">): Promise<Customer> {
    const row = await this.prisma.customer.upsert({
      where: { phone: data.phone },
      create: data,
      update: { name: data.name, email: data.email },
    });
    return this.toEntity(row);
  }

  private toEntity(row: {
    id: string;
    name: string;
    phone: string;
    email: string | null;
  }): Customer {
    return new Customer(row.id, row.name, row.phone, row.email);
  }
}
