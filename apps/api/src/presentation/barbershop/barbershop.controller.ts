import { Controller, Get, Post, Patch, Param, Body, Inject, UseGuards, ForbiddenException } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import {
  GetBarbershopBySlugUseCase,
  CreateBarbershopUseCase,
} from "../../application/use-cases";
import {
  BARBERSHOP_REPOSITORY,
  IBarbershopRepository,
} from "../../domain/repositories";
import { CreateBarbershopDto } from "./dto/create-barbershop.dto";
import { ClerkAuthGuard, CurrentUser } from "../../infrastructure/auth";

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
  @UseGuards(ClerkAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Register a new barbershop" })
  async create(@Body() dto: CreateBarbershopDto) {
    return this.createBarbershop.execute(dto);
  }

  @Patch(":id")
  @UseGuards(ClerkAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update barbershop details" })
  async update(
    @Param("id") id: string,
    @Body() body: Partial<CreateBarbershopDto>,
    @CurrentUser("userId") userId: string,
    @CurrentUser("role") role: string | null,
  ) {
    const shop = await this.barbershopRepo.findById(id);
    if (!shop || (shop.ownerId !== userId && role !== "admin")) {
      throw new ForbiddenException("No tienes permiso para editar esta barbería");
    }
    return this.barbershopRepo.update(id, body as any);
  }
}
