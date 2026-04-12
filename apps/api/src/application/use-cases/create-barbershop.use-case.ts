import {
  Inject,
  Injectable,
  ConflictException,
} from "@nestjs/common";
import {
  BARBERSHOP_REPOSITORY,
  IBarbershopRepository,
} from "../../domain/repositories";
import { Barbershop } from "../../domain/entities";

export interface CreateBarbershopInput {
  name: string;
  slug: string;
  phone: string;
  address: string;
  logoUrl?: string | null;
  coverUrl?: string | null;
  isActive?: boolean;
}

@Injectable()
export class CreateBarbershopUseCase {
  constructor(
    @Inject(BARBERSHOP_REPOSITORY)
    private readonly repo: IBarbershopRepository,
  ) {}

  async execute(input: CreateBarbershopInput): Promise<Barbershop> {
    const existing = await this.repo.findBySlug(input.slug);
    if (existing) {
      throw new ConflictException(
        `Slug "${input.slug}" is already taken`,
      );
    }
    return this.repo.create({
      name: input.name,
      slug: input.slug,
      phone: input.phone,
      address: input.address,
      logoUrl: input.logoUrl ?? null,
      coverUrl: input.coverUrl ?? null,
      isActive: input.isActive ?? true,
    });
  }
}
