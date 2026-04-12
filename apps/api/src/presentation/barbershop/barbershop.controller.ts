import { Controller, Get, Post, Patch, Param, Body, Inject } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import {
  GetBarbershopBySlugUseCase,
  CreateBarbershopUseCase,
} from "../../application/use-cases";
import {
  BARBERSHOP_REPOSITORY,
  IBarbershopRepository,
} from "../../domain/repositories";
import { CreateBarbershopDto } from "./dto/create-barbershop.dto";

@ApiTags("Barbershops")
@Controller("barbershops")
export class BarbershopController {
  constructor(
    private readonly getBySlug: GetBarbershopBySlugUseCase,
    private readonly createBarbershop: CreateBarbershopUseCase,
    @Inject(BARBERSHOP_REPOSITORY)
    private readonly barbershopRepo: IBarbershopRepository,
  ) {}

  @Get()
  @ApiOperation({ summary: "List all barbershops (admin)" })
  async findAll() {
    return this.barbershopRepo.findAll();
  }

  @Get("by-owner/:ownerId")
  @ApiOperation({ summary: "List barbershops by owner (Clerk userId)" })
  async findByOwner(@Param("ownerId") ownerId: string) {
    return this.barbershopRepo.findByOwnerId(ownerId);
  }

  @Get("by-id/:id")
  @ApiOperation({ summary: "Get barbershop by ID" })
  async findById(@Param("id") id: string) {
    return this.barbershopRepo.findById(id);
  }

  @Get(":slug")
  @ApiOperation({ summary: "Get barbershop by slug (public)" })
  async findBySlug(@Param("slug") slug: string) {
    return this.getBySlug.execute(slug);
  }

  @Post()
  @ApiOperation({ summary: "Register a new barbershop" })
  async create(@Body() dto: CreateBarbershopDto) {
    return this.createBarbershop.execute(dto);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update barbershop details" })
  async update(@Param("id") id: string, @Body() body: Partial<CreateBarbershopDto>) {
    return this.barbershopRepo.update(id, body as any);
  }
}
