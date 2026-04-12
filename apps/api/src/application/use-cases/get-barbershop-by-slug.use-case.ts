import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import {
  BARBERSHOP_REPOSITORY,
  IBarbershopRepository,
} from "../../domain/repositories";
import { Barbershop } from "../../domain/entities";

@Injectable()
export class GetBarbershopBySlugUseCase {
  constructor(
    @Inject(BARBERSHOP_REPOSITORY)
    private readonly repo: IBarbershopRepository,
  ) {}

  async execute(slug: string): Promise<Barbershop> {
    const shop = await this.repo.findBySlug(slug);
    if (!shop) {
      throw new NotFoundException(`Barbershop "${slug}" not found`);
    }
    return shop;
  }
}
